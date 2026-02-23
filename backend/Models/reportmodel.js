const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
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
    subject: {                    // ← ADD THIS FIELD
      type: String,
      maxlength: 200,
      default: null
    },
    message: { 
      type: String, 
      required: true,
      maxlength: 1000
    },
    reportType: {
      type: String,
      enum: ["fraud", "safety", "condition", "noise", "maintenance", "other", "general"],
      default: "general"
    },
    status: { 
      type: String, 
      enum: ["open", "in_progress", "resolved", "closed", "assigned"],
      default: "open"               // ← Changed from "in_progress" to "open"
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],  // ← Added "urgent"
      default: "medium"
    },
    agentResponse: {
      type: String,
      maxlength: 1000
    },
    respondedAt: {
      type: Date
    },
    resolutionNotes: {
      type: String,
      maxlength: 1000
    },
    resolvedAt: {
      type: Date
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent"
    },
    assignedAt: {
      type: Date
    },
    escalated: {
      type: Boolean,
      default: false
    },
    escalationNotes: {
      type: String,
      maxlength: 500
    },
    escalatedAt: {
      type: Date
    }
  },
  { 
    timestamps: true 
  }
);

// Indexes for better query performance
reportSchema.index({ user: 1, status: 1 });
reportSchema.index({ apartment: 1 });
reportSchema.index({ status: 1, priority: -1 });
reportSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Report", reportSchema);