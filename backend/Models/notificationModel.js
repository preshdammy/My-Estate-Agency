// Models/notificationmodel.js
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  recipient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },

  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  role: {
    type: String,
    enum: ["user", "agent", "admin"],
    required: true
  },

  type: { 
    type: String, 
    enum: ["booking", "inspection", "report", "payment", "message", "system"],
    required: true 
  },

  title: String,
  message: String,

  isRead: { 
    type: Boolean, 
    default: false 
  },

  relatedId: mongoose.Schema.Types.ObjectId,
  relatedModel: String,

  createdAt: {
    type: Date,
    default: Date.now
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
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired

module.exports = mongoose.model("Notification", notificationSchema);