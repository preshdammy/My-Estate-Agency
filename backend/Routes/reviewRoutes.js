// routes/reviewRoutes.js
const express = require("express");
const {
  // User functions
  submitReview,
  getUserReviews,
  updateReview,
  deleteReview,
  
  // Public functions
  getApartmentReviews,
  getAgentReviews,
  
  // Agent functions
  getAgentPropertyReviews,
  respondToReview,
  
  // Admin functions
  getAllReviews,
  adminDeleteReview
} = require("../Controllers/reviewController");

const { protect, agentProtect, adminProtect } = require("../Middlewares/authMiddleware");

const router = express.Router();

// =============== PUBLIC ROUTES ===============

// Get reviews for an apartment
router.get("/apartment/:apartmentId", getApartmentReviews);

// Get reviews for an agent
router.get("/agent/:agentId", getAgentReviews);

// =============== USER PROTECTED ROUTES ===============

// User submits a review
router.post("/", protect, submitReview);

// User gets their reviews
router.get("/my-reviews", protect, getUserReviews);

// User updates their review
router.put("/:reviewId", protect, updateReview);

// User deletes their review
router.delete("/:reviewId", protect, deleteReview);

// =============== AGENT PROTECTED ROUTES ===============

// Agent gets reviews for their properties
router.get("/agent/property-reviews", protect, agentProtect, getAgentPropertyReviews);

// Agent responds to a review
router.put("/agent/:reviewId/respond", protect, agentProtect, respondToReview);

// =============== ADMIN PROTECTED ROUTES ===============

// Admin gets all reviews
router.get("/admin/all", protect, adminProtect, getAllReviews);

// Admin deletes a review
router.delete("/admin/:reviewId", protect, adminProtect, adminDeleteReview);

module.exports = router;