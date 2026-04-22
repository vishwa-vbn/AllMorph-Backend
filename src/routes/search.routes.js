
const express = require("express");
const {
  indexPostHandler,
  updateIndexHandler,
  removeFromIndexHandler,
  searchPostsHandler,
  getSearchSuggestionsHandler,
} = require("../controllers/search.controller");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

const router = express.Router();

// Public routes
router.get("/posts", searchPostsHandler);
router.get("/suggestions", getSearchSuggestionsHandler);

// Admin routes
router.post("/index-post", isAuthenticated, isAdmin, indexPostHandler);
router.put("/update-index/:postId", isAuthenticated, isAdmin, updateIndexHandler);
router.delete("/index/:postId", isAuthenticated, isAdmin, removeFromIndexHandler);

module.exports = router;
