// controllers/bookingController.js
const Booking = require("../Models/bookingmodel");
const Apartment = require("../Models/apartmentmodel");

// =============== USER BOOKING FUNCTIONS ===============

// User books an apartment
const createBooking = async (req, res) => {
  try {
    const { apartmentId } = req.params;
    
    const apartment = await Apartment.findById(apartmentId);
    if (!apartment) {
      return res.status(404).json({ message: "Apartment not found" });
    }

    if (!apartment.availability) {
      return res.status(400).json({ message: "Apartment is not available for booking" });
    }

    // Check if user already has a pending/approved booking for this apartment
    const existingBooking = await Booking.findOne({
      user: req.user._id,
      apartment: apartmentId,
      status: { $in: ["pending", "approved"] }
    });

    if (existingBooking) {
      return res.status(400).json({ 
        message: "You already have a booking for this apartment" 
      });
    }

    const booking = await Booking.create({
      user: req.user._id,
      apartment: apartmentId,
      status: "pending"
    });

    // Update apartment availability
    apartment.availability = false;
    await apartment.save();

    // Populate apartment details in response
    const populatedBooking = await Booking.findById(booking._id)
      .populate("apartment", "location price category images")
      .populate("user", "name email");

    res.status(201).json({
      message: "Booking request submitted successfully",
      booking: populatedBooking
    });
  } catch (error) {
    console.error("Create booking error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// User views their bookings
const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate({
        path: "apartment",
        populate: {
          path: "agent",
          select: "name email phone"
        }
      })
      .sort({ createdAt: -1 });
    
    res.json(bookings);
  } catch (error) {
    console.error("Get user bookings error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// User cancels a booking
const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const booking = await Booking.findById(bookingId)
      .populate("apartment");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if user owns this booking
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to cancel this booking" });
    }

    // Update apartment availability
    const apartment = await Apartment.findById(booking.apartment._id);
    if (apartment) {
      apartment.availability = true;
      await apartment.save();
    }

    // Remove booking
    await booking.deleteOne();

    res.json({ 
      message: "Booking cancelled successfully" 
    });
  } catch (error) {
    console.error("Cancel booking error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// User gets booking by ID
const getBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const booking = await Booking.findById(bookingId)
      .populate({
        path: "apartment",
        populate: {
          path: "agent",
          select: "name email phone"
        }
      })
      .populate("user", "name email phone");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if user owns this booking or is admin/agent
    if (booking.user._id.toString() !== req.user._id.toString() && 
        req.user.role !== "admin" && req.user.role !== "agent") {
      return res.status(403).json({ message: "Not authorized to view this booking" });
    }

    res.json(booking);
  } catch (error) {
    console.error("Get booking by ID error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============== AGENT BOOKING FUNCTIONS ===============

// Agent views bookings for their apartments
const getAgentBookings = async (req, res) => {
  try {
    // Get agent's apartment IDs
    const agentApartments = await Apartment.find({ agent: req.user._id }).select("_id");
    const apartmentIds = agentApartments.map(apt => apt._id);

    const bookings = await Booking.find({ apartment: { $in: apartmentIds } })
      .populate("apartment", "location price category")
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });
    
    res.json(bookings);
  } catch (error) {
    console.error("Get agent bookings error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Agent updates booking status (approve/reject)
const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected", "cancelled"].includes(status)) {
      return res.status(400).json({ 
        message: "Invalid status. Must be 'approved', 'rejected', or 'cancelled'" 
      });
    }

    const booking = await Booking.findById(bookingId)
      .populate("apartment");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if apartment belongs to this agent
    const apartment = await Apartment.findById(booking.apartment._id);
    if (!apartment || apartment.agent.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this booking" });
    }

    booking.status = status;
    
    // If rejected or cancelled, make apartment available again
    if (status === "rejected" || status === "cancelled") {
      apartment.availability = true;
      await apartment.save();
    }
    
    await booking.save();

    res.json({
      message: `Booking ${status} successfully`,
      booking
    });
  } catch (error) {
    console.error("Update booking status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============== ADMIN BOOKING FUNCTIONS ===============

// Admin views all bookings
const getAllBookings = async (req, res) => {
  try {
    const { status, apartmentId, userId } = req.query;
    
    let filter = {};
    if (status) filter.status = status;
    if (apartmentId) filter.apartment = apartmentId;
    if (userId) filter.user = userId;

    const bookings = await Booking.find(filter)
      .populate("apartment", "location price category")
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });
    
    res.json(bookings);
  } catch (error) {
    console.error("Get all bookings error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin deletes a booking
const deleteBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const booking = await Booking.findById(bookingId)
      .populate("apartment");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Update apartment availability if booking was approved
    if (booking.status === "approved" && booking.apartment) {
      const apartment = await Apartment.findById(booking.apartment._id);
      if (apartment) {
        apartment.availability = true;
        await apartment.save();
      }
    }

    await booking.deleteOne();

    res.json({ 
      message: "Booking deleted successfully" 
    });
  } catch (error) {
    console.error("Delete booking error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin gets booking statistics
const getBookingStats = async (req, res) => {
  try {
    const [
      totalBookings,
      pendingBookings,
      approvedBookings,
      rejectedBookings,
      cancelledBookings
    ] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ status: "pending" }),
      Booking.countDocuments({ status: "approved" }),
      Booking.countDocuments({ status: "rejected" }),
      Booking.countDocuments({ status: "cancelled" })
    ]);

    res.json({
      totalBookings,
      pendingBookings,
      approvedBookings,
      rejectedBookings,
      cancelledBookings,
      approvalRate: totalBookings > 0 ? 
        Math.round((approvedBookings / totalBookings) * 100) : 0
    });
  } catch (error) {
    console.error("Get booking stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  // User functions
  createBooking,
  getUserBookings,
  cancelBooking,
  getBookingById,
  
  // Agent functions
  getAgentBookings,
  updateBookingStatus,
  
  // Admin functions
  getAllBookings,
  deleteBooking,
  getBookingStats
};