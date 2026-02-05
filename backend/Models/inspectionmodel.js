// Models/inspectionmodel.js
const mongoose = require("mongoose");

const inspectionRequestSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  agent: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Agent", 
    required: true 
  },
  apartment: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Apartment", 
    required: true 
  },
  date: { 
    type: Date, 
    required: true 
  },
  time: { 
    type: String,
    default: "10:00 AM"
  },
  message: {
    type: String,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "completed", "cancelled"],
    default: "pending"
  },
  rejectionReason: {
    type: String,
    maxlength: 500
  },
  completionNotes: {
    type: String,
    maxlength: 1000
  },
  followUpRequired: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  }
}, { 
  timestamps: true 
});

// Index for faster queries
inspectionRequestSchema.index({ user: 1, status: 1 });
inspectionRequestSchema.index({ agent: 1, status: 1 });
inspectionRequestSchema.index({ apartment: 1 });
inspectionRequestSchema.index({ date: 1 });

module.exports = mongoose.model("InspectionRequest", inspectionRequestSchema);