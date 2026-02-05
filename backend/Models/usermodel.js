const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    role: { type: String, default: "user" }, // Roles: user, admin, agent
     profileImage: {
      type: String
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    dateOfBirth: {
      type: Date
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    isPhoneVerified: {
      type: Boolean,
      default: false
    },
    preferences: {
      notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        push: { type: Boolean, default: true }
      },
      newsletter: {
        type: Boolean,
        default: true
      }
    },
    lastLogin: {
      type: Date
    },
    loginCount: {
      type: Number,
      default: 0
    },
  },
 
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);


