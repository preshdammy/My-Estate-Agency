// controllers/inspectionController.js
const InspectionRequest = require("../Models/inspectionmodel");
const Apartment = require("../Models/apartmentmodel");
const User = require("../Models/usermodel");
const Agent = require("../Models/agentmodel");

// =============== USER FUNCTIONS ===============

// User requests an inspection
const requestInspection = async (req, res) => {
  try {
    const { apartmentId, date, time, message } = req.body;

    if (!apartmentId || !date) {
      return res.status(400).json({ 
        message: "Apartment ID and inspection date are required" 
      });
    }

    const apartment = await Apartment.findById(apartmentId);
    if (!apartment) {
      return res.status(404).json({ message: "Apartment not found" });
    }

    if (!apartment.availability) {
      return res.status(400).json({ 
        message: "Apartment is not available for inspection" 
      });
    }

    // Check if user already has a pending inspection request for this apartment
    const existingRequest = await InspectionRequest.findOne({
      user: req.user._id,
      apartment: apartmentId,
      status: "pending"
    });

    if (existingRequest) {
      return res.status(400).json({ 
        message: "You already have a pending inspection request for this apartment" 
      });
    }

    // Check if the requested date is in the future
    const requestedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (requestedDate < today) {
      return res.status(400).json({ 
        message: "Inspection date must be in the future" 
      });
    }

    const inspectionRequest = new InspectionRequest({
      user: req.user._id,
      agent: apartment.agent,
      apartment: apartmentId,
      date: requestedDate,
      time: time || "10:00 AM",
      message: message || "",
      status: "pending"
    });

    await inspectionRequest.save();

    // Populate details for response
    const populatedRequest = await InspectionRequest.findById(inspectionRequest._id)
      .populate('apartment', 'location price category')
      .populate('agent', 'name email phone');

    res.status(201).json({
      message: "Inspection request submitted successfully",
      request: populatedRequest
    });
  } catch (error) {
    console.error("Request inspection error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// User views their inspection requests
const getUserInspections = async (req, res) => {
  try {
    const { status } = req.query;
    
    let filter = { user: req.user._id };
    if (status) filter.status = status;

    const inspections = await InspectionRequest.find(filter)
      .populate('apartment', 'location price category images')
      .populate('agent', 'name email phone')
      .sort({ date: -1 });
    
    res.json(inspections);
  } catch (error) {
    console.error("Get user inspections error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// User cancels an inspection request
const cancelInspectionRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    
    const inspectionRequest = await InspectionRequest.findById(requestId);

    if (!inspectionRequest) {
      return res.status(404).json({ message: "Inspection request not found" });
    }

    // Check if user owns this request
    if (inspectionRequest.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: "Not authorized to cancel this inspection request" 
      });
    }

    // Only allow cancellation of pending requests
    if (inspectionRequest.status !== "pending") {
      return res.status(400).json({ 
        message: "Cannot cancel a request that is already " + inspectionRequest.status 
      });
    }

    inspectionRequest.status = "cancelled";
    await inspectionRequest.save();

    res.json({ 
      message: "Inspection request cancelled successfully" 
    });
  } catch (error) {
    console.error("Cancel inspection error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// User reschedules an inspection
const rescheduleInspection = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { date, time } = req.body;

    if (!date) {
      return res.status(400).json({ message: "New date is required" });
    }

    const inspectionRequest = await InspectionRequest.findById(requestId);

    if (!inspectionRequest) {
      return res.status(404).json({ message: "Inspection request not found" });
    }

    // Check if user owns this request
    if (inspectionRequest.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: "Not authorized to reschedule this inspection request" 
      });
    }

    // Only allow rescheduling of pending requests
    if (inspectionRequest.status !== "pending") {
      return res.status(400).json({ 
        message: "Cannot reschedule a request that is already " + inspectionRequest.status 
      });
    }

    // Check if the new date is in the future
    const newDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (newDate < today) {
      return res.status(400).json({ 
        message: "New inspection date must be in the future" 
      });
    }

    inspectionRequest.date = newDate;
    if (time) inspectionRequest.time = time;
    inspectionRequest.status = "pending"; // Reset status for agent approval

    await inspectionRequest.save();

    const populatedRequest = await InspectionRequest.findById(requestId)
      .populate('apartment', 'location price category')
      .populate('agent', 'name email phone');

    res.json({
      message: "Inspection request rescheduled successfully",
      request: populatedRequest
    });
  } catch (error) {
    console.error("Reschedule inspection error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============== AGENT FUNCTIONS ===============

// Agent views inspection requests for their apartments
const getAgentInspections = async (req, res) => {
  try {
    const { status } = req.query;
    
    let filter = { agent: req.user._id };
    if (status) filter.status = status;

    const requests = await InspectionRequest.find(filter)
      .populate('user', 'name email phone')
      .populate('apartment', 'location price category')
      .sort({ date: 1 }); // Sort by upcoming dates first
    
    res.json(requests);
  } catch (error) {
    console.error("Get agent inspections error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Agent updates inspection status (approve/reject)
const updateInspectionStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, rejectionReason } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ 
        message: "Invalid status. Must be 'approved' or 'rejected'" 
      });
    }

    const inspectionRequest = await InspectionRequest.findById(requestId)
      .populate('apartment');

    if (!inspectionRequest) {
      return res.status(404).json({ message: "Inspection request not found" });
    }

    // Check if apartment belongs to this agent
    const apartment = await Apartment.findById(inspectionRequest.apartment._id);
    if (!apartment || apartment.agent.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: "Not authorized to update this inspection request" 
      });
    }

    // Store old status for comparison
    const oldStatus = inspectionRequest.status;
    
    inspectionRequest.status = status;
    
    // Add rejection reason if provided
    if (status === "rejected" && rejectionReason) {
      inspectionRequest.rejectionReason = rejectionReason;
    }
    
    await inspectionRequest.save();

    res.json({
      message: `Inspection request ${status} successfully`,
      request: inspectionRequest
    });
  } catch (error) {
    console.error("Update inspection status error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Agent completes an inspection (marks as done)
const completeInspection = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { notes, followUpRequired } = req.body;

    const inspectionRequest = await InspectionRequest.findById(requestId)
      .populate('apartment');

    if (!inspectionRequest) {
      return res.status(404).json({ message: "Inspection request not found" });
    }

    // Check if apartment belongs to this agent
    const apartment = await Apartment.findById(inspectionRequest.apartment._id);
    if (!apartment || apartment.agent.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: "Not authorized to complete this inspection" 
      });
    }

    if (inspectionRequest.status !== "approved") {
      return res.status(400).json({ 
        message: "Only approved inspections can be marked as completed" 
      });
    }

    inspectionRequest.status = "completed";
    inspectionRequest.completionNotes = notes || "";
    inspectionRequest.followUpRequired = followUpRequired || false;
    inspectionRequest.completedAt = new Date();

    await inspectionRequest.save();

    res.json({
      message: "Inspection marked as completed",
      request: inspectionRequest
    });
  } catch (error) {
    console.error("Complete inspection error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Agent gets inspection statistics
const getAgentInspectionStats = async (req, res) => {
  try {
    const agentId = req.user._id;
    
    const [
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      completedRequests,
      upcomingInspections
    ] = await Promise.all([
      InspectionRequest.countDocuments({ agent: agentId }),
      InspectionRequest.countDocuments({ agent: agentId, status: "pending" }),
      InspectionRequest.countDocuments({ agent: agentId, status: "approved" }),
      InspectionRequest.countDocuments({ agent: agentId, status: "rejected" }),
      InspectionRequest.countDocuments({ agent: agentId, status: "completed" }),
      InspectionRequest.countDocuments({ 
        agent: agentId, 
        status: "approved",
        date: { $gte: new Date() }
      })
    ]);

    res.json({
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      completedRequests,
      upcomingInspections,
      approvalRate: totalRequests > 0 ? 
        Math.round((approvedRequests / totalRequests) * 100) : 0
    });
  } catch (error) {
    console.error("Get agent inspection stats error:", error);
    res.status(500).json({ message: error.message });
  }
};

// =============== ADMIN FUNCTIONS ===============

// Admin views all inspection requests
const getAllInspections = async (req, res) => {
  try {
    const { status, agentId, userId } = req.query;
    
    let filter = {};
    if (status) filter.status = status;
    if (agentId) filter.agent = agentId;
    if (userId) filter.user = userId;

    const inspections = await InspectionRequest.find(filter)
      .populate('user', 'name email phone')
      .populate('agent', 'name email phone')
      .populate('apartment', 'location price category')
      .sort({ date: -1 });
    
    res.json(inspections);
  } catch (error) {
    console.error("Get all inspections error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin gets inspection statistics
const getInspectionStats = async (req, res) => {
  try {
    const [
      totalInspections,
      pendingInspections,
      approvedInspections,
      rejectedInspections,
      completedInspections,
      cancelledInspections
    ] = await Promise.all([
      InspectionRequest.countDocuments(),
      InspectionRequest.countDocuments({ status: "pending" }),
      InspectionRequest.countDocuments({ status: "approved" }),
      InspectionRequest.countDocuments({ status: "rejected" }),
      InspectionRequest.countDocuments({ status: "completed" }),
      InspectionRequest.countDocuments({ status: "cancelled" })
    ]);

    res.json({
      totalInspections,
      pendingInspections,
      approvedInspections,
      rejectedInspections,
      completedInspections,
      cancelledInspections,
      completionRate: totalInspections > 0 ? 
        Math.round((completedInspections / totalInspections) * 100) : 0
    });
  } catch (error) {
    console.error("Get inspection stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============== UTILITY FUNCTIONS ===============

// Get inspection by ID
const getInspectionById = async (req, res) => {
  try {
    const { requestId } = req.params;
    
    const inspectionRequest = await InspectionRequest.findById(requestId)
      .populate('user', 'name email phone')
      .populate('agent', 'name email phone')
      .populate('apartment', 'location price category images');

    if (!inspectionRequest) {
      return res.status(404).json({ message: "Inspection request not found" });
    }

    // Check authorization based on role
    let isAuthorized = false;
    
    if (req.user.role === "admin") {
      isAuthorized = true;
    } else if (req.user.role === "agent") {
      const apartment = await Apartment.findById(inspectionRequest.apartment._id);
      isAuthorized = apartment && apartment.agent.toString() === req.user._id.toString();
    } else if (req.user.role === "user") {
      isAuthorized = inspectionRequest.user._id.toString() === req.user._id.toString();
    }

    if (!isAuthorized) {
      return res.status(403).json({ 
        message: "Not authorized to view this inspection request" 
      });
    }

    res.json(inspectionRequest);
  } catch (error) {
    console.error("Get inspection by ID error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  // User functions
  requestInspection,
  getUserInspections,
  cancelInspectionRequest,
  rescheduleInspection,
  
  // Agent functions
  getAgentInspections,
  updateInspectionStatus,
  completeInspection,
  getAgentInspectionStats,
  
  // Admin functions
  getAllInspections,
  getInspectionStats,
  
  // Utility functions
  getInspectionById
};