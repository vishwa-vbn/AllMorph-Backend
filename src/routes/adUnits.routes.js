const express = require("express");
const router = express.Router();
const {
  getAdSettings,
  upsertAdSettings,
} = require("../controllers/adUnits.controller");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

// Only settings endpoints remain (custom ad-unit routes removed)
router.get("/ad-settings", isAuthenticated, isAdmin, getAdSettings);
router.post("/ad-settings", isAuthenticated, isAdmin, upsertAdSettings);

module.exports = router;