// controllers/agentController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Agent = require("../Models/agentmodel");
const Apartment = require("../Models/apartmentmodel");
const InspectionRequest = require("../Models/inspectionmodel");
const Booking = require("../Models/bookingmodel");

// ✅ Register a new agent
const registerAgent = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Validation
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if agent already exists
    const agentExists = await Agent.findOne({ email });
    if (agentExists) {
      return res.status(400).json({ 
        message: "Agent already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create agent
    const agent = await Agent.create({
      name,
      email,
      password: hashedPassword,
      phone,
      certificate: req.file ? req.file.path : null,
      status: "pending"
    });

    res.status(201).json({ 
      message: "Agent registered successfully. Please wait for admin approval.",
      agent: {
        id: agent._id,
        name: agent.name,
        email: agent.email,
        status: agent.status
      }
    });
  } catch (error) {
    console.error("Register agent error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

// ✅ Agent Login
const loginAgent = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find agent
    const agent = await Agent.findOne({ email });
    if (!agent) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, agent.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check if agent is approved
    if (agent.status !== "approved") {
      return res.status(403).json({ 
        message: `Your account is ${agent.status}. Please wait for admin approval.` 
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: agent._id, role: "agent" }, 
      process.env.JWT_SECRET, 
      { expiresIn: "30d" }
    );

    res.json({
      _id: agent._id,
      name: agent.name,
      email: agent.email,
      phone: agent.phone,
      status: agent.status,
      role: "agent",
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get Agent Profile
const getAgentProfile = async (req, res) => {
  try {
    const agent = await Agent.findById(req.user.id).select("-password");
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }
    res.json(agent);
  } catch (error) {
    console.error("Get agent profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Update Agent Profile
const updateAgentProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const agent = await Agent.findById(req.user.id);

    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    if (name) agent.name = name;
    if (phone) agent.phone = phone;

    await agent.save();

    res.json({
      message: "Profile updated successfully",
      agent: {
        id: agent._id,
        name: agent.name,
        email: agent.email,
        phone: agent.phone
      }
    });
  } catch (error) {
    console.error("Update agent profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get Agent Dashboard Stats
const getAgentDashboard = async (req, res) => {
  try {
    const agentId = req.user.id;

    const [
      totalApartments,
      availableApartments,
      pendingInspections,
      totalBookings
      
    ] = await Promise.all([
      Apartment.countDocuments({ agent: agentId }),
      Apartment.countDocuments({ agent: agentId, availability: true }),
      InspectionRequest.countDocuments({ 
        agent: agentId, 
        status: "pending" 
      }),
      Booking.countDocuments({ 
        apartment: { 
          $in: await Apartment.find({ agent: agentId }).select('_id') 
        }
      })
    ]);

    res.json({
      totalApartments,
      availableApartments,
      pendingInspections,
      totalBookings
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get Agent's Apartments
const getAgentApartments = async (req, res) => {
  try {
    const apartments = await Apartment.find({ agent: req.user.id })
      .sort({ createdAt: -1 });
    
    res.json(apartments);
  } catch (error) {
   console.error("Get agent apartments error:", error);
    res.status(500).json({ message: "Failed to fetch apartments" });
  }
};

// ✅ Create New Apartment
const createApartment = async (req, res) => {
  try {
    const { location, price, category, description, images } = req.body;

    if (!location || !price || !category || !description || !images) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const apartment = new Apartment({
      agent: req.user.id,
      location,
      price: parseFloat(price),
      category,
      description,
      images: images || [],
      availability: true
    });

    await apartment.save();

    res.status(201).json({
      message: "Apartment created successfully",
      apartment
    });
  } catch (error) {
     console.error("Create apartment error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Update Apartment
const updateApartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { location, price, category, description, images, availability } = req.body;

    const apartment = await Apartment.findById(id);
    if (!apartment) {
      return res.status(404).json({ message: "Apartment not found" });
    }

    // Check if agent owns this apartment
    if (apartment.agent.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this apartment" });
    }

    // Update fields
    if (location) apartment.location = location;
    if (price) apartment.price = parseFloat(price);
    if (category) apartment.category = category;
    if (description) apartment.description = description;
    if (images) apartment.images = images;
    if (availability !== undefined) apartment.availability = availability;

    await apartment.save();

    res.json({
      message: "Apartment updated successfully",
      apartment
    });
  } catch (error) {
    console.error("Update apartment error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Delete Apartment
const deleteApartment = async (req, res) => {
  try {
    const { id } = req.params;

    const apartment = await Apartment.findById(id);
    if (!apartment) {
      return res.status(404).json({ message: "Apartment not found" });
    }

    // Check if agent owns this apartment
    if (apartment.agent.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this apartment" });
    }

    await apartment.deleteOne();

    res.json({ message: "Apartment deleted successfully" });
  } catch (error) {
    console.error("Delete apartment error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get Agent's Inspection Requests
const getAgentInspections = async (req, res) => {
  try {
    const inspectionRequests = await InspectionRequest.find({ agent: req.user.id })
      .populate("user", "name email phone")
      .populate("apartment", "location price")
      .sort({ createdAt: -1 });

    res.json(inspectionRequests);
  } catch (error) {
    console.error("Get agent inspections error:", error);
    res.status(500).json({ message: "Failed to fetch inspection requests" });
  }
};

// ✅ Update Inspection Status
const updateInspectionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const inspection = await InspectionRequest.findById(id);
    if (!inspection) {
      return res.status(404).json({ message: "Inspection request not found" });
    }

    // Check if agent owns this inspection request
    if (inspection.agent.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this request" });
    }

    inspection.status = status;
    await inspection.save();

    res.json({
      message: `Inspection request ${status}`,
      inspection
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get Agent's Bookings
const getAgentBookings = async (req, res) => {
  try {
    // Get all apartments owned by this agent
    const agentApartments = await Apartment.find({ agent: req.user.id }).select('_id');
    const apartmentIds = agentApartments.map(apt => apt._id);

    const bookings = await Booking.find({ apartment: { $in: apartmentIds } })
      .populate("user", "name email phone")
      .populate("apartment", "location price category")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error("Get agent bookings error:", error);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id)
      .populate('apartment');

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if the apartment belongs to this agent
    const apartment = await Apartment.findById(booking.apartment._id);
    if (!apartment || apartment.agent.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this booking" });
    }

    booking.status = status;
    
    // If rejected, make apartment available again
    if (status === "rejected") {
      await Apartment.findByIdAndUpdate(booking.apartment._id, { availability: true });
    }
    
    await booking.save();
    
    res.json({ 
      message: `Booking ${status}`, 
      booking 
    });
  } catch (error) {
    console.error("Update booking status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  registerAgent,
  loginAgent,
  getAgentProfile,
  updateAgentProfile,
  getAgentDashboard,
  getAgentApartments,
  createApartment,
  updateApartment,
  deleteApartment,
  getAgentInspections,
  updateInspectionStatus,
  getAgentBookings,
  updateBookingStatus
};