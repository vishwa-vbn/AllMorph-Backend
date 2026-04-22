const { queryClient: client } = require("../config/db");

/* ─────────────────────────────────────────────────────────────────────────
   1. OVERVIEW STATS
   Returns all top-level counts needed for the 4 stat cards.
   ───────────────────────────────────────────────────────────────────────── */
const getOverviewStats = async () => {
  const query = `
    SELECT
      -- Posts
      (SELECT COUNT(*) FROM posts)::int                                             AS "postsCount",
      (SELECT COUNT(*) FROM posts WHERE status = 'published')::int                 AS "publishedCount",
      (SELECT COUNT(*) FROM posts WHERE status = 'draft')::int                     AS "draftsCount",

      -- Users
      (SELECT COUNT(*) FROM users)::int                                             AS "usersCount",

      -- Total views: sum of all rows in post_views table (each row = 1 visit)
      (SELECT COUNT(*) FROM post_views)::int                                        AS "viewsCount",

      -- Engagement
      (SELECT COUNT(*) FROM post_likes)::int                                        AS "likesCount",
      (SELECT COUNT(*) FROM post_bookmarks)::int                                    AS "bookmarksCount",

      -- Comments (approved only for a meaningful metric)
      (SELECT COUNT(*) FROM comments WHERE status = 'approved')::int               AS "commentsCount",
      (SELECT COUNT(*) FROM comments WHERE status = 'pending')::int                AS "pendingCommentsCount",

      -- Newsletter
      (SELECT COUNT(*) FROM newsletter_subscribers WHERE is_verified = true)::int  AS "subscribersCount",

      -- Categories & Tags
      (SELECT COUNT(*) FROM categories)::int                                        AS "categoriesCount",
      (SELECT COUNT(*) FROM tags)::int                                              AS "tagsCount",

      -- Contact messages (unread)
      (SELECT COUNT(*) FROM contact_messages WHERE status = 'unread')::int         AS "unreadMessagesCount";
  `;

  const { rows } = await client.query(query);
  return rows[0];
};

/* ─────────────────────────────────────────────────────────────────────────
   2. WEEKLY TRAFFIC  (Bar Chart)
   Views per day for the last 7 days from post_views.viewed_at
   Returns: [{ day: 'Mon', views: 142 }, ...]
   ───────────────────────────────────────────────────────────────────────── */
const getWeeklyTraffic = async () => {
  const query = `
    WITH date_series AS (
      SELECT generate_series(
        CURRENT_DATE - INTERVAL '6 days',
        CURRENT_DATE,
        '1 day'::interval
      )::date AS day
    )
    SELECT
      TO_CHAR(ds.day, 'Dy')   AS "label",    -- Mon, Tue …
      ds.day::text             AS "date",
      COALESCE(COUNT(pv.id), 0)::int AS "views"
    FROM date_series ds
    LEFT JOIN post_views pv
      ON pv.viewed_at::date = ds.day
    GROUP BY ds.day
    ORDER BY ds.day ASC;
  `;

  const { rows } = await client.query(query);
  return rows;
};

/* ─────────────────────────────────────────────────────────────────────────
   3. MONTHLY PUBLISHING ACTIVITY  (Line Chart)
   Number of posts published per month for the last 12 months.
   Since users has no created_at we use published posts as the growth signal.
   Returns: [{ month: 'Apr 24', posts: 8 }, ...]
   ───────────────────────────────────────────────────────────────────────── */
const getMonthlyPublishingGrowth = async () => {
  const query = `
    WITH month_series AS (
      SELECT generate_series(
        DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '11 months',
        DATE_TRUNC('month', CURRENT_DATE),
        '1 month'::interval
      )::date AS month_start
    )
    SELECT
      TO_CHAR(ms.month_start, 'Mon YY')  AS "label",
      ms.month_start::text               AS "month",
      COALESCE(COUNT(p.id), 0)::int      AS "posts"
    FROM month_series ms
    LEFT JOIN posts p
      ON  p.status = 'published'
      AND TO_DATE(p.publishedat, 'YYYY-MM-DD') >= ms.month_start
      AND TO_DATE(p.publishedat, 'YYYY-MM-DD') <  ms.month_start + INTERVAL '1 month'
    GROUP BY ms.month_start
    ORDER BY ms.month_start ASC;
  `;

  const { rows } = await client.query(query);
  return rows;
};

/* ─────────────────────────────────────────────────────────────────────────
   4. POST STATUS DISTRIBUTION  (Doughnut Chart)
   Counts of posts grouped by their status field.
   Returns: [{ status: 'published', count: 34 }, ...]
   ───────────────────────────────────────────────────────────────────────── */
const getPostStatusDistribution = async () => {
  const query = `
    SELECT
      status,
      COUNT(*)::int AS "count"
    FROM posts
    GROUP BY status
    ORDER BY "count" DESC;
  `;

  const { rows } = await client.query(query);
  return rows;
};

/* ─────────────────────────────────────────────────────────────────────────
   5. TRAFFIC SOURCES  (Stacked bar / breakdown panel)
   Groups post_views by their source column.
   The source column already stores values like 'Organic', 'Direct', etc.
   Returns: [{ source: 'Organic', views: 420 }, ...]
   ───────────────────────────────────────────────────────────────────────── */
const getTrafficSources = async () => {
  const query = `
    SELECT
      COALESCE(NULLIF(TRIM(source), ''), 'Referrals') AS "source",
      COUNT(*)::int                                    AS "views"
    FROM post_views
    GROUP BY source
    ORDER BY "views" DESC;
  `;

  const { rows } = await client.query(query);
  return rows;
};

/* ─────────────────────────────────────────────────────────────────────────
   6. RECENT POSTS
   Last N published posts with author info, likes, and comment count.
   Returns an array of post objects.
   ───────────────────────────────────────────────────────────────────────── */
const getRecentPosts = async (limit = 5) => {
  const query = `
    SELECT
      p.id,
      p.title,
      p.slug,
      p.featuredimage,
      p.status,
      p.publishedat,
      p.viewcount,
      p.likes_count,

      -- Author
      u.name    AS "authorName",
      u.avatar  AS "authorAvatar",
      u.username AS "authorUsername",

      -- Comment count
      (
        SELECT COUNT(*) FROM comments c
        WHERE c.postid = p.id AND c.status = 'approved'
      )::int AS "commentsCount",

      -- Bookmark count
      (
        SELECT COUNT(*) FROM post_bookmarks pb
        WHERE pb.post_id = p.id
      )::int AS "bookmarksCount"

    FROM posts p
    LEFT JOIN users u ON p.authorid = u.id
    WHERE p.status = 'published'
    ORDER BY p.publishedat DESC NULLS LAST
    LIMIT $1;
  `;

  const { rows } = await client.query(query, [limit]);
  return rows;
};

/* ─────────────────────────────────────────────────────────────────────────
   7. PUBLISHING ACTIVITY HEATMAP
   Returns count of published posts per day for the last 49 days (7×7 grid).
   Frontend maps these to heatmap cells.
   Returns: [{ date: '2025-03-01', count: 3 }, ...]
   ───────────────────────────────────────────────────────────────────────── */
const getPublishingActivityHeatmap = async () => {
  const query = `
    WITH date_series AS (
      SELECT generate_series(
        CURRENT_DATE - INTERVAL '48 days',
        CURRENT_DATE,
        '1 day'::interval
      )::date AS day
    )
    SELECT
      ds.day::text                    AS "date",
      COALESCE(COUNT(p.id), 0)::int  AS "count"
    FROM date_series ds
    LEFT JOIN posts p
      ON  p.status = 'published'
      AND TO_DATE(p.publishedat, 'YYYY-MM-DD') = ds.day
    GROUP BY ds.day
    ORDER BY ds.day ASC;
  `;

  const { rows } = await client.query(query);
  return rows;
};

/* ─────────────────────────────────────────────────────────────────────────
   8. TOP PERFORMING POSTS
   Posts ranked by total view count, with engagement metrics.
   ───────────────────────────────────────────────────────────────────────── */
const getTopPosts = async (limit = 5) => {
  const query = `
    SELECT
      p.id,
      p.title,
      p.slug,
      p.viewcount,
      p.likes_count,
      u.name    AS "authorName",
      u.avatar  AS "authorAvatar",
      (
        SELECT COUNT(*) FROM comments c
        WHERE c.postid = p.id AND c.status = 'approved'
      )::int AS "commentsCount"
    FROM posts p
    LEFT JOIN users u ON p.authorid = u.id
    WHERE p.status = 'published'
    ORDER BY p.viewcount DESC
    LIMIT $1;
  `;

  const { rows } = await client.query(query, [limit]);
  return rows;
};

/* ─────────────────────────────────────────────────────────────────────────
   9. RECENT COMMENTS (for activity tab)
   ───────────────────────────────────────────────────────────────────────── */
const getRecentComments = async (limit = 5) => {
  const query = `
    SELECT
      c.id,
      c.content,
      c.authorname,
      c.authoremail,
      c.status,
      c.createdat,
      p.title  AS "postTitle",
      p.slug   AS "postSlug"
    FROM comments c
    LEFT JOIN posts p ON c.postid = p.id
    ORDER BY c.id DESC
    LIMIT $1;
  `;

  const { rows } = await client.query(query, [limit]);
  return rows;
};

/* ─────────────────────────────────────────────────────────────────────────
   10. NEWSLETTER SUBSCRIBER GROWTH  (Bonus line chart)
   Monthly new verified subscribers over the last 12 months.
   ───────────────────────────────────────────────────────────────────────── */
const getSubscriberGrowth = async () => {
  const query = `
    WITH month_series AS (
      SELECT generate_series(
        DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '11 months',
        DATE_TRUNC('month', CURRENT_DATE),
        '1 month'::interval
      )::date AS month_start
    )
    SELECT
      TO_CHAR(ms.month_start, 'Mon YY')  AS "label",
      COALESCE(COUNT(ns.id), 0)::int     AS "subscribers"
    FROM month_series ms
    LEFT JOIN newsletter_subscribers ns
      ON  ns.is_verified = true
      AND DATE_TRUNC('month', ns.subscribed_at) = ms.month_start
    GROUP BY ms.month_start
    ORDER BY ms.month_start ASC;
  `;

  const { rows } = await client.query(query);
  return rows;
};

module.exports = {
  getOverviewStats,
  getWeeklyTraffic,
  getMonthlyPublishingGrowth,
  getPostStatusDistribution,
  getTrafficSources,
  getRecentPosts,
  getPublishingActivityHeatmap,
  getTopPosts,
  getRecentComments,
  getSubscriberGrowth,
};
