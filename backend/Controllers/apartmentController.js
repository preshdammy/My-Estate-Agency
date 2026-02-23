// controllers/apartmentController.js
const Apartment = require("../Models/apartmentmodel");
const Agent = require("../Models/agentmodel");

// =============== PUBLIC ROUTES ===============

// Get all available apartments
const getAllApartments = async (req, res) => {
  try {
    const apartments = await Apartment.find({ availability: true })
      .populate("agent", "name email phone")
      .sort({ createdAt: -1 });
    
    res.json(apartments);
  } catch (error) {
    console.error("Get all apartments error:", error);
    res.status(500).json({ message: "Failed to fetch apartments" });
  }
};

// Get apartment by ID
const getApartmentById = async (req, res) => {
  try {
    const apartment = await Apartment.findById(req.params.id)
      .populate("agent", "name email phone");
    
    if (!apartment) {
      return res.status(404).json({ message: "Apartment not found" });
    }
    
    res.json(apartment);
  } catch (error) {
    console.error("Get apartment by ID error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Filter apartments
const filterApartments = async (req, res) => {
  try {
    const { location, category, minPrice, maxPrice } = req.query;

    const query = { availability: true };

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    
    if (category) {
      query.category = category;
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const apartments = await Apartment.find(query)
      .populate("agent", "name phone")
      .sort({ price: 1 });
    
    res.json(apartments);
  } catch (error) {
    console.error("Filter apartments error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============== AGENT APARTMENT MANAGEMENT ===============

// Get agent's apartments (listings)
// Get agent's apartments (listings)
const getAgentApartments = async (req, res) => {
  try {
    const apartments = await Apartment.find({ agent: req.user._id })
      .sort({ createdAt: -1 });
    
    // Transform images to URLs for each apartment
    const apartmentsWithUrls = apartments.map(apt => {
      const aptObj = apt.toObject();
      if (aptObj.images && aptObj.images.length > 0) {
        aptObj.images = aptObj.images.map(imgPath => {
          const filename = imgPath.split('\\').pop().split('/').pop();
          return `http://localhost:5006/uploads/apartments/${filename}`;
        });
      }
      return aptObj;
    });
    
    res.json(apartmentsWithUrls);
  } catch (error) {
    console.error("Get agent apartments error:", error);
    res.status(500).json({ message: "Failed to fetch apartments" });
  }
};

// Create new apartment
// Create a new apartment
// Create a new apartment
const createApartment = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);
    
    const { 
      location, 
      price, 
      category, 
      description,
      bedrooms,
      bathrooms,
      size,
      yearBuilt,
      parking,
      furnished,
      petFriendly,
      amenities,
      availability
    } = req.body;

    // Only validate the REQUIRED fields from your model
    if (!location || !price || !category || !description) {
      return res.status(400).json({ 
        message: "Location, price, category, and description are required",
        received: { location, price, category, description }
      });
    }

    // Handle image paths if files were uploaded
    let imagePaths = [];
    if (req.files && req.files.length > 0) {
      // Store relative paths
      imagePaths = req.files.map(file => file.path.replace(/\\/g, '/'));
    }

    // Parse amenities if sent as JSON string
    let amenitiesArray = [];
    if (amenities) {
      try {
        amenitiesArray = JSON.parse(amenities);
      } catch (e) {
        amenitiesArray = Array.isArray(amenities) ? amenities : [amenities];
      }
    }

    const apartment = await Apartment.create({
      agent: req.user._id,
      location,
      price: Number(price),
      category,
      description,
      images: imagePaths, // Store relative paths
      availability: availability === 'true' || availability === true,
      bedrooms: bedrooms ? Number(bedrooms) : undefined,
      bathrooms: bathrooms ? Number(bathrooms) : undefined,
      size: size ? Number(size) : undefined,
      yearBuilt: yearBuilt ? Number(yearBuilt) : undefined,
      parking: parking === 'true' || parking === true,
      furnished: furnished === 'true' || furnished === true,
      petFriendly: petFriendly === 'true' || petFriendly === true,
      amenities: amenitiesArray,
    });

    // Transform images to URLs for response
    const apartmentObj = apartment.toObject();
    if (apartmentObj.images && apartmentObj.images.length > 0) {
      apartmentObj.images = apartmentObj.images.map(imgPath => {
        // Convert file path to URL
        const filename = imgPath.split('\\').pop().split('/').pop();
        return `http://localhost:5006/uploads/apartments/${filename}`;
      });
    }

    res.status(201).json({
      message: "Apartment created successfully",
      apartment: apartmentObj
    });

  } catch (error) {
    console.error("Create apartment error:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Update apartment
const updateApartment = async (req, res) => {
  try {
    const apartment = await Apartment.findById(req.params.id);

    if (!apartment) {
      return res.status(404).json({ message: "Apartment not found" });
    }

    // Check if the agent is the owner
    if (apartment.agent.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only update your own apartments" });
    }

    // Update allowed fields
    const allowedUpdates = ['location', 'price', 'category', 'description', 'images', 'availability'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        apartment[field] = req.body[field];
      }
    });

    // Ensure price is a number
    if (req.body.price !== undefined) {
      apartment.price = Number(req.body.price);
    }

    await apartment.save();
    
    res.json({ 
      message: "Apartment updated successfully", 
      apartment 
    });
  } catch (error) {
    console.error("Update apartment error:", error);
    res.status(500).json({ message: "Failed to update apartment" });
  }
};

// Delete apartment
const deleteApartment = async (req, res) => {
  try {
    const apartment = await Apartment.findById(req.params.id);
    
    if (!apartment) {
      return res.status(404).json({ message: "Apartment not found" });
    }

    if (apartment.agent.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this apartment" });
    }
    
    await apartment.deleteOne();
    
    res.json({ message: "Apartment deleted successfully" });
  } catch (error) {
    console.error("Delete apartment error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============== ADMIN APARTMENT MANAGEMENT ===============

// Get all apartments (for admin)
const getAllApartmentsAdmin = async (req, res) => {
  try {
    const { status, agentId } = req.query;
    
    let filter = {};
    if (status === 'available') filter.availability = true;
    if (status === 'unavailable') filter.availability = false;
    if (agentId) filter.agent = agentId;

    const apartments = await Apartment.find(filter)
      .populate('agent', 'name email phone')
      .sort({ createdAt: -1 });
    
    res.json(apartments);
  } catch (error) {
    console.error("Get all apartments admin error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update apartment availability (admin)
const updateApartmentStatus = async (req, res) => {
  try {
    const { availability } = req.body;
    const apartment = await Apartment.findById(req.params.id);

    if (!apartment) {
      return res.status(404).json({ message: "Apartment not found" });
    }

    apartment.availability = availability;
    await apartment.save();
    
    res.json({ 
      message: `Apartment ${availability ? 'made available' : 'marked as unavailable'}`, 
      apartment 
    });
  } catch (error) {
    console.error("Update apartment status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============== SEARCH FUNCTIONALITY ===============

// Search apartments
const searchApartments = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const apartments = await Apartment.find({
      $and: [
        { availability: true },
        {
          $or: [
            { location: { $regex: q, $options: 'i' } },
            { category: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } }
          ]
        }
      ]
    })
    .populate('agent', 'name email phone')
    .sort({ createdAt: -1 });
    
    res.json(apartments);
  } catch (error) {
    console.error("Search apartments error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get apartments by agent ID
const getApartmentsByAgent = async (req, res) => {
  try {
    const { agentId } = req.params;
    
    const agent = await Agent.findById(agentId);
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    const apartments = await Apartment.find({ 
      agent: agentId, 
      availability: true 
    })
    .sort({ createdAt: -1 });
    
    res.json({
      agent: {
        id: agent._id,
        name: agent.name,
        email: agent.email,
        phone: agent.phone
      },
      apartments
    });
  } catch (error) {
    console.error("Get apartments by agent error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  // Public routes
  getAllApartments,
  getApartmentById,
  filterApartments,
  searchApartments,
  getApartmentsByAgent,
  
  // Agent routes
  getAgentApartments,
  createApartment,
  updateApartment,
  deleteApartment,
  
  // Admin routes
  getAllApartmentsAdmin,
  updateApartmentStatus
};