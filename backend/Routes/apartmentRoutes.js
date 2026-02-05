// routes/apartmentRoutes.js
const express = require("express");
const {
  // Public routes
  getAllApartments,
  getApartmentById,
  filterApartments,
  searchApartments,
  getApartmentsByAgent,
  
  // Agent routes
  getAgentApartments,
  createApartment,
  updateApartment,
  deleteApartment,
  
  // Admin routes
  getAllApartmentsAdmin,
  updateApartmentStatus
} = require("../Controllers/apartmentController");

const { protect, agentProtect, adminProtect } = require("../Middlewares/authMiddleware");

const router = express.Router();

// =============== PUBLIC ROUTES ===============

// Get all available apartments
router.get("/", getAllApartments);

// Get apartment by ID
router.get("/:id", getApartmentById);

// Filter apartments
router.get("/search/filter", filterApartments);

// Search apartments
router.get("/search/:q", searchApartments);

// Get apartments by agent ID
router.get("/agent/:agentId", getApartmentsByAgent);

// =============== AGENT PROTECTED ROUTES ===============

// Get agent's apartments
router.get("/agent/listings", protect, agentProtect, getAgentApartments);

// Create apartment
router.post("/", protect, agentProtect, createApartment);

// Update apartment
router.put("/:id", protect, agentProtect, updateApartment);

// Delete apartment
router.delete("/:id", protect, agentProtect, deleteApartment);

// =============== ADMIN PROTECTED ROUTES ===============

// Get all apartments (for admin)
router.get("/admin/all", protect, adminProtect, getAllApartmentsAdmin);

// Update apartment status
router.put("/admin/:id/status", protect, adminProtect, updateApartmentStatus);

module.exports = router;