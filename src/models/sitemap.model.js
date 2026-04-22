const { queryClient: client } = require("../config/db");

const storeLog = async (totalUrls) => {
  const query = `
    INSERT INTO sitemap_logs (total_urls)
    VALUES ($1)
    RETURNING *;
  `;
  const { rows } = await client.query(query, [totalUrls]);
  return rows[0];
};

const getAllLogs = async () => {
  const query = `SELECT * FROM sitemap_logs ORDER BY generated_at DESC;`;
  const { rows } = await client.query(query);
  return rows;
};

const getLatestLog = async () => {
  const query = `SELECT * FROM sitemap_logs ORDER BY generated_at DESC LIMIT 1;`;
  const { rows } = await client.query(query);
  return rows[0];
};

const deleteLog = async (id) => {
  const query = `DELETE FROM sitemap_logs WHERE id = $1 RETURNING *;`;
  const { rows } = await client.query(query, [id]);
  return rows[0];
};

// --- NEW FUNCTION TO FETCH SITEMAP URLs ---
const getActiveUrls = async () => {
  // Fetching published posts
  const postsQuery = `SELECT slug, publishedat as updated_at FROM posts WHERE status = 'published'`;
  const postsResult = await client.query(postsQuery);

  // Fetching published pages
  const pagesQuery = `SELECT slug, updated_at FROM pages WHERE is_published = true`;
  const pagesResult = await client.query(pagesQuery);

  return {
    posts: postsResult.rows,
    pages: pagesResult.rows,
  };
};

module.exports = {
  storeLog,
  getAllLogs,
  getLatestLog,
  deleteLog,
  getActiveUrls, // Don't forget to export it!
};
