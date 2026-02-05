// routes/agentRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
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
  getAgentBookings
} = require("../Controllers/agentController");

const { protect, agentProtect } = require("../Middlewares/authMiddleware");

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, JPG, and PDF are allowed.'));
    }
  }
});

// Public Routes
router.post("/register", upload.single("certificate"), registerAgent);
router.post("/login", loginAgent);

// Protected Agent Routes
router.get("/profile", protect, agentProtect, getAgentProfile);
router.put("/profile", protect, agentProtect, updateAgentProfile);
router.get("/dashboard", protect, agentProtect, getAgentDashboard);

// Apartment Management
router.get("/apartments", protect, agentProtect, getAgentApartments);
router.post("/apartments", protect, agentProtect, createApartment);
router.put("/apartments/:id", protect, agentProtect, updateApartment);
router.delete("/apartments/:id", protect, agentProtect, deleteApartment);

// Inspection Management
router.get("/inspections", protect, agentProtect, getAgentInspections);
router.put("/inspections/:id/status", protect, agentProtect, updateInspectionStatus);

// Booking Management
router.get("/bookings", protect, agentProtect, getAgentBookings);

module.exports = router;