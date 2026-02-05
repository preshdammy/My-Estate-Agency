// controllers/userController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../Models/usermodel");
const Apartment = require("../Models/apartmentmodel");
const Booking = require("../Models/bookingmodel");
const Report = require("../Models/reportmodel");
const InspectionRequest = require("../Models/inspectionmodel");

// =============== AUTHENTICATION ===============

const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    console.log("BODY:", req.body);


    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: "All fields are required as welll" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ 
      name, 
      email, 
      password: hashedPassword, 
      phone 
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, role: "user" }, 
      process.env.JWT_SECRET, 
      { expiresIn: "30d" }
    );

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// =============== PROFILE ===============

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone) user.phone = phone;

    await user.save();
    
    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============== APARTMENTS ===============

const getAllApartments = async (req, res) => {
  try {
    const { location, minPrice, maxPrice, category } = req.query;
    
    let filter = { availability: true };
    
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const apartments = await Apartment.find(filter)
      .populate('agent', 'name email phone')
      .sort({ createdAt: -1 });
    
    res.json(apartments);
  } catch (error) {
    console.error("Get apartments error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getApartmentById = async (req, res) => {
  try {
    const apartment = await Apartment.findById(req.params.id)
      .populate('agent', 'name email phone');
    
    if (!apartment) {
      return res.status(404).json({ message: "Apartment not found" });
    }
    
    res.json(apartment);
  } catch (error) {
    console.error("Get apartment by ID error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============== BOOKINGS ===============

const bookApartment = async (req, res) => {
  try {
    const { apartmentId } = req.body;
    
    if (!apartmentId) {
      return res.status(400).json({ message: "Apartment ID is required" });
    }

    const apartment = await Apartment.findById(apartmentId);
    if (!apartment) {
      return res.status(404).json({ message: "Apartment not found" });
    }

    if (!apartment.availability) {
      return res.status(400).json({ message: "Apartment is not available" });
    }

    const existingBooking = await Booking.findOne({
      user: req.user._id,
      apartment: apartmentId,
    });

    if (existingBooking) {
      return res.status(400).json({ message: "You have already booked this apartment" });
    }

    const booking = new Booking({
      user: req.user._id,
      apartment: apartmentId,
      status: "pending"
    });

    await booking.save();
    
    // Update apartment availability
    apartment.availability = false;
    await apartment.save();
    
    res.status(201).json({
      message: "Booking request submitted successfully",
      booking: {
        id: booking._id,
        apartment: booking.apartment,
        status: booking.status,
        createdAt: booking.createdAt
      }
    });
  } catch (error) {
    console.error("Book apartment error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate({
        path: 'apartment',
        populate: {
          path: 'agent',
          select: 'name email phone'
        }
      })
      .sort({ createdAt: -1 });
    
    res.json(bookings);
  } catch (error) {
    console.error("Get bookings error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to cancel this booking" });
    }

    // Update apartment availability
    await Apartment.findByIdAndUpdate(booking.apartment, { availability: true });
    
    await booking.deleteOne();
    
    res.json({ message: "Booking cancelled successfully" });
  } catch (error) {
    console.error("Cancel booking error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============== REPORTS ===============

const submitReport = async (req, res) => {
  try {
    const { apartmentId, message } = req.body;

    if (!apartmentId || !message) {
      return res.status(400).json({ message: "Apartment ID and message are required" });
    }

    const apartment = await Apartment.findById(apartmentId);
    if (!apartment) {
      return res.status(404).json({ message: "Apartment not found" });
    }

    const report = new Report({
      user: req.user._id,
      apartment: apartmentId,
      message,
      status: "open"
    });

    await report.save();
    
    res.status(201).json({
      message: "Report submitted successfully",
      report: {
        id: report._id,
        apartment: report.apartment,
        message: report.message,
        status: report.status
      }
    });
  } catch (error) {
    console.error("Submit report error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getUserReports = async (req, res) => {
  try {
    const reports = await Report.find({ user: req.user._id })
      .populate('apartment', 'location price category')
      .sort({ createdAt: -1 });
    
    res.json(reports);
  } catch (error) {
    console.error("Get reports error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============== INSPECTIONS ===============

const requestInspection = async (req, res) => {
  try {
    const { apartmentId, date, time } = req.body;

    if (!apartmentId || !date) {
      return res.status(400).json({ message: "Apartment ID and date are required" });
    }

    const apartment = await Apartment.findById(apartmentId);
    if (!apartment) {
      return res.status(404).json({ message: "Apartment not found" });
    }

    const inspection = new InspectionRequest({
      user: req.user._id,
      agent: apartment.agent,
      apartment: apartmentId,
      date: new Date(date),
      time: time || "10:00 AM",
      status: "pending"
    });

    await inspection.save();
    
    res.status(201).json({
      message: "Inspection request submitted successfully",
      inspection: {
        id: inspection._id,
        apartment: inspection.apartment,
        date: inspection.date,
        time: inspection.time,
        status: inspection.status
      }
    });
  } catch (error) {
    console.error("Request inspection error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getUserInspections = async (req, res) => {
  try {
    const inspections = await InspectionRequest.find({ user: req.user._id })
      .populate('apartment', 'location price category')
      .populate('agent', 'name email phone')
      .sort({ date: -1 });
    
    res.json(inspections);
  } catch (error) {
    console.error("Get inspections error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getAllApartments,
  getApartmentById,
  bookApartment,
  getUserBookings,
  cancelBooking,
  submitReport,
  getUserReports,
  requestInspection,
  getUserInspections
};