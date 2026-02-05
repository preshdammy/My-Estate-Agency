// routes/reportRoutes.js
const express = require("express");
const {
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
} = require("../Controllers/reportController");

const { protect, agentProtect, adminProtect } = require("../Middlewares/authMiddleware");

const router = express.Router();

// =============== USER PROTECTED ROUTES ===============

// User submits a report
router.post("/", protect, submitReport);

// User gets their reports
router.get("/my-reports", protect, getUserReports);

// User gets specific report
router.get("/:reportId", protect, getReportById);

// =============== AGENT PROTECTED ROUTES ===============

// Agent gets reports for their apartments
router.get("/agent/reports", protect, agentProtect, getAgentReports);

// Agent responds to a report
router.put("/agent/:reportId/respond", protect, agentProtect, respondToReport);

// Agent marks report as resolved
router.put("/agent/:reportId/resolve", protect, agentProtect, agentResolveReport);

// =============== ADMIN PROTECTED ROUTES ===============

// Admin gets all reports
router.get("/admin/all", protect, adminProtect, getAllReports);

// Admin gets report statistics
router.get("/admin/stats", protect, adminProtect, getReportStats);

// Admin updates report priority
router.put("/admin/:reportId/priority", protect, adminProtect, updateReportPriority);

// Admin assigns report to agent
router.put("/admin/:reportId/assign", protect, adminProtect, assignReportToAgent);

// Admin escalates report
router.put("/admin/:reportId/escalate", protect, adminProtect, escalateReport);

// Admin deletes a report
router.delete("/admin/:reportId", protect, adminProtect, deleteReport);

module.exports = router;