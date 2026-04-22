// const express = require("express");
// const router = express.Router();
// const {
//   createComment,
//   getCommentsByPost,
//   approveComment,
//   rejectComment,
//   deleteComment,
//   getApprovedCommentsByPost,
// } = require("../controllers/comments.controller");

// const { isAuthenticated, isAdmin } = require("../middleware/auth");

// // Create a new comment
// router.post("/", isAuthenticated,createComment);

// router.get("/public/post/:postId", getApprovedCommentsByPost);

// // Get all comments for a post (optional query ?status=approved/pending/rejected)
// router.get("/post/:postId", getCommentsByPost);

// // Approve a comment
// router.put("/:commentId/approve", approveComment);

// // Reject a comment
// router.put("/:commentId/reject", rejectComment);

// // Delete a comment
// router.delete("/:commentId", deleteComment);

// module.exports = router;

const express = require("express");
const router = express.Router();
const {
  createComment,
  getCommentsByPost,
  approveComment,
  rejectComment,
  deleteComment,
  getApprovedCommentsByPost,
} = require("../controllers/comments.controller");

const { isAuthenticated, isAdmin } = require("../middleware/auth");

// Public routes
router.post("/", isAuthenticated, createComment); // Auto-approved
router.get("/public/post/:postId", getApprovedCommentsByPost);

// Admin routes
router.get("/post/:postId", isAuthenticated, isAdmin, getCommentsByPost); // Admin only

router.put("/:commentId/approve", isAuthenticated, isAdmin, approveComment);
router.put("/:commentId/reject", isAuthenticated, isAdmin, rejectComment);
router.delete("/:commentId", isAuthenticated, isAdmin, deleteComment);

module.exports = router;