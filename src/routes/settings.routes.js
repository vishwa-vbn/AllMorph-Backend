const express = require("express");
const router = express.Router();
const {
  getSettings,
  updateSettings
} = require("../controllers/settings.controller");

// Get all settings
router.get("/", getSettings);

// Update group settings
router.put("/", updateSettings);

module.exports = router;