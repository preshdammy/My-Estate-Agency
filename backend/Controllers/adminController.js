// controllers/adminController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../Models/adminModel");
const Agent = require("../Models/agentmodel");
const Apartment = require("../Models/apartmentmodel");
const Report = require("../Models/reportmodel");
const Booking = require("../Models/bookingmodel");
const User = require("../Models/usermodel");

// ✅ Admin Registration
const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ 
      message: "Admin created successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Admin Login
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Check if admin exists
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate token
    const token = jwt.sign(
      { id: admin._id, role: "admin" }, 
      process.env.JWT_SECRET, 
      { expiresIn: "30d" }
    );

    res.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: "admin",
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get Admin Profile
const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select("-password");
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.json(admin);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Admin Dashboard Stats
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalAgents,
      pendingAgents,
      totalApartments,
      totalUsers,
      pendingReports
    ] = await Promise.all([
      Agent.countDocuments(),
      Agent.countDocuments({ status: "pending" }),
      Apartment.countDocuments(),
      User.countDocuments(),
      Report.countDocuments({ status: "open" })
    ]);

    res.json({
      totalAgents,
      pendingAgents,
      totalApartments,
      totalUsers,
      pendingReports
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get All Agents
const getAllAgents = async (req, res) => {
  try {
    const agents = await Agent.find().select("-password");
    res.json(agents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch agents" });
  }
};

// ✅ Get Pending Agents
const getPendingAgents = async (req, res) => {
  try {
    const pendingAgents = await Agent.find({ status: "pending" }).select("-password");
    res.json(pendingAgents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch pending agents" });
  }
};

// ✅ Approve/Reject Agent
const updateAgentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Use 'approved' or 'rejected'" });
    }

    const agent = await Agent.findById(id);
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    agent.status = status;
    await agent.save();

    res.json({ 
      message: `Agent ${status} successfully`, 
      agent: {
        id: agent._id,
        name: agent.name,
        email: agent.email,
        status: agent.status
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Delete Agent
const deleteAgent = async (req, res) => {
  try {
    const { id } = req.params;

    const agent = await Agent.findById(id);
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    // Check if agent has apartments
    const agentApartments = await Apartment.countDocuments({ agent: id });
    if (agentApartments > 0) {
      return res.status(400).json({ 
        message: "Cannot delete agent with active apartments. Reject instead." 
      });
    }

    await agent.deleteOne();
    res.json({ message: "Agent deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete agent" });
  }
};

// ✅ Get All Apartments
const getAllApartments = async (req, res) => {
  try {
    const apartments = await Apartment.find()
      .populate("agent", "name email status")
      .sort({ createdAt: -1 });

    res.json(apartments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch apartments" });
  }
};

// ✅ Get All Users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

// ✅ Get All Reports
const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("user", "name email")
      .populate("apartment", "location price")
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch reports" });
  }
};

// ✅ Update Report Status
const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["open", "resolved"].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Use 'open' or 'resolved'" });
    }

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    report.status = status;
    await report.save();

    res.json({ message: "Report status updated successfully", report });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get Apartment Applicants
const getApartmentApplicants = async (req, res) => {
  try {
    const { apartmentId } = req.query;

    let bookings;
    if (apartmentId) {
      // Get applicants for specific apartment
      bookings = await Booking.find({ apartment: apartmentId })
        .populate("user", "name email phone")
        .populate("apartment", "location price");
    } else {
      // Get all applicants
      bookings = await Booking.find()
        .populate("user", "name email phone")
        .populate("apartment", "location price")
        .populate({
          path: "apartment",
          populate: {
            path: "agent",
            select: "name"
          }
        });
    }

    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch applicants" });
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  getDashboardStats,
  getAllAgents,
  getPendingAgents,
  updateAgentStatus,
  deleteAgent,
  getAllApartments,
  getAllUsers,
  getAllReports,
  updateReportStatus,
  getApartmentApplicants
};