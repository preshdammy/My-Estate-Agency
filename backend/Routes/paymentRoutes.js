// routes/paymentRoutes.js
const express = require("express");
const {
  // User functions
  createPayment,
  getUserPayments,
  getPaymentById,
  requestRefund,
  
  // Agent functions
  getAgentPayments,
  getAgentPaymentStats,
  
  // Admin functions
  getAllPayments,
  processRefund,
  getPaymentStats,
  deletePayment
} = require("../Controllers/paymentController");

const { protect, agentProtect, adminProtect } = require("../Middlewares/authMiddleware");

const router = express.Router();

// =============== USER PROTECTED ROUTES ===============

// User makes payment
router.post("/", protect, createPayment);

// User gets their payments
router.get("/my-payments", protect, getUserPayments);

// User gets specific payment
router.get("/:paymentId", protect, getPaymentById);

// User requests refund
router.post("/:paymentId/refund", protect, requestRefund);

// =============== AGENT PROTECTED ROUTES ===============

// Agent gets payments for their apartments
router.get("/agent/payments", protect, agentProtect, getAgentPayments);

// Agent gets payment statistics
router.get("/agent/stats", protect, agentProtect, getAgentPaymentStats);

// =============== ADMIN PROTECTED ROUTES ===============

// Admin gets all payments
router.get("/admin/all", protect, adminProtect, getAllPayments);

// Admin processes refund
router.put("/admin/:paymentId/refund", protect, adminProtect, processRefund);

// Admin gets payment statistics
router.get("/admin/stats", protect, adminProtect, getPaymentStats);

// Admin deletes payment
router.delete("/admin/:paymentId", protect, adminProtect, deletePayment);

module.exports = router;