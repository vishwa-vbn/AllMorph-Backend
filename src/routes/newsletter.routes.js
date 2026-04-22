
const express = require("express");
const {
  subscribeHandler,
  getAllSubscribersHandler,
  getSubscriberByIdHandler,
  verifySubscriberHandler,
  unsubscribeHandler,
  getSubscriberCountHandler,
} = require("../controllers/newsletter.controller");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

const router = express.Router();

// Public routes
router.post("/subscribe", subscribeHandler);
router.put("/verify/:token", verifySubscriberHandler);
router.delete("/unsubscribe", unsubscribeHandler);

// Admin routes
router.get("/subscribers", isAuthenticated, isAdmin, getAllSubscribersHandler);
router.get("/subscribers/:id", isAuthenticated, isAdmin, getSubscriberByIdHandler);
router.get("/count", isAuthenticated, isAdmin, getSubscriberCountHandler);

module.exports = router;
