// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getAllApartments,
  getApartmentById,
  bookApartment,
  getUserBookings,
  cancelBooking,
  submitReport,
  getUserReports,
  requestInspection,
  getUserInspections
} = require("../Controllers/userController");

const { protect } = require("../Middlewares/authMiddleware");

// Public Routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected User Routes
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);

// Apartment Routes
router.get("/apartments", protect, getAllApartments);
router.get("/apartments/:id", protect, getApartmentById);
router.post("/apartments/book", protect, bookApartment);

// Booking Routes
router.get("/bookings", protect, getUserBookings);
router.delete("/bookings/:id", protect, cancelBooking);

// Report Routes
router.post("/reports", protect, submitReport);
router.get("/reports", protect, getUserReports);

// Inspection Routes
router.post("/inspections/request", protect, requestInspection);
router.get("/inspections", protect, getUserInspections);

module.exports = router;