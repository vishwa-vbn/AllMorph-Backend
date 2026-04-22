
const express = require("express");
const {
  storeLogHandler,
  getAllLogsHandler,
  getLatestLogHandler,
  deleteLogHandler,
} = require("../controllers/sitemap.controller");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

const router = express.Router();

// Admin routes
router.post("/generate-log", isAuthenticated, isAdmin, storeLogHandler);
router.get("/logs", isAuthenticated, isAdmin, getAllLogsHandler);
router.get("/latest", isAuthenticated, isAdmin, getLatestLogHandler);
router.delete("/logs/:id", isAuthenticated, isAdmin, deleteLogHandler);

module.exports = router;
