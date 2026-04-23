const express = require("express");
const router = express.Router();
const {
  getAdSettings,
  upsertAdSettings,
} = require("../controllers/adUnits.controller");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

// Only settings endpoints remain (custom ad-unit routes removed)
// Public endpoint to get ad settings for frontend display
router.get("/ad-settings", getAdSettings);

// Admin-only endpoint to update ad settings
router.post("/ad-settings", isAuthenticated, isAdmin, upsertAdSettings);

module.exports = router;