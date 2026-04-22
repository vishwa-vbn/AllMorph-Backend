
const bookmarkModel = require("../models/bookmark.model");
const { successResponse, errorResponse } = require("../utils/response");

async function bookmarkPostHandler(req, res) {
  try {
    const postId = parseInt(req.params.id, 10);
   const userId = req.user.userId;;
    const bookmark = await bookmarkModel.bookmarkPost(postId, userId);
    return successResponse(res, 201, "Post bookmarked successfully", bookmark);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}

async function removeBookmarkHandler(req, res) {
  try {
    const postId = parseInt(req.params.id, 10);
    const userId = req.user.userId;
    const deletedBookmark = await bookmarkModel.removeBookmark(postId, userId);
    return successResponse(res, 200, "Bookmark removed successfully", deletedBookmark);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}

async function getBookmarksByUserHandler(req, res) {
  try {
    const userId = parseInt(req.params.userId, 10);
    const posts = await bookmarkModel.getBookmarksByUser(userId);
    return successResponse(res, 200, "Bookmarked posts retrieved successfully", posts);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}

async function getBookmarkCountHandler(req, res) {
  try {
    const postId = parseInt(req.params.id, 10);
    const count = await bookmarkModel.getBookmarkCount(postId);
    return successResponse(res, 200, "Bookmark count retrieved successfully", { count });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}

module.exports = {
  bookmarkPostHandler,
  removeBookmarkHandler,
  getBookmarksByUserHandler,
  getBookmarkCountHandler,
};
