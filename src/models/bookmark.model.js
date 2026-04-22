const { queryClient: client } = require("../config/db");

const bookmarkPost = async (postId, userId) => {
  const query = `
    INSERT INTO post_bookmarks (post_id, user_id)
    VALUES ($1, $2)
    ON CONFLICT (post_id, user_id) DO NOTHING
    RETURNING *;
  `;
  const { rows } = await client.query(query, [postId, userId]);
  return rows[0];
};

const removeBookmark = async (postId, userId) => {
  const query = `DELETE FROM post_bookmarks WHERE post_id = $1 AND user_id = $2 RETURNING *;`;
  const { rows } = await client.query(query, [postId, userId]);
  return rows[0];
};

const getBookmarksByUser = async (userId) => {
  const query = `
    SELECT 
      p.*,

      -- ✅ author info
      u.name AS author_name,
      u.avatar AS author_avatar,
      u.username AS author_username,

      -- ✅ likes count
      (
        SELECT COUNT(*) 
        FROM post_likes pl 
        WHERE pl.post_id = p.id
      )::int AS "likes_count",

      -- ✅ is liked by current user
      EXISTS (
        SELECT 1 
        FROM post_likes pl 
        WHERE pl.post_id = p.id 
        AND pl.user_id = $1
      ) AS "isLiked",

      -- ✅ bookmark count
      (
        SELECT COUNT(*) 
        FROM post_bookmarks pb2 
        WHERE pb2.post_id = p.id
      )::int AS "bookmarks_count",

      -- ✅ is bookmarked by current user (always true here, but good for consistency)
      TRUE AS "isBookmarked"

    FROM posts p
    JOIN post_bookmarks pb ON p.id = pb.post_id
    LEFT JOIN users u ON p.authorId = u.id

    WHERE pb.user_id = $1
    ORDER BY pb.created_at DESC;
  `;

  const { rows } = await client.query(query, [userId]);
  return rows;
};

const getBookmarkCount = async (postId) => {
  const query = `SELECT COUNT(*) FROM post_bookmarks WHERE post_id = $1;`;
  const { rows } = await client.query(query, [postId]);
  return parseInt(rows[0].count, 10);
};

module.exports = {
  bookmarkPost,
  removeBookmark,
  getBookmarksByUser,
  getBookmarkCount,
};
