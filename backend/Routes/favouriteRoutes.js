// routes/favoriteRoutes.js
const express = require("express");
const {
  // User functions
  addToFavorites,
  getUserFavorites,
  checkIfFavorite,
  updateFavorite,
  removeFromFavorites,
  removeApartmentFromFavorites,
  clearAllFavorites,
  getFavoriteStats,
  getFavoriteTags
} = require("../Controllers/favouriteController");

const { protect } = require("../Middlewares/authMiddleware");

const router = express.Router();

// =============== USER PROTECTED ROUTES ===============

// User adds to favorites
router.post("/", protect, addToFavorites);

// User gets favorites
router.get("/", protect, getUserFavorites);

// User checks if apartment is favorite
router.get("/check/:apartmentId", protect, checkIfFavorite);

// User gets favorite statistics
router.get("/stats", protect, getFavoriteStats);

// User gets favorite tags
router.get("/tags", protect, getFavoriteTags);

// User updates favorite
router.put("/:favoriteId", protect, updateFavorite);

// User removes from favorites by favorite ID
router.delete("/:favoriteId", protect, removeFromFavorites);

// User removes from favorites by apartment ID
router.delete("/apartment/:apartmentId", protect, removeApartmentFromFavorites);

// User clears all favorites
router.delete("/", protect, clearAllFavorites);

module.exports = router;