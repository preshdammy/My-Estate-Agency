const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const Admin = require("../Models/adminmodel"); // Adjust the path if needed
require("dotenv").config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const email = "preciousdammy02@gmail.com";  // Change this if needed
    const password = "adminpassword";   // Change this if needed

    // Check if the admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      console.log("Admin already exists.");
      mongoose.disconnect();
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin
    const admin = new Admin({
      name: "Super Admin",
      email: email,
      password: hashedPassword,
    });

    await admin.save();
    console.log("Admin created successfully!");
    mongoose.disconnect();
  })
  .catch(err => console.error("Database connection error:", err));
