const mongoose = require("mongoose");

const agentSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  phone: String,
  certificate: String,
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  companyName: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  website: String,
  socialMedia: {
    facebook: String,
    twitter: String,
    linkedin: String,
    instagram: String
  },
  bio: {
    type: String,
    maxlength: 1000
  },
  experienceYears: {
    type: Number,
    min: 0
  },
  specialization: [{
    type: String
  }],
  languages: [{
    type: String
  }],
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
  totalProperties: {
    type: Number,
    default: 0
  },
  verified: {
    type: Boolean,
    default: false
  },
  featured: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model("Agent", agentSchema);



