const jwt = require("jsonwebtoken");
const User = require("../Models/usermodel");
const Agent = require("../Models/agentmodel");
const Admin = require("../Models/adminModel");
require("dotenv").config();

const { Verifytoken } = require("../Utils/Token");

const protect = async (req, res, next) => {

  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {

    try {

      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      let user;

      if (decoded.role === "admin") {
        user = await Admin.findById(decoded.id).select("-password");
      } 
      else if (decoded.role === "agent") {
        user = await Agent.findById(decoded.id).select("-password");
      } 
      else {
        user = await User.findById(decoded.id).select("-password");
      }

      req.user = {
        ...user.toObject(),
        role: decoded.role
      };

      next();

    } catch (error) {

      console.log("TOKEN ERROR", error);
      res.status(401).json({ message: "Token failed" });

    }

  } else {

    console.log("NO TOKEN PROVIDED");
    res.status(401).json({ message: "No token" });

  }

};




// Middleware for Agents-only routes
const agentProtect = (req, res, next) => {


  if (!req.user || req.user.role !== "agent") {

    console.log("FAILED ROLE CHECK");

    return res.status(403).json({
      message: "Agent access only"
    });

  }

  if (req.user.status !== "approved") {

    console.log("FAILED STATUS CHECK", req.user.status);

    return res.status(403).json({
      message: "Agent verification required"
    });

  }

  next();

};


const adminProtect = (req, res, next) => {

  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }

  next();
};






module.exports = { protect, adminProtect, agentProtect };
