const express = require("express");
const {
  getOverviewStatsHandler,
  getWeeklyTrafficHandler,
  getPublishingGrowthHandler,
  getPostStatusHandler,
  getTrafficSourcesHandler,
  getRecentPostsHandler,
  getHeatmapHandler,
  getTopPostsHandler,
  getRecentCommentsHandler,
  getSubscriberGrowthHandler,
  getAllDashboardDataHandler,
} = require("../controllers/dashboard.controller");
const { isAuthenticated } = require("../middleware/auth");

const router = express.Router();

// ── All dashboard routes are protected ────────────────────────────────────
router.use(isAuthenticated);

// Single aggregated endpoint — load entire dashboard in one network request
router.get("/all", getAllDashboardDataHandler);

// Individual endpoints — use when you need lazy / on-demand loading
router.get("/overview", getOverviewStatsHandler);
router.get("/weekly-traffic", getWeeklyTrafficHandler);
router.get("/publishing-growth", getPublishingGrowthHandler);
router.get("/post-status", getPostStatusHandler);
router.get("/traffic-sources", getTrafficSourcesHandler);
router.get("/recent-posts", getRecentPostsHandler); // ?limit=5
router.get("/heatmap", getHeatmapHandler);
router.get("/top-posts", getTopPostsHandler); // ?limit=5
router.get("/recent-comments", getRecentCommentsHandler); // ?limit=5
router.get("/subscriber-growth", getSubscriberGrowthHandler);

module.exports = router;
