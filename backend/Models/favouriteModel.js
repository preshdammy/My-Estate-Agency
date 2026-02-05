// Models/favoritemodel.js
const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema({
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
  notes: {
    type: String,
    maxlength: 200
  },
  tags: [{
    type: String,
    maxlength: 20
  }]
}, { 
  timestamps: true 
});

// Prevent duplicate favorites
favoriteSchema.index({ user: 1, apartment: 1 }, { unique: true });

// Indexes for better query performance
favoriteSchema.index({ user: 1, createdAt: -1 });
favoriteSchema.index({ apartment: 1 });

module.exports = mongoose.model("Favorite", favoriteSchema);