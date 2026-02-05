const express = require("express");
const router = express.Router();
const {
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
} = require("../Controllers/adminController");

const { protect, adminProtect } = require("../Middlewares/authMiddleware");

// Public routes
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

// Protected Admin Routes
router.get("/profile", protect, adminProtect, getAdminProfile);
router.get("/dashboard", protect, adminProtect, getDashboardStats);

// Agent Management
router.get("/agents", protect, adminProtect, getAllAgents);
router.get("/agents/pending", protect, adminProtect, getPendingAgents);
router.put("/agents/:id/status", protect, adminProtect, updateAgentStatus);
router.delete("/agents/:id", protect, adminProtect, deleteAgent);

// Apartment Management
router.get("/apartments", protect, adminProtect, getAllApartments);
router.get("/apartments/applicants", protect, adminProtect, getApartmentApplicants);

// User Management
router.get("/users", protect, adminProtect, getAllUsers);

// Report Management
router.get("/reports", protect, adminProtect, getAllReports);
router.put("/reports/:id/status", protect, adminProtect, updateReportStatus);

module.exports = router;

