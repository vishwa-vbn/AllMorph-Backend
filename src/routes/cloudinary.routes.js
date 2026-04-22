const express = require("express");
const router = express.Router();
const {
  listAssets,
  getFileDetails,
  deleteFile,
  uploadFile,
} = require("../controllers/cloudinary.controller");
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const multer = require('multer');

// Configure Multer for file handling
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4', 'video/webm'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, MP4, and WebM are allowed.'));
    }
  },
}).single('file');

router.get("/assets", isAuthenticated, isAdmin, listAssets); // List ad_units files
router.get('/assets/:assetId', isAuthenticated, isAdmin, getFileDetails);
router.delete('/files/:assetId', isAuthenticated, isAdmin, deleteFile);// Delete file
router.post("/upload", isAuthenticated, isAdmin, upload, uploadFile); // Upload file to ad_units

module.exports = router;