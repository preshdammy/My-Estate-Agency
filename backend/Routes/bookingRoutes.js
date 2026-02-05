// routes/bookingRoutes.js
const express = require("express");
const {
  // User functions
  createBooking,
  getUserBookings,
  cancelBooking,
  getBookingById,
  
  // Agent functions
  getAgentBookings,
  updateBookingStatus,
  
  // Admin functions
  getAllBookings,
  deleteBooking,
  getBookingStats
} = require("../Controllers/bookingController");

const { protect, agentProtect, adminProtect } = require("../Middlewares/authMiddleware");

const router = express.Router();

// =============== USER PROTECTED ROUTES ===============

// User creates a booking
router.post("/apartment/:apartmentId", protect, createBooking);

// User gets their bookings
router.get("/my-bookings", protect, getUserBookings);

// User gets specific booking
router.get("/:bookingId", protect, getBookingById);

// User cancels their booking
router.delete("/:bookingId", protect, cancelBooking);

// =============== AGENT PROTECTED ROUTES ===============

// Agent gets bookings for their apartments
router.get("/agent/bookings", protect, agentProtect, getAgentBookings);

// Agent updates booking status
router.put("/agent/:bookingId/status", protect, agentProtect, updateBookingStatus);

// =============== ADMIN PROTECTED ROUTES ===============

// Admin gets all bookings
router.get("/admin/all", protect, adminProtect, getAllBookings);

// Admin deletes a booking
router.delete("/admin/:bookingId", protect, adminProtect, deleteBooking);

// Admin gets booking statistics
router.get("/admin/stats", protect, adminProtect, getBookingStats);

module.exports = router;