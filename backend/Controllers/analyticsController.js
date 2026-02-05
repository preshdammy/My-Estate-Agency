// controllers/analyticsController.js
const Analytics = require("../Models/analyticsModel");
const User = require("../Models/usermodel");
const Agent = require("../Models/agentmodel");
const Apartment = require("../Models/apartmentmodel");
const Booking = require("../Models/bookingmodel");
const Payment = require("../Models/paymentModel");
const Review = require("../Models/reviewModel");
const Report = require("../Models/reportmodel");
const InspectionRequest = require("../Models/inspectionmodel");

// Helper function to generate daily analytics
const generateDailyAnalytics = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if analytics already generated for today
    const existingAnalytics = await Analytics.findOne({
      date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
      type: "daily"
    });

    if (existingAnalytics) {
      return existingAnalytics;
    }

    // Calculate date ranges
    const startOfToday = new Date(today);
    const endOfToday = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    
    const startOfYesterday = new Date(yesterday);
    const endOfYesterday = new Date(yesterday.getTime() + 24 * 60 * 60 * 1000);

    // Get all metrics
    const [
      newUsers,
      activeUsers,
      totalUsers,
      newAgents,
      approvedAgents,
      pendingAgents,
      totalAgents,
      newApartments,
      availableApartments,
      bookedApartments,
      totalApartments,
      newBookings,
      confirmedBookings,
      cancelledBookings,
      totalBookings,
      newInspections,
      completedInspections,
      totalInspections,
      newReports,
      resolvedReports,
      openReports,
      totalReports,
      newPayments,
      totalRevenue,
      newReviews,
      averageRating,
      totalReviews,
      apartmentCategories,
      popularLocations
    ] = await Promise.all([
      // User metrics
      User.countDocuments({ createdAt: { $gte: startOfToday, $lt: endOfToday } }),
      User.countDocuments({ lastLogin: { $gte: startOfYesterday, $lt: endOfToday } }),
      User.countDocuments(),
      
      // Agent metrics
      Agent.countDocuments({ createdAt: { $gte: startOfToday, $lt: endOfToday } }),
      Agent.countDocuments({ status: "approved" }),
      Agent.countDocuments({ status: "pending" }),
      Agent.countDocuments(),
      
      // Apartment metrics
      Apartment.countDocuments({ createdAt: { $gte: startOfToday, $lt: endOfToday } }),
      Apartment.countDocuments({ availability: true }),
      Apartment.countDocuments({ availability: false }),
      Apartment.countDocuments(),
      
      // Booking metrics
      Booking.countDocuments({ createdAt: { $gte: startOfToday, $lt: endOfToday } }),
      Booking.countDocuments({ status: "confirmed" }),
      Booking.countDocuments({ status: "cancelled" }),
      Booking.countDocuments(),
      
      // Inspection metrics
      InspectionRequest.countDocuments({ createdAt: { $gte: startOfToday, $lt: endOfToday } }),
      InspectionRequest.countDocuments({ status: "completed" }),
      InspectionRequest.countDocuments(),
      
      // Report metrics
      Report.countDocuments({ createdAt: { $gte: startOfToday, $lt: endOfToday } }),
      Report.countDocuments({ status: "resolved" }),
      Report.countDocuments({ status: { $in: ["open", "in_progress"] } }),
      Report.countDocuments(),
      
      // Payment metrics
      Payment.countDocuments({ createdAt: { $gte: startOfToday, $lt: endOfToday }, status: "completed" }),
      Payment.aggregate([
        { $match: { createdAt: { $gte: startOfToday, $lt: endOfToday }, status: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      
      // Review metrics
      Review.countDocuments({ createdAt: { $gte: startOfToday, $lt: endOfToday } }),
      Review.aggregate([
        { $group: { _id: null, average: { $avg: "$rating" } } }
      ]),
      Review.countDocuments(),
      
      // Category breakdown
      Apartment.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } }
      ]),
      
      // Location breakdown
      Apartment.aggregate([
        { $group: { _id: "$location", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);

    // Calculate price ranges
    const priceRanges = await Apartment.aggregate([
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lte: ["$price", 500] }, then: "0-500" },
                { case: { $and: [{ $gt: ["$price", 500] }, { $lte: ["$price", 1000] }] }, then: "501-1000" },
                { case: { $and: [{ $gt: ["$price", 1000] }, { $lte: ["$price", 2000] }] }, then: "1001-2000" },
                { case: { $gt: ["$price", 2000] }, then: "2001+" }
              ],
              default: "unknown"
            }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    // Convert price ranges to object
    const priceRangeObj = {
      "0-500": 0,
      "501-1000": 0,
      "1001-2000": 0,
      "2001+": 0
    };
    
    priceRanges.forEach(range => {
      if (priceRangeObj[range._id] !== undefined) {
        priceRangeObj[range._id] = range.count;
      }
    });

    // Convert categories and locations to Map format
    const categoryMap = {};
    apartmentCategories.forEach(cat => {
      categoryMap[cat._id] = cat.count;
    });

    const locationMap = {};
    popularLocations.forEach(loc => {
      locationMap[loc._id] = loc.count;
    });

    // Create analytics record
    const analytics = new Analytics({
      date: today,
      type: "daily",
      metrics: {
        newUsers,
        activeUsers,
        totalUsers,
        newAgents,
        approvedAgents,
        pendingAgents,
        totalAgents,
        newApartments,
        availableApartments,
        bookedApartments,
        totalApartments,
        newBookings,
        confirmedBookings,
        cancelledBookings,
        totalBookings,
        bookingRevenue: totalRevenue[0]?.total || 0,
        newInspections,
        completedInspections,
        totalInspections,
        newReports,
        resolvedReports,
        openReports,
        totalReports,
        newPayments,
        totalRevenue: totalRevenue[0]?.total || 0,
        averageTransaction: newPayments > 0 ? (totalRevenue[0]?.total || 0) / newPayments : 0,
        newReviews,
        averageRating: averageRating[0]?.average?.toFixed(2) || 0,
        totalReviews
      },
      breakdown: {
        apartmentCategories: categoryMap,
        popularLocations: locationMap,
        priceRanges: priceRangeObj
      }
    });

    await analytics.save();
    return analytics;
  } catch (error) {
    console.error("Generate daily analytics error:", error);
    return null;
  }
};

// =============== ADMIN FUNCTIONS ===============

// Admin gets dashboard analytics
const getDashboardAnalytics = async (req, res) => {
  try {
    const { period = "7days" } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case "today":
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);
        dateFilter = { $gte: today };
        break;
      case "7days":
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        dateFilter = { $gte: sevenDaysAgo };
        break;
      case "30days":
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        dateFilter = { $gte: thirtyDaysAgo };
        break;
      case "90days":
        const ninetyDaysAgo = new Date(now);
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        dateFilter = { $gte: ninetyDaysAgo };
        break;
    }

    // Get current stats
    const [
      totalUsers,
      totalAgents,
      totalApartments,
      totalBookings,
      totalRevenue,
      openReports,
      pendingAgents,
      recentActivities
    ] = await Promise.all([
      User.countDocuments(),
      Agent.countDocuments(),
      Apartment.countDocuments(),
      Booking.countDocuments(),
      Payment.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      Report.countDocuments({ status: { $in: ["open", "in_progress"] } }),
      Agent.countDocuments({ status: "pending" }),
      // Recent activities (last 10)
      Booking.find().sort({ createdAt: -1 }).limit(10).populate('user', 'name').populate('apartment', 'location'),
      Payment.find().sort({ createdAt: -1 }).limit(10).populate('user', 'name'),
      Report.find().sort({ createdAt: -1 }).limit(10).populate('user', 'name'),
      User.find().sort({ createdAt: -1 }).limit(10)
    ]);

    // Get growth data
    const growthData = await Analytics.find({
      date: dateFilter,
      type: "daily"
    }).sort({ date: 1 });

    // Calculate user growth
    const userGrowth = growthData.length > 1 ? 
      ((growthData[growthData.length - 1].metrics.newUsers - growthData[0].metrics.newUsers) / growthData[0].metrics.newUsers * 100).toFixed(1) : 0;

    // Calculate revenue growth
    const revenueGrowth = growthData.length > 1 ? 
      ((growthData[growthData.length - 1].metrics.totalRevenue - growthData[0].metrics.totalRevenue) / growthData[0].metrics.totalRevenue * 100).toFixed(1) : 0;

    // Get top performing agents
    const topAgents = await Agent.aggregate([
      {
        $lookup: {
          from: "apartments",
          localField: "_id",
          foreignField: "agent",
          as: "apartments"
        }
      },
      {
        $lookup: {
          from: "bookings",
          localField: "apartments._id",
          foreignField: "apartment",
          as: "bookings"
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          totalApartments: { $size: "$apartments" },
          totalBookings: { $size: "$bookings" },
          averageRating: 1
        }
      },
      { $sort: { totalBookings: -1 } },
      { $limit: 5 }
    ]);

    // Get popular locations
    const popularLocations = await Apartment.aggregate([
      { $group: { _id: "$location", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Get revenue by month (last 6 months)
    const revenueByMonth = await Payment.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          total: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    res.json({
      overview: {
        totalUsers,
        totalAgents,
        totalApartments,
        totalBookings,
        totalRevenue: totalRevenue[0]?.total || 0,
        openReports,
        pendingAgents,
        userGrowth: parseFloat(userGrowth),
        revenueGrowth: parseFloat(revenueGrowth)
      },
      growthData: growthData.map(d => ({
        date: d.date,
        newUsers: d.metrics.newUsers,
        newBookings: d.metrics.newBookings,
        revenue: d.metrics.totalRevenue
      })),
      topAgents,
      popularLocations,
      revenueByMonth,
      recentActivities: {
        bookings: recentActivities[0],
        payments: recentActivities[1],
        reports: recentActivities[2],
        users: recentActivities[3]
      }
    });
  } catch (error) {
    console.error("Get dashboard analytics error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin gets detailed analytics
const getDetailedAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, metric } = req.query;
    
    let filter = { type: "daily" };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const analytics = await Analytics.find(filter)
      .sort({ date: 1 });

    if (metric) {
      // Return specific metric over time
      const metricData = analytics.map(a => ({
        date: a.date,
        value: a.metrics[metric] || 0
      }));
      
      res.json({
        metric,
        data: metricData,
        total: metricData.reduce((sum, item) => sum + item.value, 0),
        average: metricData.length > 0 ? 
          metricData.reduce((sum, item) => sum + item.value, 0) / metricData.length : 0
      });
    } else {
      // Return all analytics
      res.json(analytics);
    }
  } catch (error) {
    console.error("Get detailed analytics error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin generates analytics manually
const generateAnalytics = async (req, res) => {
  try {
    const { date, type = "daily" } = req.body;
    
    let targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    // For now, only support daily generation
    if (type !== "daily") {
      return res.status(400).json({ 
        message: "Only daily analytics generation is supported" 
      });
    }

    const analytics = await generateDailyAnalytics();
    
    if (!analytics) {
      return res.status(500).json({ 
        message: "Failed to generate analytics" 
      });
    }

    res.json({
      message: "Analytics generated successfully",
      analytics
    });
  } catch (error) {
    console.error("Generate analytics error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin gets user analytics
const getUserAnalytics = async (req, res) => {
  try {
    const { period = "30days" } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case "7days":
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        dateFilter = { createdAt: { $gte: sevenDaysAgo } };
        break;
      case "30days":
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        dateFilter = { createdAt: { $gte: thirtyDaysAgo } };
        break;
      case "90days":
        const ninetyDaysAgo = new Date(now);
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        dateFilter = { createdAt: { $gte: ninetyDaysAgo } };
        break;
    }

    const [
      userGrowth,
      userActivity,
      userSegments,
      topUsers
    ] = await Promise.all([
      // User growth over time
      User.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      // User activity (logins)
      User.aggregate([
        { $match: { lastLogin: { $ne: null } } },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$lastLogin" }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: -1 } },
        { $limit: 7 }
      ]),
      // User segments (by activity)
      {
        active: await User.countDocuments({ lastLogin: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } }),
        new: await User.countDocuments(dateFilter),
        total: await User.countDocuments(),
        withBookings: await Booking.distinct("user").then(users => users.length)
      },
      // Top users by bookings
      User.aggregate([
        {
          $lookup: {
            from: "bookings",
            localField: "_id",
            foreignField: "user",
            as: "bookings"
          }
        },
        {
          $project: {
            name: 1,
            email: 1,
            totalBookings: { $size: "$bookings" },
            lastLogin: 1,
            createdAt: 1
          }
        },
        { $sort: { totalBookings: -1 } },
        { $limit: 10 }
      ])
    ]);

    res.json({
      userGrowth,
      userActivity,
      userSegments,
      topUsers
    });
  } catch (error) {
    console.error("Get user analytics error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin gets revenue analytics
const getRevenueAnalytics = async (req, res) => {
  try {
    const { period = "30days" } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case "7days":
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        dateFilter = { createdAt: { $gte: sevenDaysAgo }, status: "completed" };
        break;
      case "30days":
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        dateFilter = { createdAt: { $gte: thirtyDaysAgo }, status: "completed" };
        break;
      case "90days":
        const ninetyDaysAgo = new Date(now);
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        dateFilter = { createdAt: { $gte: ninetyDaysAgo }, status: "completed" };
        break;
    }

    const [
      revenueByDay,
      revenueByPaymentMethod,
      revenueByAgent,
      averageTransaction,
      refundStats
    ] = await Promise.all([
      // Revenue by day
      Payment.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
            },
            revenue: { $sum: "$amount" },
            transactions: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      // Revenue by payment method
      Payment.aggregate([
        { $match: { ...dateFilter, status: "completed" } },
        {
          $group: {
            _id: "$paymentMethod",
            revenue: { $sum: "$amount" },
            transactions: { $sum: 1 }
          }
        },
        { $sort: { revenue: -1 } }
      ]),
      // Revenue by agent
      Payment.aggregate([
        { $match: { ...dateFilter, status: "completed" } },
        {
          $lookup: {
            from: "apartments",
            localField: "apartment",
            foreignField: "_id",
            as: "apartment"
          }
        },
        { $unwind: "$apartment" },
        {
          $lookup: {
            from: "agents",
            localField: "apartment.agent",
            foreignField: "_id",
            as: "agent"
          }
        },
        { $unwind: "$agent" },
        {
          $group: {
            _id: "$agent._id",
            agentName: { $first: "$agent.name" },
            revenue: { $sum: "$amount" },
            transactions: { $sum: 1 }
          }
        },
        { $sort: { revenue: -1 } },
        { $limit: 10 }
      ]),
      // Average transaction value
      Payment.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: null,
            average: { $avg: "$amount" },
            min: { $min: "$amount" },
            max: { $max: "$amount" }
          }
        }
      ]),
      // Refund statistics
      {
        totalRefunds: await Payment.countDocuments({ status: "refunded" }),
        refundAmount: await Payment.aggregate([
          { $match: { status: "refunded" } },
          { $group: { _id: null, total: { $sum: "$amount" } } }
        ]),
        pendingRefunds: await Payment.countDocuments({ status: "refund_pending" })
      }
    ]);

    res.json({
      revenueByDay,
      revenueByPaymentMethod,
      revenueByAgent,
      averageTransaction: averageTransaction[0] || { average: 0, min: 0, max: 0 },
      refundStats: {
        totalRefunds: refundStats.totalRefunds,
        refundAmount: refundStats.refundAmount[0]?.total || 0,
        pendingRefunds: refundStats.pendingRefunds
      }
    });
  } catch (error) {
    console.error("Get revenue analytics error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  // Helper functions (not routes)
  generateDailyAnalytics,
  
  // Admin functions
  getDashboardAnalytics,
  getDetailedAnalytics,
  generateAnalytics,
  getUserAnalytics,
  getRevenueAnalytics
};