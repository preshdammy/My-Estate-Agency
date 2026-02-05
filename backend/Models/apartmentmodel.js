const mongoose = require("mongoose");

const apartmentSchema = new mongoose.Schema(
  {
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent",
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      enum: ['Studio', '1-Bedroom', '2-Bedroom', 'Duplex'],
      required: true
    },
    description: {
      type: String,
      required: true,
    },
    images: [{ type: String }], // Array of image URLs
    availability: {
      type: Boolean,
      default: true,
    },
     averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    totalViews: {
      type: Number,
      default: 0
    },
    totalBookings: {
      type: Number,
      default: 0
    },
    featured: {
      type: Boolean,
      default: false
    },
    amenities: [{
      type: String
    }],
    size: {
      type: Number, // square feet or meters
      min: 0
    },
    bedrooms: {
      type: Number,
      min: 0
    },
    bathrooms: {
      type: Number,
      min: 0
    },
    yearBuilt: {
      type: Number
    },
    parking: {
      type: Boolean,
      default: false
    },
    furnished: {
      type: Boolean,
      default: false
    },
    petFriendly: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const Apartment = mongoose.model("Apartment", apartmentSchema);
module.exports = Apartment;


