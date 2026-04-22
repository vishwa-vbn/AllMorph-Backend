
const { queryClient: client } = require("../config/db");

const createPage = async (data) => {
  const { slug, title, content, meta_title, meta_description, is_published } = data;
  const query = `
    INSERT INTO pages (slug, title, content, meta_title, meta_description, is_published)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;
  const { rows } = await client.query(query, [slug, title, content, meta_title, meta_description, is_published]);
  return rows[0];
};

const getAllPages = async () => {
  const query = `SELECT * FROM pages ORDER BY created_at DESC;`;
  const { rows } = await client.query(query);
  return rows;
};

const getPageBySlug = async (slug) => {
  const query = `SELECT * FROM pages WHERE slug = $1;`;
  const { rows } = await client.query(query, [slug]);
  return rows[0];
};

const updatePage = async (id, data) => {
  const fields = [];
  const values = [];
  let index = 1;

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      fields.push(`${key} = $${index}`);
      values.push(value);
      index++;
    }
  }

  if (fields.length === 0) return null;

  const query = `
    UPDATE pages
    SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${index}
    RETURNING *;
  `;
  values.push(id);

  const { rows } = await client.query(query, values);
  return rows[0];
};

const deletePage = async (id) => {
  const query = `DELETE FROM pages WHERE id = $1 RETURNING *;`;
  const { rows } = await client.query(query, [id]);
  return rows[0];
};

const getPublishedPages = async () => {
  const query = `SELECT * FROM pages WHERE is_published = true ORDER BY created_at DESC;`;
  const { rows } = await client.query(query);
  return rows;
};

module.exports = {
  createPage,
  getAllPages,
  getPageBySlug,
  updatePage,
  deletePage,
  getPublishedPages,
};
