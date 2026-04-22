
const express = require("express");
const {
  sendMessageHandler,
  getAllMessagesHandler,
  getMessageByIdHandler,
  updateMessageStatusHandler,
  deleteMessageHandler,
  getUnreadMessagesCountHandler,
  getUnreadMessagesHandler,
} = require("../controllers/contact.controller");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

const router = express.Router();

// Public routes
router.post("/send", sendMessageHandler);

// Admin routes
router.get("/messages", isAuthenticated, isAdmin, getAllMessagesHandler);
router.get("/messages/unread", isAuthenticated, isAdmin, getUnreadMessagesHandler);
router.get("/messages/:id", isAuthenticated, isAdmin, getMessageByIdHandler);
router.put("/messages/:id/status", isAuthenticated, isAdmin, updateMessageStatusHandler);
router.delete("/messages/:id", isAuthenticated, isAdmin, deleteMessageHandler);
router.get(
  "/messages/unread/count",
  isAuthenticated,
  isAdmin,
  getUnreadMessagesCountHandler
);


module.exports = router;
