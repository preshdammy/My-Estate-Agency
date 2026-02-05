// Models/notificationmodel.js
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  type: { 
    type: String, 
    enum: ["booking", "inspection", "report", "payment", "review", "system", "message", "alert"],
    required: true 
  },
  title: { 
    type: String, 
    required: true,
    maxlength: 100
  },
  message: { 
    type: String, 
    required: true,
    maxlength: 500
  },
  isRead: { 
    type: Boolean, 
    default: false 
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium"
  },
  relatedId: { 
    type: mongoose.Schema.Types.ObjectId 
  }, // bookingId, inspectionId, paymentId, etc.
  relatedModel: {
    type: String,
    enum: ["Booking", "InspectionRequest", "Payment", "Report", "Review", "Apartment"]
  },
  metadata: { 
    type: Object,
    default: {}
  },
  actionUrl: {
    type: String
  },
  expiresAt: {
    type: Date
  }
}, { 
  timestamps: true 
});

// Indexes for better query performance
notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired

module.exports = mongoose.model("Notification", notificationSchema);