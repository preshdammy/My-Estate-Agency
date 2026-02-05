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
      } else if (decoded.role === "agent") {
        user = await Agent.findById(decoded.id).select("-password");
      } else {
        user = await User.findById(decoded.id).select("-password");
      }

      if (!user) {
        return res.status(401).json({ message: `${decoded.role} not found` });
      }

      req.user = user;
      req.role = decoded.role;
      next();

    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Token failed" });
    }
  } else {
    res.status(401).json({ message: "No token, authorization denied" });
  }
};




// Middleware for Agents-only routes
const agentProtect = async (req, res, next) => {
  if (req.user && req.user.status === "approved") {
    next();
  } else {
    res.status(403).json({ message: "Agent verification required" });
  }
};


const adminProtect = (req, res, next) => {
  if (req.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};






module.exports = { protect, adminProtect, agentProtect };
