// controllers/paymentController.js
const Payment = require("../Models/paymentModel");
const Booking = require("../Models/bookingmodel");
const Apartment = require("../Models/apartmentmodel");
const User = require("../Models/usermodel");

// Generate unique transaction ID
const generateTransactionId = () => {
  return `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
};

// =============== USER FUNCTIONS ===============

// User makes payment for booking
const createPayment = async (req, res) => {
  try {
    const { bookingId, amount, paymentMethod, currency } = req.body;

    if (!bookingId || !amount || !paymentMethod) {
      return res.status(400).json({ 
        message: "Booking ID, amount, and payment method are required" 
      });
    }

    // Verify booking exists and belongs to user
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to pay for this booking" });
    }

    // Check if payment already exists for this booking
    const existingPayment = await Payment.findOne({ 
      booking: bookingId, 
      status: "completed" 
    });

    if (existingPayment) {
      return res.status(400).json({ 
        message: "Payment already completed for this booking" 
      });
    }

    // Create payment record
    const payment = await Payment.create({
      user: req.user._id,
      apartment: booking.apartment,
      booking: bookingId,
      amount: Number(amount),
      paymentMethod,
      currency: currency || "USD",
      transactionId: generateTransactionId(),
      status: "pending"
    });

    // Simulate payment processing (integrate with Stripe/PayPal in production)
    setTimeout(async () => {
      // In real app, this would be a webhook from payment gateway
      payment.status = "completed";
      payment.paidAt = new Date();
      
      // Update booking status
      booking.status = "confirmed";
      booking.paymentStatus = "paid";
      
      await Promise.all([payment.save(), booking.save()]);
    }, 2000);

    res.status(201).json({
      message: "Payment initiated successfully",
      payment: {
        id: payment._id,
        transactionId: payment.transactionId,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        paymentMethod: payment.paymentMethod
      }
    });
  } catch (error) {
    console.error("Create payment error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// User views their payment history
const getUserPayments = async (req, res) => {
  try {
    const { status } = req.query;
    
    let filter = { user: req.user._id };
    if (status) filter.status = status;

    const payments = await Payment.find(filter)
      .populate('apartment', 'location price category')
      .populate('booking')
      .sort({ createdAt: -1 });
    
    res.json(payments);
  } catch (error) {
    console.error("Get user payments error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// User gets payment details
const getPaymentById = async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    const payment = await Payment.findById(paymentId)
      .populate('user', 'name email')
      .populate('apartment', 'location price category')
      .populate('booking');

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Check authorization
    if (payment.user._id.toString() !== req.user._id.toString() && 
        req.user.role !== "admin" && req.user.role !== "agent") {
      return res.status(403).json({ message: "Not authorized to view this payment" });
    }

    res.json(payment);
  } catch (error) {
    console.error("Get payment by ID error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// User requests refund
const requestRefund = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { reason } = req.body;

    const payment = await Payment.findById(paymentId)
      .populate('booking');

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Check authorization
    if (payment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to request refund" });
    }

    // Check if payment is eligible for refund
    if (payment.status !== "completed") {
      return res.status(400).json({ 
        message: "Only completed payments can be refunded" 
      });
    }

    // Check if refund was already requested
    if (payment.refundRequested) {
      return res.status(400).json({ 
        message: "Refund already requested for this payment" 
      });
    }

    // Check time limit (within 7 days)
    const paymentDate = new Date(payment.paidAt);
    const daysSincePayment = (new Date() - paymentDate) / (1000 * 60 * 60 * 24);
    
    if (daysSincePayment > 7) {
      return res.status(400).json({ 
        message: "Refund can only be requested within 7 days of payment" 
      });
    }

    payment.refundRequested = true;
    payment.refundReason = reason || "";
    payment.refundRequestedAt = new Date();
    payment.status = "refund_pending";

    await payment.save();

    res.json({
      message: "Refund request submitted successfully",
      payment
    });
  } catch (error) {
    console.error("Request refund error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============== AGENT FUNCTIONS ===============

// Agent views payments for their apartments
const getAgentPayments = async (req, res) => {
  try {
    // Get agent's apartment IDs
    const agentApartments = await Apartment.find({ agent: req.user._id }).select('_id');
    const apartmentIds = agentApartments.map(apt => apt._id);

    const { status } = req.query;
    
    let filter = { apartment: { $in: apartmentIds } };
    if (status) filter.status = status;

    const payments = await Payment.find(filter)
      .populate('user', 'name email phone')
      .populate('apartment', 'location price category')
      .populate('booking')
      .sort({ createdAt: -1 });
    
    res.json(payments);
  } catch (error) {
    console.error("Get agent payments error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Agent gets payment statistics
const getAgentPaymentStats = async (req, res) => {
  try {
    // Get agent's apartment IDs
    const agentApartments = await Apartment.find({ agent: req.user._id }).select('_id');
    const apartmentIds = agentApartments.map(apt => apt._id);

    const [
      totalPayments,
      completedPayments,
      pendingPayments,
      failedPayments,
      totalRevenue,
      pendingRefunds
    ] = await Promise.all([
      Payment.countDocuments({ apartment: { $in: apartmentIds } }),
      Payment.countDocuments({ apartment: { $in: apartmentIds }, status: "completed" }),
      Payment.countDocuments({ apartment: { $in: apartmentIds }, status: "pending" }),
      Payment.countDocuments({ apartment: { $in: apartmentIds }, status: "failed" }),
      Payment.aggregate([
        { $match: { apartment: { $in: apartmentIds }, status: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      Payment.countDocuments({ 
        apartment: { $in: apartmentIds }, 
        refundRequested: true,
        status: "refund_pending"
      })
    ]);

    res.json({
      totalPayments,
      completedPayments,
      pendingPayments,
      failedPayments,
      totalRevenue: totalRevenue[0]?.total || 0,
      pendingRefunds,
      successRate: totalPayments > 0 ? 
        Math.round((completedPayments / totalPayments) * 100) : 0
    });
  } catch (error) {
    console.error("Get agent payment stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============== ADMIN FUNCTIONS ===============

// Admin views all payments
const getAllPayments = async (req, res) => {
  try {
    const { status, paymentMethod, startDate, endDate } = req.query;
    
    let filter = {};
    if (status) filter.status = status;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    
    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const payments = await Payment.find(filter)
      .populate('user', 'name email phone')
      .populate('apartment', 'location price category')
      .populate('booking')
      .sort({ createdAt: -1 });
    
    res.json(payments);
  } catch (error) {
    console.error("Get all payments error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin processes refund
const processRefund = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { action } = req.body; // "approve" or "reject"

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ 
        message: "Action must be 'approve' or 'reject'" 
      });
    }

    const payment = await Payment.findById(paymentId)
      .populate('booking');

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (!payment.refundRequested) {
      return res.status(400).json({ 
        message: "No refund request pending for this payment" 
      });
    }

    if (action === "approve") {
      payment.status = "refunded";
      payment.refundProcessedAt = new Date();
      
      // Update booking status if exists
      if (payment.booking) {
        const booking = await Booking.findById(payment.booking);
        if (booking) {
          booking.status = "cancelled";
          booking.paymentStatus = "refunded";
          await booking.save();
        }
      }
      
      // Make apartment available again
      const apartment = await Apartment.findById(payment.apartment);
      if (apartment) {
        apartment.availability = true;
        await apartment.save();
      }
    } else {
      payment.refundRequested = false;
      payment.status = "completed";
    }

    await payment.save();

    res.json({
      message: `Refund ${action === "approve" ? "approved" : "rejected"} successfully`,
      payment
    });
  } catch (error) {
    console.error("Process refund error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin gets payment statistics
const getPaymentStats = async (req, res) => {
  try {
    const [
      totalPayments,
      completedPayments,
      pendingPayments,
      failedPayments,
      refundedPayments,
      totalRevenue,
      revenueByMonth,
      popularPaymentMethods
    ] = await Promise.all([
      Payment.countDocuments(),
      Payment.countDocuments({ status: "completed" }),
      Payment.countDocuments({ status: "pending" }),
      Payment.countDocuments({ status: "failed" }),
      Payment.countDocuments({ status: "refunded" }),
      Payment.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      Payment.aggregate([
        { 
          $match: { 
            status: "completed",
            createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) }
          } 
        },
        { 
          $group: { 
            _id: { 
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" }
            }, 
            total: { $sum: "$amount" },
            count: { $sum: 1 }
          } 
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]),
      Payment.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: "$paymentMethod", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    res.json({
      totalPayments,
      completedPayments,
      pendingPayments,
      failedPayments,
      refundedPayments,
      totalRevenue: totalRevenue[0]?.total || 0,
      revenueByMonth,
      popularPaymentMethods,
      successRate: totalPayments > 0 ? 
        Math.round((completedPayments / totalPayments) * 100) : 0
    });
  } catch (error) {
    console.error("Get payment stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin deletes payment (for cleanup)
const deletePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    await payment.deleteOne();

    res.json({ 
      message: "Payment deleted successfully" 
    });
  } catch (error) {
    console.error("Delete payment error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
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
};