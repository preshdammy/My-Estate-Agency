const Agent = require("../Models/agentmodel");
const Apartment = require("../Models/apartmentmodel");
const InspectionRequest = require("../Models/inspectionmodel");
const Booking = require("../Models/bookingmodel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// @desc    Register a new agent
// @route   POST /api/agents/register
// @access  Public
const registerAgent = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    
    // Check if agent exists
    const agentExists = await Agent.findOne({ email });
    if (agentExists) {
      return res.status(400).json({ message: "Agent already exists" });
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
      message: "Agent registered successfully. Pending admin approval.",
      agent: {
        id: agent._id,
        name: agent.name,
        email: agent.email,
        phone: agent.phone,
        status: agent.status
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Login agent
// @route   POST /api/agents/login
// @access  Public
const loginAgent = async (req, res) => {
  try {
    const { email, password } = req.body;

    const agent = await Agent.findOne({ email });
    if (!agent) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if agent is approved
    if (agent.status !== "approved") {
      return res.status(403).json({ 
        message: "Your account is pending approval or has been rejected" 
      });
    }

    const isMatch = await bcrypt.compare(password, agent.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: agent._id, role: "agent" },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: agent._id,
        name: agent.name,
        email: agent.email,
        phone: agent.phone,
        role: "agent"
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get agent profile
// @route   GET /api/agents/profile
// @access  Private/Agent
const getAgentProfile = async (req, res) => {
  try {
    const agent = await Agent.findById(req.user._id).select("-password");
    res.json(agent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update agent profile
// @route   PUT /api/agents/profile
// @access  Private/Agent
const updateAgentProfile = async (req, res) => {
  try {
    const agent = await Agent.findById(req.user._id);
    
    if (agent) {
      agent.name = req.body.name || agent.name;
      agent.phone = req.body.phone || agent.phone;
      
      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        agent.password = await bcrypt.hash(req.body.password, salt);
      }
      
      const updatedAgent = await agent.save();
      
      res.json({
        id: updatedAgent._id,
        name: updatedAgent.name,
        email: updatedAgent.email,
        phone: updatedAgent.phone
      });
    } else {
      res.status(404).json({ message: "Agent not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get agent dashboard stats
// @route   GET /api/agents/dashboard
// @access  Private/Agent
const getAgentDashboard = async (req, res) => {
  try {
    const agentId = req.user._id;
    
    const [totalApartments, pendingInspections, totalBookings] = await Promise.all([
      Apartment.countDocuments({ agent: agentId }),
      InspectionRequest.countDocuments({ agent: agentId, status: "pending" }),
      Booking.countDocuments({ 
        apartment: { $in: await Apartment.find({ agent: agentId }).distinct('_id') }
      })
    ]);

    res.json({
      totalApartments,
      pendingInspections,
      totalBookings,
      recentActivity: [] // You can add recent activity here
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get agent's apartments
// @route   GET /api/agents/apartments
// @access  Private/Agent
const getAgentApartments = async (req, res) => {
  try {
    const apartments = await Apartment.find({ agent: req.user._id })
      .sort({ createdAt: -1 });
    res.json(apartments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create apartment
// @route   POST /api/agents/apartments
// @access  Private/Agent
const createApartment = async (req, res) => {
  try {
    const { location, price, category, description, images } = req.body;
    
    const apartment = await Apartment.create({
      agent: req.user._id,
      location,
      price,
      category,
      description,
      images: images || []
    });

    res.status(201).json(apartment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update apartment
// @route   PUT /api/agents/apartments/:id
// @access  Private/Agent
const updateApartment = async (req, res) => {
  try {
    const apartment = await Apartment.findById(req.params.id);
    
    if (!apartment) {
      return res.status(404).json({ message: "Apartment not found" });
    }

    if (apartment.agent.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updatedApartment = await Apartment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedApartment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete apartment
// @route   DELETE /api/agents/apartments/:id
// @access  Private/Agent
const deleteApartment = async (req, res) => {
  try {
    const apartment = await Apartment.findById(req.params.id);
    
    if (!apartment) {
      return res.status(404).json({ message: "Apartment not found" });
    }

    if (apartment.agent.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await apartment.deleteOne();
    res.json({ message: "Apartment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get agent's inspection requests
// @route   GET /api/agents/inspections
// @access  Private/Agent
const getAgentInspections = async (req, res) => {
  try {
    const inspections = await InspectionRequest.find({ agent: req.user._id })
      .populate("user", "name email phone")
      .populate("apartment", "location price")
      .sort({ createdAt: -1 });
    
    res.json(inspections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update inspection status
// @route   PUT /api/agents/inspections/:id/status
// @access  Private/Agent
const updateInspectionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const inspection = await InspectionRequest.findById(req.params.id);
    
    if (!inspection) {
      return res.status(404).json({ message: "Inspection not found" });
    }

    if (inspection.agent.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    inspection.status = status;
    await inspection.save();

    res.json(inspection);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get agent's bookings
// @route   GET /api/agents/bookings
// @access  Private/Agent
const getAgentBookings = async (req, res) => {
  try {
    const agentApartments = await Apartment.find({ agent: req.user._id }).distinct('_id');
    const bookings = await Booking.find({ apartment: { $in: agentApartments } })
      .populate("user", "name email phone")
      .populate("apartment", "location price")
      .sort({ createdAt: -1 });
    
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
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