// Models/reviewmodel.js
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
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
  agent: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Agent", 
    required: true 
  },
  rating: { 
    type: Number, 
    required: true,
    min: 1,
    max: 5
  },
  comment: { 
    type: String, 
    maxlength: 500 
  },
  images: [{ 
    type: String 
  }],
  agentResponse: {
    type: String,
    maxlength: 500
  },
  respondedAt: {
    type: Date
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  dislikes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  isVerifiedBooking: {
    type: Boolean,
    default: false
  },
  helpfulCount: {
    type: Number,
    default: 0
  }
}, { 
  timestamps: true 
});

// Prevent duplicate reviews from same user for same apartment
reviewSchema.index({ user: 1, apartment: 1 }, { unique: true });

// Indexes for better query performance
reviewSchema.index({ apartment: 1, rating: -1 });
reviewSchema.index({ agent: 1, rating: -1 });
reviewSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Review", reviewSchema);