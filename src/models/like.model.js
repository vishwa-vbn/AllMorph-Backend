
const { queryClient: client } = require("../config/db");

const likePost = async (postId, userId) => {
  const query = `
    INSERT INTO post_likes (post_id, user_id)
    VALUES ($1, $2)
    ON CONFLICT (post_id, user_id) DO NOTHING
    RETURNING *;
  `;
  const { rows } = await client.query(query, [postId, userId]);
  return rows[0];
};

const unlikePost = async (postId, userId) => {
  const query = `DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2 RETURNING *;`;
  const { rows } = await client.query(query, [postId, userId]);
  return rows[0];
};

const getLikeCount = async (postId) => {
  const query = `SELECT COUNT(*) FROM post_likes WHERE post_id = $1;`;
  const { rows } = await client.query(query, [postId]);
  return parseInt(rows[0].count, 10);
};

const getLikedPostsByUser = async (userId) => {
  const query = `
    SELECT p.*
    FROM posts p
    JOIN post_likes pl ON p.id = pl.post_id
    WHERE pl.user_id = $1
    ORDER BY pl.created_at DESC;
  `;
  const { rows } = await client.query(query, [userId]);
  return rows;
};

module.exports = {
  likePost,
  unlikePost,
  getLikeCount,
  getLikedPostsByUser,
};
