const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Import models and middleware
const Agent = require("../Models/agentmodel");
const { protect, adminProtect, agentProtect } = require("../Middlewares/authMiddleware");

// Import controllers
const {
  registerAgent,
  loginAgent,
  getAgentProfile,
  updateAgentProfile,
  getAgentDashboard,
  getAgentApartments,
  createApartment,
  updateApartment,
  deleteApartment,
  getAgentInspections,
  updateInspectionStatus,
  getAgentBookings
} = require("../Controllers/agentController");

// ========== SETUP UPLOADS DIRECTORY ==========
const createUploadDirectories = () => {
  try {
    // Define paths
    const baseDir = path.join(__dirname, '../');
    const uploadsDir = path.join(baseDir, 'uploads');
    const certificatesDir = path.join(uploadsDir, 'certificates');
    
    console.log('Base directory:', baseDir);
    console.log('Uploads directory:', uploadsDir);
    console.log('Certificates directory:', certificatesDir);
    
    // Create directories if they don't exist
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('✅ Created uploads directory:', uploadsDir);
    } else {
      console.log('✅ Uploads directory already exists:', uploadsDir);
    }
    
    if (!fs.existsSync(certificatesDir)) {
      fs.mkdirSync(certificatesDir, { recursive: true });
      console.log('✅ Created certificates directory:', certificatesDir);
    } else {
      console.log('✅ Certificates directory already exists:', certificatesDir);
    }
    
    // Check write permissions
    try {
      const testFile = path.join(certificatesDir, 'test.txt');
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
      console.log('✅ Directory is writable');
    } catch (writeError) {
      console.error('❌ Directory is NOT writable:', writeError.message);
    }
    
    return certificatesDir;
  } catch (error) {
    console.error('❌ Error creating directories:', error);
    throw error;
  }
};

// Create directories on startup
const certificatesDir = createUploadDirectories();

// ========== MULTER CONFIGURATION ==========
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, certificatesDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = `cert-${uniqueSuffix}${ext}`;
    console.log('Saving file as:', filename);
    cb(null, filename);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, PDF, DOC, and DOCX are allowed.'), false);
  }
};

// Create multer instance
const upload = multer({ 
  storage: storage,
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// ========== DEBUG MIDDLEWARE ==========
router.use((req, res, next) => {
  console.log(`\n=== ${req.method} ${req.path} ===`);
  console.log('Content-Type:', req.headers['content-type']);
  next();
});

// ========== TEST UPLOAD ENDPOINT ==========
router.post("/test-upload", upload.single("testFile"), (req, res) => {
  try {
    console.log('Test upload - body:', req.body);
    console.log('Test upload - file:', req.file);
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    res.json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Test upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== AGENT REGISTRATION (with file upload) ==========
router.post("/register", (req, res) => {
  upload.single("certificate")(req, res, async function(err) {
    try {
      console.log('=== AGENT REGISTRATION ATTEMPT ===');
      console.log('Request body:', req.body);
      console.log('Uploaded file:', req.file);
      
      if (err) {
        console.error('Upload error:', err);
        return res.status(400).json({ 
          message: err.message || 'File upload failed'
        });
      }

      const { name, email, password, phone } = req.body;

      // Validate required fields
      if (!name || !email || !password || !phone) {
        return res.status(400).json({ 
          message: "All fields are required: name, email, password, phone",
          received: { name, email, password: password ? "***" : null, phone }
        });
      }

      // Validate certificate file
      if (!req.file) {
        return res.status(400).json({ 
          message: "Certificate file is required"
        });
      }

      // Check if agent already exists
      const agentExists = await Agent.findOne({ email });
      if (agentExists) {
        // Remove uploaded file if agent already exists
        if (req.file && req.file.path) {
          try {
            fs.unlinkSync(req.file.path);
            console.log('Deleted duplicate file:', req.file.path);
          } catch (unlinkErr) {
            console.error('Failed to delete file:', unlinkErr);
          }
        }
        return res.status(400).json({ message: "Agent already exists" });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create relative path for database
      const relativePath = req.file.path.replace(/\\/g, '/').split('backend/')[1] || req.file.filename;

      // Create agent
      const agent = await Agent.create({
        name,
        email,
        password: hashedPassword,
        phone,
        certificate: relativePath,
        status: "pending"
      });

      console.log('✅ Agent created successfully:', agent.email);

      res.status(201).json({ 
        message: "Agent registered successfully. Pending admin approval.",
        agent: {
          id: agent._id,
          name: agent.name,
          email: agent.email,
          phone: agent.phone,
          status: agent.status
        }
      });

    } catch (error) {
      console.error('❌ Registration error:', error);
      
      // Clean up uploaded file on error
      if (req.file && req.file.path) {
        try {
          fs.unlinkSync(req.file.path);
          console.log('Cleaned up file after error:', req.file.path);
        } catch (unlinkErr) {
          console.error('Failed to delete file:', unlinkErr);
        }
      }
      
      res.status(500).json({ 
        message: "Server error during registration",
        error: error.message 
      });
    }
  });
});

// ========== OTHER PUBLIC ROUTES ==========
router.post("/login", loginAgent);

// ========== PROTECTED AGENT ROUTES ==========
router.get("/profile", protect, agentProtect, getAgentProfile);
router.put("/profile", protect, agentProtect, updateAgentProfile);
router.get("/dashboard", protect, agentProtect, getAgentDashboard);

// Apartment Management
router.get("/apartments", protect, agentProtect, getAgentApartments);
router.post("/apartments", protect, agentProtect, createApartment);
router.put("/apartments/:id", protect, agentProtect, updateApartment);
router.delete("/apartments/:id", protect, agentProtect, deleteApartment);

// Inspection Management
router.get("/inspections", protect, agentProtect, getAgentInspections);
router.put("/inspections/:id/status", protect, agentProtect, updateInspectionStatus);

// Booking Management
router.get("/bookings", protect, agentProtect, getAgentBookings);

module.exports = router;