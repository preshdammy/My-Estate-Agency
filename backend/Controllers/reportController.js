// controllers/reportController.js
const Report = require("../Models/reportmodel");
const Apartment = require("../Models/apartmentmodel");
const User = require("../Models/usermodel");
const Agent = require("../Models/agentmodel");

// =============== USER FUNCTIONS ===============

// User submits a report
const submitReport = async (req, res) => {
  try {
    const { apartmentId, message, reportType } = req.body;

    if (!apartmentId || !message) {
      return res.status(400).json({ 
        message: "Apartment ID and message are required" 
      });
    }

    // Validate apartment exists
    const apartment = await Apartment.findById(apartmentId);
    if (!apartment) {
      return res.status(404).json({ message: "Apartment not found" });
    }

    // Check if user has already submitted a similar report recently
    const recentReport = await Report.findOne({
      user: req.user._id,
      apartment: apartmentId,
      status: "open",
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Within 24 hours
    });

    if (recentReport) {
      return res.status(400).json({ 
        message: "You have already submitted a report for this apartment recently. Please wait 24 hours." 
      });
    }

    const report = await Report.create({
      user: req.user._id,
      apartment: apartmentId,
      message,
      reportType: reportType || "general",
      status: "open",
      priority: reportType === "fraud" || reportType === "safety" ? "high" : "medium"
    });

    // Populate details for response
    const populatedReport = await Report.findById(report._id)
      .populate('apartment', 'location price category')
      .populate('user', 'name email');

    res.status(201).json({
      message: "Report submitted successfully",
      report: populatedReport
    });
  } catch (error) {
    console.error("Submit report error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// User views their submitted reports
const getUserReports = async (req, res) => {
  try {
    const { status } = req.query;
    
    let filter = { user: req.user._id };
    if (status) filter.status = status;

    const reports = await Report.find(filter)
      .populate('apartment', 'location price category')
      .sort({ createdAt: -1 });
    
    res.json(reports);
  } catch (error) {
    console.error("Get user reports error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// User gets specific report details
const getReportById = async (req, res) => {
  try {
    const { reportId } = req.params;
    
    const report = await Report.findById(reportId)
      .populate('apartment', 'location price category agent')
      .populate('user', 'name email phone');

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Check if user owns this report or is admin
    if (report.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ 
        message: "Not authorized to view this report" 
      });
    }

    res.json(report);
  } catch (error) {
    console.error("Get report by ID error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============== AGENT FUNCTIONS ===============

// Agent views reports for their apartments
const getAgentReports = async (req, res) => {
  try {
    // Get agent's apartment IDs
    const agentApartments = await Apartment.find({ agent: req.user._id }).select('_id');
    const apartmentIds = agentApartments.map(apt => apt._id);

    const { status } = req.query;
    
    let filter = { apartment: { $in: apartmentIds } };
    if (status) filter.status = status;

    const reports = await Report.find(filter)
      .populate('user', 'name email phone')
      .populate('apartment', 'location price category')
      .sort({ priority: -1, createdAt: -1 }); // High priority first
    
    res.json(reports);
  } catch (error) {
    console.error("Get agent reports error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Agent responds to a report
const respondToReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { response } = req.body;

    if (!response) {
      return res.status(400).json({ message: "Response message is required" });
    }

    const report = await Report.findById(reportId)
      .populate('apartment');

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Check if apartment belongs to this agent
    const apartment = await Apartment.findById(report.apartment._id);
    if (!apartment || apartment.agent.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: "Not authorized to respond to this report" 
      });
    }

    report.agentResponse = response;
    report.respondedAt = new Date();
    report.status = "in_progress";

    await report.save();

    res.json({
      message: "Response submitted successfully",
      report
    });
  } catch (error) {
    console.error("Respond to report error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Agent marks report as resolved
const agentResolveReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { resolutionNotes } = req.body;

    const report = await Report.findById(reportId)
      .populate('apartment');

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Check if apartment belongs to this agent
    const apartment = await Apartment.findById(report.apartment._id);
    if (!apartment || apartment.agent.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: "Not authorized to resolve this report" 
      });
    }

    report.status = "resolved";
    report.resolutionNotes = resolutionNotes || "";
    report.resolvedAt = new Date();

    await report.save();

    res.json({
      message: "Report marked as resolved",
      report
    });
  } catch (error) {
    console.error("Agent resolve report error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============== ADMIN FUNCTIONS ===============

// Admin views all reports
const getAllReports = async (req, res) => {
  try {
    const { status, priority, reportType, agentId } = req.query;
    
    let filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (reportType) filter.reportType = reportType;
    if (agentId) {
      // Get apartments by agent and filter reports
      const agentApartments = await Apartment.find({ agent: agentId }).select('_id');
      const apartmentIds = agentApartments.map(apt => apt._id);
      filter.apartment = { $in: apartmentIds };
    }

    const reports = await Report.find(filter)
      .populate('user', 'name email phone')
      .populate('apartment', 'location price category')
      .populate({
        path: 'apartment',
        populate: {
          path: 'agent',
          select: 'name email phone'
        }
      })
      .sort({ priority: -1, createdAt: -1 });
    
    res.json(reports);
  } catch (error) {
    console.error("Get all reports error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin gets report statistics
const getReportStats = async (req, res) => {
  try {
    const [
      totalReports,
      openReports,
      inProgressReports,
      resolvedReports,
      fraudReports,
      safetyReports,
      conditionReports,
      highPriorityReports
    ] = await Promise.all([
      Report.countDocuments(),
      Report.countDocuments({ status: "open" }),
      Report.countDocuments({ status: "in_progress" }),
      Report.countDocuments({ status: "resolved" }),
      Report.countDocuments({ reportType: "fraud" }),
      Report.countDocuments({ reportType: "safety" }),
      Report.countDocuments({ reportType: "condition" }),
      Report.countDocuments({ priority: "high" })
    ]);

    res.json({
      totalReports,
      openReports,
      inProgressReports,
      resolvedReports,
      fraudReports,
      safetyReports,
      conditionReports,
      highPriorityReports,
      resolutionRate: totalReports > 0 ? 
        Math.round((resolvedReports / totalReports) * 100) : 0
    });
  } catch (error) {
    console.error("Get report stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin updates report priority
const updateReportPriority = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { priority } = req.body;

    if (!["low", "medium", "high"].includes(priority)) {
      return res.status(400).json({ 
        message: "Priority must be 'low', 'medium', or 'high'" 
      });
    }

    const report = await Report.findById(reportId);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    report.priority = priority;
    await report.save();

    res.json({
      message: "Report priority updated successfully",
      report
    });
  } catch (error) {
    console.error("Update report priority error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin assigns report to agent (if not auto-assigned)
const assignReportToAgent = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { agentId } = req.body;

    const report = await Report.findById(reportId)
      .populate('apartment');

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Check if agent exists
    const agent = await Agent.findById(agentId);
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    // Update the apartment's agent (or create a separate assignment field)
    const apartment = await Apartment.findById(report.apartment._id);
    if (apartment) {
      apartment.agent = agentId;
      await apartment.save();
    }

    report.status = "assigned";
    report.assignedTo = agentId;
    report.assignedAt = new Date();

    await report.save();

    res.json({
      message: "Report assigned to agent successfully",
      report
    });
  } catch (error) {
    console.error("Assign report error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin deletes a report
const deleteReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    
    const report = await Report.findById(reportId);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    await report.deleteOne();

    res.json({ 
      message: "Report deleted successfully" 
    });
  } catch (error) {
    console.error("Delete report error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin escalates report
const escalateReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { escalationNotes } = req.body;

    const report = await Report.findById(reportId);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    report.priority = "high";
    report.escalated = true;
    report.escalationNotes = escalationNotes || "";
    report.escalatedAt = new Date();

    await report.save();

    res.json({
      message: "Report escalated successfully",
      report
    });
  } catch (error) {
    console.error("Escalate report error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  // User functions
  submitReport,
  getUserReports,
  getReportById,
  
  // Agent functions
  getAgentReports,
  respondToReport,
  agentResolveReport,
  
  // Admin functions
  getAllReports,
  getReportStats,
  updateReportPriority,
  assignReportToAgent,
  deleteReport,
  escalateReport
};