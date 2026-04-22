const dashboardModel = require("../models/dashboard.model");
const { successResponse, errorResponse } = require("../utils/response");

/* ─────────────────────────────────────────────────────────────────────────
   GET /api/dashboard/overview
   All top-level KPI counts in one shot.
   Powers: Stat cards (postsCount, usersCount, viewsCount, active sessions proxy)
   ───────────────────────────────────────────────────────────────────────── */
async function getOverviewStatsHandler(req, res) {
  try {
    const stats = await dashboardModel.getOverviewStats();
    return successResponse(
      res,
      200,
      "Dashboard overview stats retrieved",
      stats,
    );
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}

/* ─────────────────────────────────────────────────────────────────────────
   GET /api/dashboard/weekly-traffic
   Views per day for the last 7 days.
   Powers: Bar chart — "Weekly Traffic"
   Response shape: { labels: string[], data: number[] }
   ───────────────────────────────────────────────────────────────────────── */
async function getWeeklyTrafficHandler(req, res) {
  try {
    const rows = await dashboardModel.getWeeklyTraffic();

    const payload = {
      labels: rows.map((r) => r.label), // ["Mon", "Tue", …]
      datasets: [
        {
          label: "Page Views",
          data: rows.map((r) => r.views), // [142, 98, 203, …]
        },
      ],
      raw: rows, // full rows in case frontend needs dates
    };

    return successResponse(res, 200, "Weekly traffic retrieved", payload);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}

/* ─────────────────────────────────────────────────────────────────────────
   GET /api/dashboard/publishing-growth
   Posts published per month for the last 12 months.
   Powers: Line chart — "Publishing Activity / Growth"
   ───────────────────────────────────────────────────────────────────────── */
async function getPublishingGrowthHandler(req, res) {
  try {
    const rows = await dashboardModel.getMonthlyPublishingGrowth();

    const payload = {
      labels: rows.map((r) => r.label), // ["Apr 24", "May 24", …]
      datasets: [
        {
          label: "Posts Published",
          data: rows.map((r) => r.posts),
        },
      ],
      raw: rows,
    };

    return successResponse(
      res,
      200,
      "Publishing growth data retrieved",
      payload,
    );
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}

/* ─────────────────────────────────────────────────────────────────────────
   GET /api/dashboard/post-status
   Post counts by status (published, draft, …).
   Powers: Doughnut chart — "Post Status"
   ───────────────────────────────────────────────────────────────────────── */
async function getPostStatusHandler(req, res) {
  try {
    const rows = await dashboardModel.getPostStatusDistribution();

    // Map statuses to chart-friendly colors
    const COLOR_MAP = {
      published: "#6366f1",
      draft: "#f59e0b",
      archived: "#94a3b8",
      scheduled: "#06b6d4",
    };

    const payload = {
      labels: rows.map(
        (r) => r.status.charAt(0).toUpperCase() + r.status.slice(1),
      ),
      datasets: [
        {
          label: "Posts",
          data: rows.map((r) => r.count),
          backgroundColor: rows.map((r) => COLOR_MAP[r.status] ?? "#e5e7eb"),
        },
      ],
      raw: rows,
    };

    return successResponse(
      res,
      200,
      "Post status distribution retrieved",
      payload,
    );
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}

/* ─────────────────────────────────────────────────────────────────────────
   GET /api/dashboard/traffic-sources
   View counts grouped by source (Organic, Direct, Social, etc.).
   Powers: Traffic Sources breakdown panel (stacked bar + metric bars)
   ───────────────────────────────────────────────────────────────────────── */
async function getTrafficSourcesHandler(req, res) {
  try {
    const rows = await dashboardModel.getTrafficSources();
    const totalViews = rows.reduce((sum, r) => sum + r.views, 0);

    const payload = rows.map((r) => ({
      source: r.source,
      views: r.views,
      percentage:
        totalViews > 0 ? +((r.views / totalViews) * 100).toFixed(1) : 0,
    }));

    return successResponse(res, 200, "Traffic sources retrieved", {
      sources: payload,
      totalViews,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}

/* ─────────────────────────────────────────────────────────────────────────
   GET /api/dashboard/recent-posts?limit=5
   Latest published posts with author & engagement info.
   Powers: Recent Activity card — Posts tab
   ───────────────────────────────────────────────────────────────────────── */
async function getRecentPostsHandler(req, res) {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 5, 20);
    const posts = await dashboardModel.getRecentPosts(limit);
    return successResponse(res, 200, "Recent posts retrieved", posts);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}

/* ─────────────────────────────────────────────────────────────────────────
   GET /api/dashboard/heatmap
   Daily post counts for the last 49 days (7 weeks × 7 days).
   Powers: Publishing Activity heatmap
   ───────────────────────────────────────────────────────────────────────── */
async function getHeatmapHandler(req, res) {
  try {
    const rows = await dashboardModel.getPublishingActivityHeatmap();

    // Return flat array of counts, ordered oldest → newest
    // Frontend indexes this directly as: heatmap[weekIndex * 7 + dayIndex]
    const payload = {
      counts: rows.map((r) => r.count), // 49 values
      raw: rows, // dates for tooltips
    };

    return successResponse(
      res,
      200,
      "Publishing heatmap data retrieved",
      payload,
    );
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}

/* ─────────────────────────────────────────────────────────────────────────
   GET /api/dashboard/top-posts?limit=5
   Top posts by view count with engagement metrics.
   Powers: (optional) Top Posts panel
   ───────────────────────────────────────────────────────────────────────── */
async function getTopPostsHandler(req, res) {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 5, 20);
    const posts = await dashboardModel.getTopPosts(limit);
    return successResponse(res, 200, "Top posts retrieved", posts);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}

/* ─────────────────────────────────────────────────────────────────────────
   GET /api/dashboard/recent-comments?limit=5
   Latest comments across all posts.
   Powers: Recent Activity card — Comments tab
   ───────────────────────────────────────────────────────────────────────── */
async function getRecentCommentsHandler(req, res) {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 5, 20);
    const comments = await dashboardModel.getRecentComments(limit);
    return successResponse(res, 200, "Recent comments retrieved", comments);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}

/* ─────────────────────────────────────────────────────────────────────────
   GET /api/dashboard/subscriber-growth
   Monthly new newsletter subscribers for the last 12 months.
   Powers: Line chart (alternative dataset for "Growth" line chart)
   ───────────────────────────────────────────────────────────────────────── */
async function getSubscriberGrowthHandler(req, res) {
  try {
    const rows = await dashboardModel.getSubscriberGrowth();

    const payload = {
      labels: rows.map((r) => r.label),
      datasets: [
        {
          label: "New Subscribers",
          data: rows.map((r) => r.subscribers),
        },
      ],
      raw: rows,
    };

    return successResponse(
      res,
      200,
      "Subscriber growth data retrieved",
      payload,
    );
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}

/* ─────────────────────────────────────────────────────────────────────────
   GET /api/dashboard/all
   Single aggregated endpoint — fetches everything in parallel.
   Use this if you want to load the entire dashboard in one request.
   ───────────────────────────────────────────────────────────────────────── */
async function getAllDashboardDataHandler(req, res) {
  try {
    const [
      stats,
      weeklyTrafficRows,
      publishingGrowthRows,
      postStatusRows,
      trafficSourceRows,
      recentPosts,
      heatmapRows,
      topPosts,
      recentComments,
      subscriberGrowthRows,
    ] = await Promise.all([
      dashboardModel.getOverviewStats(),
      dashboardModel.getWeeklyTraffic(),
      dashboardModel.getMonthlyPublishingGrowth(),
      dashboardModel.getPostStatusDistribution(),
      dashboardModel.getTrafficSources(),
      dashboardModel.getRecentPosts(5),
      dashboardModel.getPublishingActivityHeatmap(),
      dashboardModel.getTopPosts(5),
      dashboardModel.getRecentComments(5),
      dashboardModel.getSubscriberGrowth(),
    ]);

    // Color map for post status
    const COLOR_MAP = {
      published: "#6366f1",
      draft: "#f59e0b",
      archived: "#94a3b8",
      scheduled: "#06b6d4",
    };

    const totalTrafficViews = trafficSourceRows.reduce(
      (s, r) => s + r.views,
      0,
    );

    const payload = {
      stats,

      barData: {
        labels: weeklyTrafficRows.map((r) => r.label),
        datasets: [
          { label: "Page Views", data: weeklyTrafficRows.map((r) => r.views) },
        ],
      },

      lineData: {
        labels: publishingGrowthRows.map((r) => r.label),
        datasets: [
          {
            label: "Posts Published",
            data: publishingGrowthRows.map((r) => r.posts),
          },
        ],
      },

      doughnutData: {
        labels: postStatusRows.map(
          (r) => r.status.charAt(0).toUpperCase() + r.status.slice(1),
        ),
        datasets: [
          {
            label: "Posts",
            data: postStatusRows.map((r) => r.count),
            backgroundColor: postStatusRows.map(
              (r) => COLOR_MAP[r.status] ?? "#e5e7eb",
            ),
          },
        ],
      },

      trafficSources: {
        sources: trafficSourceRows.map((r) => ({
          source: r.source,
          views: r.views,
          percentage:
            totalTrafficViews > 0
              ? +((r.views / totalTrafficViews) * 100).toFixed(1)
              : 0,
        })),
        totalViews: totalTrafficViews,
      },

      recentPosts,
      topPosts,
      recentComments,

      heatmap: {
        counts: heatmapRows.map((r) => r.count),
        raw: heatmapRows,
      },

      subscriberGrowth: {
        labels: subscriberGrowthRows.map((r) => r.label),
        datasets: [
          {
            label: "New Subscribers",
            data: subscriberGrowthRows.map((r) => r.subscribers),
          },
        ],
      },
    };

    return successResponse(
      res,
      200,
      "Dashboard data retrieved successfully",
      payload,
    );
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}

module.exports = {
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
};
