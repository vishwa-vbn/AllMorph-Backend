
const express = require("express");
const {
  likePostHandler,
  unlikePostHandler,
  getLikeCountHandler,
  getLikedPostsByUserHandler,
} = require("../controllers/like.controller");
const { isAuthenticated } = require("../middleware/auth");

const router = express.Router();

// Public routes
router.get("/:id/likes", getLikeCountHandler);

// Protected routes
router.post("/:id/like", isAuthenticated, likePostHandler);
router.delete("/:id/unlike", isAuthenticated, unlikePostHandler);
router.get("/user/:userId/liked-posts", isAuthenticated, getLikedPostsByUserHandler);

module.exports = router;
