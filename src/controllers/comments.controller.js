const Comment = require("../models/comments.model");

exports.createComment = async (req, res) => {
  try {
    const { content, postId, parentId, authorName, authorEmail } = req.body;

    const commentData = {
      content,
      postId: Number(postId),
      parentId: parentId ? Number(parentId) : null,
      status: "approved", // ← AUTO APPROVED
    };

    // Logged-in user
    if (req.user) {
      commentData.authorId = req.user.userId;
    } else {
      // Guest comment
      commentData.authorName = authorName?.trim();
      commentData.authorEmail = authorEmail?.trim();
    }

    const newComment = await Comment.createComment(commentData);

    res.status(201).json({
      success: true,
      message: "Comment submitted and approved successfully",
      data: newComment,
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(400).json({
      success: false,
      error: error.message || "Cannot create comment",
    });
  }
};

exports.getApprovedCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await Comment.getApprovedCommentsByPost(postId);
    res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (error) {
    console.error("Error fetching approved comments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch approved comments",
    });
  }
};

exports.getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { status } = req.query;
    const comments = await Comment.getCommentsByPost(postId, status);
    res.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.approveComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const updatedComment = await Comment.updateCommentStatus(
      commentId,
      "approved",
    );
    res.json({
      success: true,
      data: updatedComment,
    });
  } catch (error) {
    console.error("Error approving comment:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.rejectComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const updatedComment = await Comment.updateCommentStatus(
      commentId,
      "rejected",
    );
    res.json({
      success: true,
      data: updatedComment,
    });
  } catch (error) {
    console.error("Error rejecting comment:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const deletedComment = await Comment.deleteComment(commentId);
    res.json({
      success: true,
      data: deletedComment,
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ error: "Server error" });
  }
};
