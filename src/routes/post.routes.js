const express = require("express");

const {
  createPostHandler,
  getPostByIdHandler,
  getPostBySlugHandler,
  getAllPublishedPostsHandler,
  getAllPostsHandler,
  incrementPostViewHandler,
  updatePostHandler,
  deletePostHandler,
  getSimilarPostsHandler,
  getRecommendedPostsHandler,
  searchPostsHandler,
  getTrendingPostsHandler,
  getLatestPostsHandler,
  getPostsByTagHandler,
  getPostsByAuthorHandler,
  getFeaturedPostsHandler,
  getPostNavigationHandler,
  toggleFeaturedPostHandler,
  togglePostLikeHandler,
  getPostsByCategoryHandler,
} = require("../controllers/post.controller");

const { isAuthenticated, isAdmin ,optionalAuthenticated} = require("../middleware/auth");

const router = express.Router();

// PUBLIC ROUTES (specific routes FIRST)

router.get("/search", searchPostsHandler);
router.get("/similar/:slug", getSimilarPostsHandler);
router.get("/recommended", getRecommendedPostsHandler);
router.get("/trending", getTrendingPostsHandler);
router.get("/latest", getLatestPostsHandler);
router.get("/author/:authorId", getPostsByAuthorHandler);
router.get("/featured", getFeaturedPostsHandler);
router.get("/navigation/:slug", getPostNavigationHandler);
router.get("/category/:categoryId", getPostsByCategoryHandler);
router.get("/tag/:tagId", getPostsByTagHandler);

router.post("/view/:slug", incrementPostViewHandler);

router.get("/slug/:slug", optionalAuthenticated, getPostBySlugHandler);
router.get("/status/published", getAllPublishedPostsHandler);

router.get("/", getAllPostsHandler);

router.post(
  "/:postId/toggle-like",
  isAuthenticated,
  togglePostLikeHandler
);

// ADMIN ROUTES
router.post("/", isAuthenticated, isAdmin, createPostHandler);
router.put("/:id", isAuthenticated, isAdmin, updatePostHandler);
router.delete("/:id", isAuthenticated, isAdmin, deletePostHandler);
router.patch(
  "/:id/toggle-featured",
  isAuthenticated,
  isAdmin,
  toggleFeaturedPostHandler,
);

// DYNAMIC ROUTE LAST
router.get("/:id", getPostByIdHandler);

module.exports = router;
