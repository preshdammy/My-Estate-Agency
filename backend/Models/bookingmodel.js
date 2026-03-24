// Models/bookingmodel.js
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
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

    status: { 
      type: String, 
      enum: [
        "pending",
        "approved",
        "confirmed",
        "completed",
        "rejected",
        "cancelled"
      ],
      default: "pending"
    },

    notes: {
      type: String,
      maxlength: 500
    },

    // Booking timeline
    approvedAt: {
      type: Date
    },

    confirmedAt: {
      type: Date
    },

    completedAt: {
      type: Date
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded", "failed"],
      default: "pending"
    },

    paymentAmount: {
      type: Number,
      min: 0
    },

    paymentDate: {
      type: Date
    },

    checkInDate: {
      type: Date
    },

    checkOutDate: {
      type: Date
    },

    duration: {
      type: Number,
      min: 1
    }
  },
  { timestamps: true }
);

// Prevent duplicate active bookings
bookingSchema.index(
  { user: 1, apartment: 1, status: 1 }
);

module.exports = mongoose.model("Booking", bookingSchema);