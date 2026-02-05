const express = require("express")
const app = express()
const connect = require("./DbConfig/dbconnect")
require('dotenv').config()
const cors = require("cors")
const path = require("path");
const userRoutes = require("./Routes/userroutes");
const agentRoutes = require("./Routes/agentRoutes");
const adminRoutes = require("./Routes/adminRoutes");
const inspectionRoutes = require("./Routes/inspectionRoutes");
const apartmentRoutes = require("./Routes/apartmentroutes")
const bookingRoutes = require("./Routes/bookingRoutes");
const reportRoutes = require("./Routes/reportRoutes");
const paymentRoutes = require("./Routes/paymentRoutes");
const reviewRoutes = require("./Routes/reviewRoutes");
const notificationRoutes = require("./Routes/notificationRoutes");
const favoriteRoutes = require("./Routes/favouriteRoutes");
const analyticsRoutes = require("./Routes/analyticsRoutes");
const cron = require("node-cron");



// Middlewares
app.use(cors({origin: process.env.FRONTEND_URL || "*", credentials: true}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folders
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/public", express.static(path.join(__dirname, "public")));

// // Health check
// app.get("/", (req, res) => {
//   res.json({ 
//     message: "Real Estate Agency API", 
//     version: "1.0.0",
//     status: "online",
//     timestamp: new Date().toISOString()
//   });
// });

// // API Documentation
// // app.get("/api-docs", (req, res) => {
// //   res.json({
// //     endpoints: {
// //       auth: "/api/users, /api/agents, /api/admin",
// //       properties: "/api/apartments",
// //       bookings: "/api/bookings",
// //       inspections: "/api/inspections",
// //       reports: "/api/reports",
// //       payments: "/api/payments",
// //       reviews: "/api/reviews",
// //       notifications: "/api/notifications",
// //       favorites: "/api/favorites",
// //       analytics: "/api/analytics",
// //       search: "/api/search"
// //     }
// //   });
// // });

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/apartments", apartmentRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/inspections", inspectionRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/analytics", analyticsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    message: "Route not found",
    path: req.originalUrl 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";
  
  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
});

// Schedule daily analytics generation (runs at midnight)
if (process.env.GENERATE_ANALYTICS === "true") {
  cron.schedule("0 0 * * *", async () => {
    console.log("Generating daily analytics...");
    try {
      await generateDailyAnalytics();
      console.log("Daily analytics generated successfully");
    } catch (error) {
      console.error("Failed to generate daily analytics:", error);
    }
  });
}


console.log("JWT_SECRET:", process.env.JWT_SECRET);

connect()
let port = 5006

const connection = app.listen(port, () => {
  console.log(`🚀 Server started on port ${port}`);
  console.log(`📊 API available at http://localhost:${port}`);
  console.log(`📝 API Documentation at http://localhost:${port}/api-docs`);
});
