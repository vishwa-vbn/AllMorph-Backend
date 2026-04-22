
const express = require("express");
const {
  bookmarkPostHandler,
  removeBookmarkHandler,
  getBookmarksByUserHandler,
  getBookmarkCountHandler,
} = require("../controllers/bookmark.controller");
const { isAuthenticated } = require("../middleware/auth");

const router = express.Router();

// Public routes
router.get("/:id/bookmarks/count", getBookmarkCountHandler);

// Protected routes
router.post("/:id/bookmark", isAuthenticated, bookmarkPostHandler);
router.delete("/:id/bookmark", isAuthenticated, removeBookmarkHandler);
router.get("/user/:userId/bookmarks", isAuthenticated, getBookmarksByUserHandler);

module.exports = router;
