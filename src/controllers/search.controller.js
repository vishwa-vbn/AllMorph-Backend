
const searchModel = require("../models/search.model");
const { successResponse, errorResponse } = require("../utils/response");

async function indexPostHandler(req, res) {
  try {
    const { post_id, title, content } = req.body;
    if (!post_id || !title || !content) {
      return errorResponse(res, 400, "Post ID, title, and content are required");
    }
    const indexedPost = await searchModel.indexPost(req.body);
    return successResponse(res, 201, "Post indexed successfully", indexedPost);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}

async function updateIndexHandler(req, res) {
  try {
    const postId = parseInt(req.params.postId, 10);
    const updatedIndex = await searchModel.updateIndex(postId, req.body);
    if (!updatedIndex) return errorResponse(res, 404, "Index record not found");
    return successResponse(res, 200, "Index updated successfully", updatedIndex);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}

async function removeFromIndexHandler(req, res) {
  try {
    const postId = parseInt(req.params.postId, 10);
    const removedIndex = await searchModel.removeFromIndex(postId);
    if (!removedIndex) return errorResponse(res, 404, "Index record not found");
    return successResponse(res, 200, "Post removed from index successfully", removedIndex);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}

async function searchPostsHandler(req, res) {
  try {
    const q = req.query.q;
    if (!q) return errorResponse(res, 400, "Search query is required");
    const results = await searchModel.searchPosts(q);
    return successResponse(res, 200, "Search results retrieved successfully", results);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}

async function getSearchSuggestionsHandler(req, res) {
  try {
    const q = req.query.q;
    if (!q) return errorResponse(res, 400, "Suggestion query is required");
    const suggestions = await searchModel.getSearchSuggestions(q);
    return successResponse(res, 200, "Search suggestions retrieved successfully", suggestions);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}

module.exports = {
  indexPostHandler,
  updateIndexHandler,
  removeFromIndexHandler,
  searchPostsHandler,
  getSearchSuggestionsHandler,
};
