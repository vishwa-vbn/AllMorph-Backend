const postModel = require("../models/post.model");
const { successResponse, errorResponse } = require("../utils/response");

// Create a new post
async function createPostHandler(req, res) {
  try {

    const postData = {
      ...req.body,
      authorId: req.user.userId,
    };
    const post = await postModel.createPost(postData);
    return successResponse(res, 201, "Post created successfully", post);
  } catch (error) {
    return errorResponse(res, error);
  }
}

// controllers/post.controller.js
async function incrementPostViewHandler(req, res) {
  try {
    const slug = req.params.slug;

    // Optional: very basic bot protection
    const ua = req.headers["user-agent"] || "";
    if (/bot|spider|crawler|headless/i.test(ua)) {
      return successResponse(res, 200, "View not counted (bot detected)");
    }

    const updated = await postModel.incrementViewCount(slug);

    if (!updated) {
      return errorResponse(res, new Error("Post not found"), 404);
    }

    return successResponse(res, 200, "View counted", { slug });
  } catch (err) {
    return errorResponse(res, err);
  }
}

// Get a post by ID
async function getPostByIdHandler(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const post = await postModel.getPostById(id);
    if (!post) return errorResponse(res, new Error("Post not found"), 404);
    return successResponse(res, 200, "Post retrieved successfully", post);
  } catch (error) {
    return errorResponse(res, error);
  }
}

// Get a post by slug
async function getPostBySlugHandler(req, res) {
  try {
    const slug = req.params.slug;
    const userId = req.user?.userId || null;

    const post = await postModel.getPostBySlug(slug,userId);
    if (!post) return errorResponse(res, new Error("Post not found"), 404);
    return successResponse(res, 200, "Post retrieved successfully", post);
  } catch (error) {
    return errorResponse(res, error);
  }
}

// Get all published posts with pagination
async function getAllPublishedPostsHandler(req, res) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const posts = await postModel.getAllPublishedPosts(page, limit);
    return successResponse(
      res,
      200,
      "Published posts retrieved successfully",
      posts,
    );
  } catch (error) {
    return errorResponse(res, error);
  }
}

async function getAllPostsHandler(req, res) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const posts = await postModel.getAllPosts(page, limit);
    return successResponse(res, 200, "All posts retrieved successfully", posts);
  } catch (error) {
    return errorResponse(res, error);
  }
}

// Update a post by ID
async function updatePostHandler(req, res) {
  try {
    const id = parseInt(req.params.id, 10);

    console.log("=== UPDATE POST RECEIVED ===");
    console.log("Content length received:", req.body.content?.length || 0);
    console.log(
      "Contains <mark> or style?",
      /<mark|style=/.test(req.body.content || ""),
    );
    console.log(
      "First 300 chars of content:",
      req.body.content?.substring(0, 300),
    );

    const updatedPost = await postModel.updatePost(id, req.body);

    console.log("=== AFTER MODEL UPDATE ===");
    console.log("Saved content length:", updatedPost?.content?.length || 0);
    console.log(
      "Saved content has tags?",
      /<mark|style=/.test(updatedPost?.content || ""),
    );

    if (!updatedPost)
      return errorResponse(res, new Error("Post not found"), 404);
    return successResponse(res, 200, "Post updated successfully", updatedPost);
  } catch (error) {
    return errorResponse(res, error);
  }
}

// Delete a post by ID
// async function deletePostHandler(req, res) {
//   try {
//     const id = parseInt(req.params.id, 10);
//     const deletedPost = await postModel.deletePost(id);
//     if (!deletedPost)
//       return errorResponse(res, new Error("Post not found"), 404);
//     return successResponse(res, 200, "Post deleted successfully", deletedPost);
//   } catch (error) {
//     return errorResponse(res, error);
//   }
// }


async function deletePostHandler(req, res) {
  try {
    const id = parseInt(req.params.id, 10);

    await postModel.deleteCommentsByPostId(id);
    await postModel.deletePostCategoriesByPostId(id);
    await postModel.deletePostTagsByPostId(id);

    const deletedPost = await postModel.deletePost(id);

    if (!deletedPost)
      return errorResponse(res, new Error("Post not found"), 404);

    return successResponse(res, 200, "Post deleted successfully", deletedPost);
  } catch (error) {
    return errorResponse(res, error);
  }
}

/*
--------------------------------
Search Posts
--------------------------------
*/
async function searchPostsHandler(req, res) {
  try {
    const q = req.query.q || "";

    const page = Number.isInteger(Number(req.query.page))
      ? Number(req.query.page)
      : 1;

    const limit = Number.isInteger(Number(req.query.limit))
      ? Number(req.query.limit)
      : 10;

    const posts = await postModel.searchPosts(q, page, limit);

    return successResponse(res, 200, "Search results fetched", posts);
  } catch (err) {
    return errorResponse(res, err);
  }
}

/*
--------------------------------
Similar Posts
--------------------------------
*/
async function getSimilarPostsHandler(req, res) {
  try {
    const slug = req.params.slug;
    const posts = await postModel.getSimilarPosts(slug);

    return successResponse(res, 200, "Similar posts retrieved", posts);
  } catch (err) {
    return errorResponse(res, err);
  }
}

/*
--------------------------------
Recommended Posts
--------------------------------
*/
async function getRecommendedPostsHandler(req, res) {
  try {
    const posts = await postModel.getRecommendedPosts();

    return successResponse(res, 200, "Recommended posts retrieved", posts);
  } catch (err) {
    return errorResponse(res, err);
  }
}

/*
--------------------------------
Trending Posts
--------------------------------
*/
async function getTrendingPostsHandler(req, res) {
  try {
    const posts = await postModel.getTrendingPosts();

    return successResponse(res, 200, "Trending posts retrieved", posts);
  } catch (err) {
    return errorResponse(res, err);
  }
}

/*
--------------------------------
Latest Posts
--------------------------------
*/
async function getLatestPostsHandler(req, res) {
  try {
    const posts = await postModel.getLatestPosts();

    return successResponse(res, 200, "Latest posts retrieved", posts);
  } catch (err) {
    return errorResponse(res, err);
  }
}

/*
--------------------------------
Posts By Author
--------------------------------
*/
async function getPostsByAuthorHandler(req, res) {
  try {
    const authorId = parseInt(req.params.authorId, 10);
    const posts = await postModel.getPostsByAuthor(authorId);

    return successResponse(res, 200, "Author posts retrieved", posts);
  } catch (err) {
    return errorResponse(res, err);
  }
}

/*
--------------------------------
Archive
--------------------------------
*/
async function getArchivePostsHandler(req, res) {
  try {
    const year = req.query.year;
    const month = req.query.month;

    const posts = await postModel.getArchivePosts(year, month);

    return successResponse(res, 200, "Archive posts retrieved", posts);
  } catch (err) {
    return errorResponse(res, err);
  }
}

/*
--------------------------------
Featured Posts
--------------------------------
*/
async function getFeaturedPostsHandler(req, res) {
  try {
    const posts = await postModel.getFeaturedPosts();

    return successResponse(res, 200, "Featured posts retrieved", posts);
  } catch (err) {
    return errorResponse(res, err);
  }
}

/*
--------------------------------
Next / Previous Navigation
--------------------------------
*/
async function getPostNavigationHandler(req, res) {
  try {
    const slug = req.params.slug;

    const nav = await postModel.getPostNavigation(slug);

    return successResponse(res, 200, "Navigation posts retrieved", nav);
  } catch (err) {
    return errorResponse(res, err);
  }
}

async function toggleFeaturedPostHandler(req, res) {
  try {
    const id = parseInt(req.params.id, 10);

    const post = await postModel.toggleFeaturedPost(id);

    if (!post) {
      return errorResponse(res, new Error("Post not found"), 404);
    }

    return successResponse(res, 200, "Post featured status updated", post);
  } catch (err) {
    return errorResponse(res, err);
  }
}

/*
--------------------------------
Posts By Category
--------------------------------
*/
async function getPostsByCategoryHandler(req, res) {
  try {
    const categoryId = parseInt(req.params.categoryId, 10);

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const posts = await postModel.getPostsByCategory(categoryId, page, limit);

    return successResponse(res, 200, "Category posts retrieved", posts);
  } catch (err) {
    return errorResponse(res, err);
  }
}

/*
--------------------------------
Posts By Tag
--------------------------------
*/
async function getPostsByTagHandler(req, res) {
  try {
    const tagId = parseInt(req.params.tagId, 10);

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const posts = await postModel.getPostsByTag(tagId, page, limit);

    return successResponse(res, 200, "Tag posts retrieved", posts);
  } catch (err) {
    return errorResponse(res, err);
  }
}



async function togglePostLikeHandler(req, res) {
  try {
    console.log("→ togglePostLikeHandler called");
    console.log("Headers:", req.headers);
    console.log("req.user :", req.user);               // ← most important
    console.log("typeof req.user :", typeof req.user);

    const postId = parseInt(req.params.postId, 10);
    const userId = req.user?.userId;                   // safer

    console.log("Extracted userId:", userId);          // ← this should tell you

    if (!userId) {
      return res.status(401).json({ error: "User ID not found in token" });
    }

    const result = await postModel.togglePostLike(postId, userId);
    
    return successResponse(res, 200, "Post like status updated ", result);


  } catch (err) {
    return errorResponse(res, err);
  }
}

module.exports = {
  createPostHandler,
  getPostByIdHandler,
  getPostBySlugHandler,
  getAllPublishedPostsHandler,
  incrementPostViewHandler,
  getAllPostsHandler,
  updatePostHandler,
  getPostsByCategoryHandler,
  deletePostHandler,
  getPostsByTagHandler,
  searchPostsHandler,
  toggleFeaturedPostHandler,
  getSimilarPostsHandler,
  getRecommendedPostsHandler,
  getTrendingPostsHandler,
  getLatestPostsHandler,
  getPostsByAuthorHandler,
  getArchivePostsHandler,
  getFeaturedPostsHandler,
  getPostNavigationHandler,
  togglePostLikeHandler
};
