// Models/paymentmodel.js
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  apartment: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Apartment", 
    required: true 
  },
  booking: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Booking" 
  },
  amount: { 
    type: Number, 
    required: true,
    min: 0
  },
  paymentMethod: { 
    type: String, 
    enum: ["card", "bank_transfer", "mobile_money", "cash"], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ["pending", "completed", "failed", "refunded", "refund_pending", "cancelled"],
    default: "pending" 
  },
  currency: { 
    type: String, 
    default: "USD" 
  },
  transactionId: { 
    type: String, 
    unique: true 
  },
  paymentDetails: {
    cardLast4: String,
    bankName: String,
    mobileNumber: String,
    reference: String
  },
  refundRequested: {
    type: Boolean,
    default: false
  },
  refundReason: String,
  refundRequestedAt: Date,
  refundProcessedAt: Date,
  paidAt: Date,
  failedAt: Date,
  metadata: {
    type: Object,
    default: {}
  }
}, { 
  timestamps: true 
});

// Indexes for better query performance
paymentSchema.index({ user: 1, status: 1 });
paymentSchema.index({ apartment: 1 });
paymentSchema.index({ booking: 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Payment", paymentSchema);