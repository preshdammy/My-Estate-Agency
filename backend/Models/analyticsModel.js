// Models/analyticsmodel.js
const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema({
  date: { 
    type: Date, 
    required: true,
    index: true 
  },
  type: { 
    type: String, 
    enum: ["daily", "weekly", "monthly"],
    required: true 
  },
  metrics: {
    // User metrics
    newUsers: { type: Number, default: 0 },
    activeUsers: { type: Number, default: 0 },
    totalUsers: { type: Number, default: 0 },
    
    // Agent metrics
    newAgents: { type: Number, default: 0 },
    approvedAgents: { type: Number, default: 0 },
    pendingAgents: { type: Number, default: 0 },
    totalAgents: { type: Number, default: 0 },
    
    // Apartment metrics
    newApartments: { type: Number, default: 0 },
    availableApartments: { type: Number, default: 0 },
    bookedApartments: { type: Number, default: 0 },
    totalApartments: { type: Number, default: 0 },
    
    // Booking metrics
    newBookings: { type: Number, default: 0 },
    confirmedBookings: { type: Number, default: 0 },
    cancelledBookings: { type: Number, default: 0 },
    totalBookings: { type: Number, default: 0 },
    bookingRevenue: { type: Number, default: 0 },
    
    // Inspection metrics
    newInspections: { type: Number, default: 0 },
    completedInspections: { type: Number, default: 0 },
    totalInspections: { type: Number, default: 0 },
    
    // Report metrics
    newReports: { type: Number, default: 0 },
    resolvedReports: { type: Number, default: 0 },
    openReports: { type: Number, default: 0 },
    totalReports: { type: Number, default: 0 },
    
    // Payment metrics
    newPayments: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    averageTransaction: { type: Number, default: 0 },
    
    // Review metrics
    newReviews: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 }
  },
  breakdown: {
    // Category breakdown
    apartmentCategories: {
      type: Map,
      of: Number,
      default: {}
    },
    
    // Location breakdown
    popularLocations: {
      type: Map,
      of: Number,
      default: {}
    },
    
    // Price range breakdown
    priceRanges: {
      "0-500": { type: Number, default: 0 },
      "501-1000": { type: Number, default: 0 },
      "1001-2000": { type: Number, default: 0 },
      "2001+": { type: Number, default: 0 }
    }
  }
}, { 
  timestamps: true 
});

// Compound index for date and type queries
analyticsSchema.index({ date: 1, type: 1 });

module.exports = mongoose.model("Analytics", analyticsSchema);