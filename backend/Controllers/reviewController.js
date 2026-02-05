// controllers/reviewController.js
const Review = require("../Models/reviewModel");
const Apartment = require("../Models/apartmentmodel");
const Booking = require("../Models/bookingmodel");

// =============== USER FUNCTIONS ===============

// User submits a review
const submitReview = async (req, res) => {
  try {
    const { apartmentId, agentId, rating, comment, images } = req.body;

    if (!apartmentId || !rating) {
      return res.status(400).json({ 
        message: "Apartment ID and rating are required" 
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        message: "Rating must be between 1 and 5" 
      });
    }

    // Verify apartment exists
    const apartment = await Apartment.findById(apartmentId);
    if (!apartment) {
      return res.status(404).json({ message: "Apartment not found" });
    }

    // Check if user has booked this apartment (only allow reviews after booking)
    const booking = await Booking.findOne({
      user: req.user._id,
      apartment: apartmentId,
      status: "confirmed"
    });

    if (!booking && req.user.role !== "admin") {
      return res.status(403).json({ 
        message: "You can only review apartments you have booked" 
      });
    }

    // Check if user already reviewed this apartment
    const existingReview = await Review.findOne({
      user: req.user._id,
      apartment: apartmentId
    });

    if (existingReview) {
      return res.status(400).json({ 
        message: "You have already reviewed this apartment" 
      });
    }

    const review = await Review.create({
      user: req.user._id,
      apartment: apartmentId,
      agent: agentId || apartment.agent,
      rating: Number(rating),
      comment: comment || "",
      images: images || []
    });

    // Update apartment average rating
    await updateApartmentRating(apartmentId);

    // Populate for response
    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name email')
      .populate('apartment', 'location price category');

    res.status(201).json({
      message: "Review submitted successfully",
      review: populatedReview
    });
  } catch (error) {
    console.error("Submit review error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Helper function to update apartment rating
const updateApartmentRating = async (apartmentId) => {
  const reviews = await Review.find({ apartment: apartmentId });
  
  if (reviews.length > 0) {
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    const totalReviews = reviews.length;
    
    await Apartment.findByIdAndUpdate(apartmentId, {
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalReviews
    });
  }
};

// User views their reviews
const getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate('apartment', 'location price category images')
      .populate('agent', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (error) {
    console.error("Get user reviews error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// User updates their review
const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment, images } = req.body;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Check if user owns this review
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: "Not authorized to update this review" 
      });
    }

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ 
        message: "Rating must be between 1 and 5" 
      });
    }

    if (rating) review.rating = Number(rating);
    if (comment !== undefined) review.comment = comment;
    if (images !== undefined) review.images = images;

    await review.save();

    // Update apartment average rating
    await updateApartmentRating(review.apartment);

    res.json({
      message: "Review updated successfully",
      review
    });
  } catch (error) {
    console.error("Update review error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// User deletes their review
const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    
    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Check if user owns this review or is admin
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ 
        message: "Not authorized to delete this review" 
      });
    }

    const apartmentId = review.apartment;
    await review.deleteOne();

    // Update apartment average rating
    await updateApartmentRating(apartmentId);

    res.json({ 
      message: "Review deleted successfully" 
    });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============== PUBLIC FUNCTIONS ===============

// Get reviews for an apartment
const getApartmentReviews = async (req, res) => {
  try {
    const { apartmentId } = req.params;
    const { page = 1, limit = 10, sortBy = "newest" } = req.query;

    // Sort options
    let sort = {};
    if (sortBy === "newest") sort.createdAt = -1;
    else if (sortBy === "oldest") sort.createdAt = 1;
    else if (sortBy === "highest") sort.rating = -1;
    else if (sortBy === "lowest") sort.rating = 1;

    const reviews = await Review.find({ apartment: apartmentId })
      .populate('user', 'name email')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments({ apartment: apartmentId });

    // Calculate average rating
    const averageRating = await Review.aggregate([
      { $match: { apartment: apartmentId } },
      { $group: { _id: null, average: { $avg: "$rating" } } }
    ]);

    res.json({
      reviews,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      averageRating: averageRating[0]?.average?.toFixed(1) || 0,
      totalReviews: total
    });
  } catch (error) {
    console.error("Get apartment reviews error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get reviews for an agent
const getAgentReviews = async (req, res) => {
  try {
    const { agentId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ agent: agentId })
      .populate('user', 'name email')
      .populate('apartment', 'location price category')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments({ agent: agentId });

    // Calculate average rating for agent
    const averageRating = await Review.aggregate([
      { $match: { agent: agentId } },
      { $group: { _id: null, average: { $avg: "$rating" } } }
    ]);

    res.json({
      reviews,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      averageRating: averageRating[0]?.average?.toFixed(1) || 0,
      totalReviews: total
    });
  } catch (error) {
    console.error("Get agent reviews error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============== AGENT FUNCTIONS ===============

// Agent gets reviews for their properties
const getAgentPropertyReviews = async (req, res) => {
  try {
    // Get agent's apartment IDs
    const agentApartments = await Apartment.find({ agent: req.user._id }).select('_id');
    const apartmentIds = agentApartments.map(apt => apt._id);

    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ apartment: { $in: apartmentIds } })
      .populate('user', 'name email')
      .populate('apartment', 'location price category')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments({ apartment: { $in: apartmentIds } });

    res.json({
      reviews,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error("Get agent property reviews error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Agent responds to a review
const respondToReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { response } = req.body;

    if (!response) {
      return res.status(400).json({ message: "Response is required" });
    }

    const review = await Review.findById(reviewId)
      .populate('apartment');

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Check if apartment belongs to this agent
    const apartment = await Apartment.findById(review.apartment._id);
    if (!apartment || apartment.agent.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: "Not authorized to respond to this review" 
      });
    }

    review.agentResponse = response;
    review.respondedAt = new Date();

    await review.save();

    res.json({
      message: "Response submitted successfully",
      review
    });
  } catch (error) {
    console.error("Respond to review error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============== ADMIN FUNCTIONS ===============

// Admin gets all reviews
const getAllReviews = async (req, res) => {
  try {
    const { rating, apartmentId, agentId } = req.query;
    
    let filter = {};
    if (rating) filter.rating = Number(rating);
    if (apartmentId) filter.apartment = apartmentId;
    if (agentId) filter.agent = agentId;

    const reviews = await Review.find(filter)
      .populate('user', 'name email')
      .populate('apartment', 'location price category')
      .populate('agent', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (error) {
    console.error("Get all reviews error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin deletes a review
const adminDeleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    
    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const apartmentId = review.apartment;
    await review.deleteOne();

    // Update apartment average rating
    await updateApartmentRating(apartmentId);

    res.json({ 
      message: "Review deleted successfully" 
    });
  } catch (error) {
    console.error("Admin delete review error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  // User functions
  submitReview,
  getUserReviews,
  updateReview,
  deleteReview,
  
  // Public functions
  getApartmentReviews,
  getAgentReviews,
  
  // Agent functions
  getAgentPropertyReviews,
  respondToReview,
  
  // Admin functions
  getAllReviews,
  adminDeleteReview
};