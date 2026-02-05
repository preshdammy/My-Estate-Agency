// routes/inspectionRoutes.js
const express = require("express");
const {
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
} = require("../Controllers/inspectionController");

const { protect, agentProtect, adminProtect } = require("../Middlewares/authMiddleware");

const router = express.Router();

// =============== USER PROTECTED ROUTES ===============

// User requests an inspection
router.post("/request", protect, requestInspection);

// User gets their inspection requests
router.get("/my-inspections", protect, getUserInspections);

// User gets specific inspection request
router.get("/:requestId", protect, getInspectionById);

// User cancels inspection request
router.delete("/:requestId", protect, cancelInspectionRequest);

// User reschedules inspection
router.put("/:requestId/reschedule", protect, rescheduleInspection);

// =============== AGENT PROTECTED ROUTES ===============

// Agent gets inspection requests for their apartments
router.get("/agent/requests", protect, agentProtect, getAgentInspections);

// Agent updates inspection status
router.put("/agent/:requestId/status", protect, agentProtect, updateInspectionStatus);

// Agent completes an inspection
router.put("/agent/:requestId/complete", protect, agentProtect, completeInspection);

// Agent gets inspection statistics
router.get("/agent/stats", protect, agentProtect, getAgentInspectionStats);

// =============== ADMIN PROTECTED ROUTES ===============

// Admin gets all inspection requests
router.get("/admin/all", protect, adminProtect, getAllInspections);

// Admin gets inspection statistics
router.get("/admin/stats", protect, adminProtect, getInspectionStats);

module.exports = router;