
const likeModel = require("../models/like.model");
const { successResponse, errorResponse } = require("../utils/response");

async function likePostHandler(req, res) {
  try {
    const postId = parseInt(req.params.id, 10);
    const userId = req.user.id; // From auth middleware
    const like = await likeModel.likePost(postId, userId);
    return successResponse(res, 201, "Post liked successfully", like);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}

async function unlikePostHandler(req, res) {
  try {
    const postId = parseInt(req.params.id, 10);
    const userId = req.user.id;
    const unlike = await likeModel.unlikePost(postId, userId);
    return successResponse(res, 200, "Post unliked successfully", unlike);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}

async function getLikeCountHandler(req, res) {
  try {
    const postId = parseInt(req.params.id, 10);
    const count = await likeModel.getLikeCount(postId);
    return successResponse(res, 200, "Like count retrieved successfully", { count });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}

async function getLikedPostsByUserHandler(req, res) {
  try {
    const userId = parseInt(req.params.userId, 10);
    const posts = await likeModel.getLikedPostsByUser(userId);
    return successResponse(res, 200, "Liked posts retrieved successfully", posts);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}

module.exports = {
  likePostHandler,
  unlikePostHandler,
  getLikeCountHandler,
  getLikedPostsByUserHandler,
};
