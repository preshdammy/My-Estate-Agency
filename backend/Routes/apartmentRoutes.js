const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
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
} = require("../Controllers/apartmentController");

const { protect, agentProtect, adminProtect } = require("../Middlewares/authMiddleware");

const router = express.Router();

// ========== SETUP UPLOADS DIRECTORY ==========
const uploadDir = path.join(__dirname, '../uploads/apartments');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✅ Created apartments upload directory:', uploadDir);
}

// ========== MULTER CONFIGURATION ==========
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = 'apartment-' + uniqueSuffix + ext;
    console.log('Generated filename:', filename);
    cb(null, filename); // This will be stored in req.file.filename
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB limit per file
  },
  fileFilter: fileFilter
});

// ========== DEBUG MIDDLEWARE ==========
router.use((req, res, next) => {
  console.log(`\n=== ${req.method} ${req.path} ===`);
  console.log('Content-Type:', req.headers['content-type']);
  next();
});

// =============== PUBLIC ROUTES ===============

// Get all available apartments
router.get("/", getAllApartments);

router.get("/agent/:agentId", getApartmentsByAgent);

// Filter apartments
router.get("/search/filter", filterApartments);

// Search apartments
router.get("/search/:q", searchApartments);

// Get apartment by ID
router.get("/:id", getApartmentById);

// Get apartments by agent ID


// =============== AGENT PROTECTED ROUTES ===============

// Get agent's apartments
router.get("/agents/apartments", protect, agentProtect, getAgentApartments);

// Create apartment with image upload - IMPORTANT: upload.array() must come before controller
router.post(
  "/", 
  protect, 
  agentProtect, 
  upload.array('images', 10), // 'images' field name, max 10 files
  createApartment
);

// Update apartment (optional image upload)
router.put(
  "/:id", 
  protect, 
  agentProtect, 
  upload.array('images', 10), // Allow updating images too
  updateApartment
);

// Delete apartment
router.delete("/:id", protect, agentProtect, deleteApartment);

// =============== ADMIN PROTECTED ROUTES ===============

// Get all apartments (for admin)
router.get("/admin/all", protect, adminProtect, getAllApartmentsAdmin);

// Update apartment status
router.put("/admin/:id/status", protect, adminProtect, updateApartmentStatus);

module.exports = router;