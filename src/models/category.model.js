const { queryClient: pool } = require("../config/db");

// Create a new category
const createCategory = async ({ name, slug, description, featuredImage, parentId }) => {
  const query = `
    INSERT INTO categories (name, slug, description, featuredImage, parentId)
    VALUES ($1, $2, $3, $4, $5) 
    RETURNING *;
  `;
  const values = [name, slug, description, featuredImage, parentId];

  console.log("Executing INSERT with values:", values);   // ← Add this

  try {
    const { rows } = await pool.query(query, values);
    console.log("Insert successful, returned row:", rows[0]);   // ← Add this
    return rows[0];
  } catch (error) {
    console.error("Database Error:", error);   // ← Add this
    if (error.code === '23505' && error.constraint === 'categories_slug_key') {
      throw Object.assign(new Error('Slug already exists'), {
        statusCode: 409,
        code: 'DUPLICATE_SLUG'
      });
    }
    throw error;
  }
};

// Get all categories
const getAllCategories = async () => {
  const query = `SELECT * FROM categories ORDER BY id DESC;`;
  const { rows } = await pool.query(query);
  return rows;
};

// Get category by Id
const getCategoryById = async (id) => {
  const query = `SELECT * FROM categories WHERE id = $1;`;
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

// Update a category
const updateCategory = async (id, { name, slug, description, featuredImage, parentId }) => {
  const query = `
    UPDATE categories 
    SET name = $1, slug = $2, description = $3, featuredImage = $4, parentId = $5
    WHERE id = $6 RETURNING *;
  `;
  const values = [name, slug, description, featuredImage, parentId, id];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

// Delete a category
const deleteCategory = async (id) => {
  const query = `DELETE FROM categories WHERE id = $1 RETURNING *;`;
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};