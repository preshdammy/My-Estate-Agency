// controllers/favoriteController.js
const Favorite = require("../Models/favouriteModel");
const Apartment = require("../Models/apartmentmodel");

// =============== USER FUNCTIONS ===============

// User adds apartment to favorites
const addToFavorites = async (req, res) => {
  try {
    const { apartmentId, notes, tags } = req.body;

    if (!apartmentId) {
      return res.status(400).json({ 
        message: "Apartment ID is required" 
      });
    }

    // Verify apartment exists
    const apartment = await Apartment.findById(apartmentId);
    if (!apartment) {
      return res.status(404).json({ message: "Apartment not found" });
    }

    // Check if already in favorites
    const existingFavorite = await Favorite.findOne({
      user: req.user._id,
      apartment: apartmentId
    });

    if (existingFavorite) {
      return res.status(400).json({ 
        message: "Apartment is already in your favorites" 
      });
    }

    const favorite = await Favorite.create({
      user: req.user._id,
      apartment: apartmentId,
      notes: notes || "",
      tags: tags || []
    });

    // Populate apartment details
    const populatedFavorite = await Favorite.findById(favorite._id)
      .populate('apartment', 'location price category images availability');

    res.status(201).json({
      message: "Added to favorites successfully",
      favorite: populatedFavorite
    });
  } catch (error) {
    console.error("Add to favorites error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// User gets their favorites
const getUserFavorites = async (req, res) => {
  try {
    const { tag } = req.query;
    
    let filter = { user: req.user._id };
    if (tag) filter.tags = tag;

    const favorites = await Favorite.find(filter)
      .populate({
        path: 'apartment',
        populate: {
          path: 'agent',
          select: 'name email phone'
        }
      })
      .sort({ createdAt: -1 });
    
    // Transform data to include favorite metadata
    const transformedFavorites = favorites.map(fav => ({
      id: fav._id,
      apartment: fav.apartment,
      notes: fav.notes,
      tags: fav.tags,
      addedAt: fav.createdAt
    }));

    res.json(transformedFavorites);
  } catch (error) {
    console.error("Get user favorites error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// User checks if apartment is in favorites
const checkIfFavorite = async (req, res) => {
  try {
    const { apartmentId } = req.params;
    
    const favorite = await Favorite.findOne({
      user: req.user._id,
      apartment: apartmentId
    });

    res.json({
      isFavorite: !!favorite,
      favorite: favorite || null
    });
  } catch (error) {
    console.error("Check if favorite error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// User updates favorite notes/tags
const updateFavorite = async (req, res) => {
  try {
    const { favoriteId } = req.params;
    const { notes, tags } = req.body;

    const favorite = await Favorite.findById(favoriteId);

    if (!favorite) {
      return res.status(404).json({ message: "Favorite not found" });
    }

    // Check if user owns this favorite
    if (favorite.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: "Not authorized to update this favorite" 
      });
    }

    if (notes !== undefined) favorite.notes = notes;
    if (tags !== undefined) favorite.tags = tags;

    await favorite.save();

    const populatedFavorite = await Favorite.findById(favoriteId)
      .populate('apartment', 'location price category images');

    res.json({
      message: "Favorite updated successfully",
      favorite: populatedFavorite
    });
  } catch (error) {
    console.error("Update favorite error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// User removes from favorites
const removeFromFavorites = async (req, res) => {
  try {
    const { favoriteId } = req.params;
    
    const favorite = await Favorite.findById(favoriteId);

    if (!favorite) {
      return res.status(404).json({ message: "Favorite not found" });
    }

    // Check if user owns this favorite
    if (favorite.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: "Not authorized to remove this favorite" 
      });
    }

    await favorite.deleteOne();

    res.json({ 
      message: "Removed from favorites successfully" 
    });
  } catch (error) {
    console.error("Remove from favorites error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// User removes apartment from favorites by apartment ID
const removeApartmentFromFavorites = async (req, res) => {
  try {
    const { apartmentId } = req.params;
    
    const favorite = await Favorite.findOne({
      user: req.user._id,
      apartment: apartmentId
    });

    if (!favorite) {
      return res.status(404).json({ 
        message: "Apartment not found in your favorites" 
      });
    }

    await favorite.deleteOne();

    res.json({ 
      message: "Apartment removed from favorites successfully" 
    });
  } catch (error) {
    console.error("Remove apartment from favorites error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// User clears all favorites
const clearAllFavorites = async (req, res) => {
  try {
    await Favorite.deleteMany({ user: req.user._id });

    res.json({ 
      message: "All favorites cleared successfully" 
    });
  } catch (error) {
    console.error("Clear all favorites error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// User gets favorite statistics
const getFavoriteStats = async (req, res) => {
  try {
    const [
      totalFavorites,
      availableFavorites,
      byCategory,
      byLocation
    ] = await Promise.all([
      Favorite.countDocuments({ user: req.user._id }),
      Favorite.aggregate([
        { $match: { user: req.user._id } },
        { $lookup: {
            from: "apartments",
            localField: "apartment",
            foreignField: "_id",
            as: "apartment"
          }
        },
        { $unwind: "$apartment" },
        { $match: { "apartment.availability": true } },
        { $count: "count" }
      ]),
      Favorite.aggregate([
        { $match: { user: req.user._id } },
        { $lookup: {
            from: "apartments",
            localField: "apartment",
            foreignField: "_id",
            as: "apartment"
          }
        },
        { $unwind: "$apartment" },
        { $group: { 
            _id: "$apartment.category", 
            count: { $sum: 1 } 
          }
        },
        { $sort: { count: -1 } }
      ]),
      Favorite.aggregate([
        { $match: { user: req.user._id } },
        { $lookup: {
            from: "apartments",
            localField: "apartment",
            foreignField: "_id",
            as: "apartment"
          }
        },
        { $unwind: "$apartment" },
        { $group: { 
            _id: "$apartment.location", 
            count: { $sum: 1 } 
          }
        },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ])
    ]);

    res.json({
      totalFavorites,
      availableFavorites: availableFavorites[0]?.count || 0,
      byCategory,
      byLocation
    });
  } catch (error) {
    console.error("Get favorite stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// User gets favorite tags
const getFavoriteTags = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id });
    
    const tags = {};
    favorites.forEach(favorite => {
      favorite.tags.forEach(tag => {
        tags[tag] = (tags[tag] || 0) + 1;
      });
    });

    // Convert to array and sort by count
    const tagArray = Object.entries(tags).map(([name, count]) => ({
      name,
      count
    })).sort((a, b) => b.count - a.count);

    res.json(tagArray);
  } catch (error) {
    console.error("Get favorite tags error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
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
};