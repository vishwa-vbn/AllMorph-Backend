
const express = require("express");
const {
  createPageHandler,
  getAllPagesHandler,
  getPageBySlugHandler,
  updatePageHandler,
  deletePageHandler,
  getPublishedPagesHandler,
} = require("../controllers/page.controller");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

const router = express.Router();

// Public routes
router.get("/published", getPublishedPagesHandler);
router.get("/:slug", getPageBySlugHandler);

// Admin routes
router.post("/", isAuthenticated, isAdmin, createPageHandler);
router.get("/", isAuthenticated, isAdmin, getAllPagesHandler);
router.put("/:id", isAuthenticated, isAdmin, updatePageHandler);
router.delete("/:id", isAuthenticated, isAdmin, deletePageHandler);

module.exports = router;
