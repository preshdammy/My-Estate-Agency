// routes/analyticsRoutes.js
const express = require("express");
const {
  // Admin functions
  getDashboardAnalytics,
  getDetailedAnalytics,
  generateAnalytics,
  getUserAnalytics,
  getRevenueAnalytics
} = require("../Controllers/analyticsController");

const { protect, adminProtect } = require("../Middlewares/authMiddleware");

const router = express.Router();

// =============== ADMIN PROTECTED ROUTES ===============

// Admin gets dashboard analytics
router.get("/dashboard", protect, adminProtect, getDashboardAnalytics);

// Admin gets detailed analytics
router.get("/detailed", protect, adminProtect, getDetailedAnalytics);

// Admin generates analytics
router.post("/generate", protect, adminProtect, generateAnalytics);

// Admin gets user analytics
router.get("/users", protect, adminProtect, getUserAnalytics);

// Admin gets revenue analytics
router.get("/revenue", protect, adminProtect, getRevenueAnalytics);

module.exports = router;