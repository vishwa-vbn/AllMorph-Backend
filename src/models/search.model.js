
const { queryClient: client } = require("../config/db");

const indexPost = async (data) => {
  const { post_id, title, content, tags, categories } = data;
  const query = `
    INSERT INTO post_search_index (post_id, title, content, tags, categories, search_vector)
    VALUES ($1, $2, $3, $4, $5, to_tsvector('english', $2 || ' ' || $3 || ' ' || $4 || ' ' || $5))
    ON CONFLICT (post_id) DO UPDATE
    SET title = $2,
        content = $3,
        tags = $4,
        categories = $5,
        search_vector = to_tsvector('english', $2 || ' ' || $3 || ' ' || $4 || ' ' || $5)
    RETURNING *;
  `;
  const { rows } = await client.query(query, [post_id, title, content, tags, categories]);
  return rows[0];
};

const updateIndex = async (postId, data) => {
  const { title, content, tags, categories } = data;
  const query = `
    UPDATE post_search_index
    SET title = $2,
        content = $3,
        tags = $4,
        categories = $5,
        search_vector = to_tsvector('english', $2 || ' ' || $3 || ' ' || $4 || ' ' || $5)
    WHERE post_id = $1
    RETURNING *;
  `;
  const { rows } = await client.query(query, [postId, title, content, tags, categories]);
  return rows[0];
};

const removeFromIndex = async (postId) => {
  const query = `DELETE FROM post_search_index WHERE post_id = $1 RETURNING *;`;
  const { rows } = await client.query(query, [postId]);
  return rows[0];
};

const searchPosts = async (q) => {
  const query = `
    SELECT post_id, title, content, ts_rank(search_vector, plainto_tsquery('english', $1)) as rank
    FROM post_search_index
    WHERE search_vector @@ plainto_tsquery('english', $1)
    ORDER BY rank DESC;
  `;
  const { rows } = await client.query(query, [q]);
  return rows;
};

const getSearchSuggestions = async (q) => {
  const query = `
    SELECT title
    FROM post_search_index
    WHERE title ILIKE $1
    LIMIT 5;
  `;
  const { rows } = await client.query(query, [`%${q}%`]);
  return rows.map(r => r.title);
};

module.exports = {
  indexPost,
  updateIndex,
  removeFromIndex,
  searchPosts,
  getSearchSuggestions,
};
