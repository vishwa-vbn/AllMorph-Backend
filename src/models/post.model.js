const { queryClient: client } = require("../config/db");

// Create a new post
const createPost = async (data) => {
  const {
    title,
    slug,
    excerpt = null,
    content,
    featuredImage = null,
    authorId,
    status = "draft",
    publishedAt = null,
    metaTitle = null,
    metaDescription = null,
    isCommentsEnabled = true,
    viewCount = 0,
    post_type = "blog_site_posts",
    custom_data = null,
  } = data;

  const customDataToStore = custom_data ? JSON.stringify(custom_data) : null;

  const query = `
    INSERT INTO posts 
      (title, slug, excerpt, content, featuredImage, authorId, status, publishedAt, metaTitle, metaDescription, isCommentsEnabled, viewCount, post_type, custom_data)
    VALUES 
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING *;
  `;
  const values = [
    title,
    slug,
    excerpt,
    content,
    featuredImage,
    authorId,
    status,
    publishedAt,
    metaTitle,
    metaDescription,
    isCommentsEnabled,
    viewCount,
    post_type,
    customDataToStore,
  ];
  const { rows } = await client.query(query, values);
  return rows[0];
};

// Get a post by ID
// Get a post by ID
const getPostById = async (id, userId = null) => {
  const query = `
    SELECT 
      p.*,
      u.name AS author_name,
      u.avatar AS author_avatar,
      u.username AS author_username,

      -- ✅ total likes count
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
        AND pl.user_id = $2
      ) AS "isLiked"

    FROM posts p
    LEFT JOIN users u ON p.authorId = u.id
    WHERE p.id = $1;
  `;

  const { rows } = await client.query(query, [id, userId]);
  return rows[0];
};

// Get a post by slug
// Get a post by slug
const getPostBySlug = async (slug, userId = null) => {
  const query = `
    SELECT 
      p.*,
      u.name AS author_name,
      u.avatar AS author_avatar,
      u.username AS author_username,

      -- ✅ total likes count
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
        AND pl.user_id = $2
      ) AS "isLiked"

    FROM posts p
    LEFT JOIN users u ON p.authorId = u.id
    WHERE p.slug = $1;
  `;

  const { rows } = await client.query(query, [slug, userId]);
  return rows[0];
};

// Get all published posts with pagination
const getAllPublishedPosts = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const query = `
    SELECT 
      p.*,
      u.name AS author_name,
      u.avatar AS author_avatar,
      u.username AS author_username
    FROM posts p
    LEFT JOIN users u ON p.authorId = u.id
    WHERE p.status = 'published'
    ORDER BY p.publishedAt DESC NULLS LAST
    LIMIT $1 OFFSET $2;
  `;
  const { rows } = await client.query(query, [limit, offset]);
  return rows;
};

// Get all posts regardless of status
const getAllPosts = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  const query = `
    SELECT 
      p.*,
      u.name AS author_name,
      u.avatar AS author_avatar,
      u.username AS author_username
    FROM posts p
    LEFT JOIN users u ON p.authorId = u.id
    ORDER BY p.publishedAt DESC NULLS LAST, p.id DESC
    LIMIT $1 OFFSET $2;
  `;

  const { rows } = await client.query(query, [limit, offset]);
  return rows;
};

// Update a post by ID
const updatePost = async (id, data) => {
  const fields = [];
  const values = [];
  let index = 1;

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      if (key === "custom_data") {
        fields.push(`${key} = $${index}`);
        values.push(value ? JSON.stringify(value) : null);
      } else {
        fields.push(`${key} = $${index}`);
        values.push(value);
      }
      index++;
    }
  }

  if (fields.length === 0) {
    throw new Error("No fields to update");
  }

  const query = `
    UPDATE posts
    SET ${fields.join(", ")}
    WHERE id = $${index}
    RETURNING *;
  `;
  values.push(id);

  const { rows } = await client.query(query, values);
  return rows[0];
};

// Delete a post by ID
const deletePost = async (id) => {
  const query = `DELETE FROM posts WHERE id = $1 RETURNING *;`;
  const { rows } = await client.query(query, [id]);
  return rows[0];
};

const incrementViewCount = async (slug) => {
  const query = `
    UPDATE posts
    SET viewcount = viewcount + 1
    WHERE slug = $1
      AND status = 'published'
    RETURNING viewcount;
  `;
  const { rows } = await client.query(query, [slug]);
  return rows[0];
};

/*
--------------------------------
Search Posts
--------------------------------
*/
const searchPosts = async (q = "", page = 1, limit = 10) => {
  const safePage = Number(page) || 1;
  const safeLimit = Number(limit) || 10;

  const offset = (safePage - 1) * safeLimit;

  const query = `
    SELECT 
      p.*,
      u.name AS author_name,
      u.avatar AS author_avatar,
      u.username AS author_username
    FROM posts p
    LEFT JOIN users u ON p.authorId = u.id
    WHERE p.status = 'published'
    AND (
      p.title ILIKE $1
      OR p.excerpt ILIKE $1
      OR p.content ILIKE $1
    )
    ORDER BY p.publishedAt DESC
    LIMIT $2 OFFSET $3
  `;

  const values = [`%${q}%`, safeLimit, offset];

  const { rows } = await client.query(query, values);

  return rows;
};

/*
--------------------------------
Similar Posts
--------------------------------
*/
const getSimilarPosts = async (slug) => {
  const query = `
    SELECT 
      p2.*,
      u.name AS author_name,
      u.avatar AS author_avatar,
      u.username AS author_username
    FROM posts p1
    JOIN posts p2 ON p1.id != p2.id
    LEFT JOIN users u ON p2.authorId = u.id
    WHERE p1.slug = $1
    AND p2.status = 'published'
    AND (
      p2.title ILIKE '%' || p1.title || '%'
    )
    LIMIT 5
  `;

  const { rows } = await client.query(query, [slug]);
  return rows;
};

/*
--------------------------------
Recommended Posts
--------------------------------
*/
const getRecommendedPosts = async () => {
  const query = `
    SELECT 
      p.*,
      u.name AS author_name,
      u.avatar AS author_avatar,
      u.username AS author_username
    FROM posts p
    LEFT JOIN users u ON p.authorId = u.id
    WHERE p.status = 'published'
    ORDER BY p.viewCount DESC
    LIMIT 6
  `;

  const { rows } = await client.query(query);
  return rows;
};

/*
--------------------------------
Trending Posts
--------------------------------
*/
const getTrendingPosts = async () => {
  const query = `
    SELECT 
      p.*,
      u.name AS author_name,
      u.avatar AS author_avatar,
      u.username AS author_username
    FROM posts p
    LEFT JOIN users u ON p.authorId = u.id
    WHERE p.status = 'published'
    ORDER BY p.viewCount DESC, p.publishedAt DESC
    LIMIT 5
  `;

  const { rows } = await client.query(query);
  return rows;
};

/*
--------------------------------
Latest Posts
--------------------------------
*/
const getLatestPosts = async () => {
  const query = `
    SELECT 
      p.*,
      u.name AS author_name,
      u.avatar AS author_avatar,
      u.username AS author_username
    FROM posts p
    LEFT JOIN users u ON p.authorId = u.id
    WHERE p.status = 'published'
    ORDER BY p.publishedAt DESC
    LIMIT 5
  `;

  const { rows } = await client.query(query);
  return rows;
};

/*
--------------------------------
Posts By Author
--------------------------------
*/
const getPostsByAuthor = async (authorId) => {
  const query = `
    SELECT 
      p.*,
      u.name AS author_name,
      u.avatar AS author_avatar,
      u.username AS author_username
    FROM posts p
    LEFT JOIN users u ON p.authorId = u.id
    WHERE p.authorId = $1
    AND p.status = 'published'
    ORDER BY p.publishedAt DESC
  `;

  const { rows } = await client.query(query, [authorId]);
  return rows;
};

/*
--------------------------------
Archive
--------------------------------
*/
const getArchivePosts = async (year, month) => {
  const query = `
    SELECT 
      p.*,
      u.name AS author_name,
      u.avatar AS author_avatar,
      u.username AS author_username
    FROM posts p
    LEFT JOIN users u ON p.authorId = u.id
    WHERE p.status = 'published'
    AND EXTRACT(YEAR FROM p.publishedAt) = $1
    AND EXTRACT(MONTH FROM p.publishedAt) = $2
    ORDER BY p.publishedAt DESC
  `;

  const { rows } = await client.query(query, [year, month]);
  return rows;
};

/*
--------------------------------
Featured Posts
--------------------------------
*/
const getFeaturedPosts = async () => {
  const query = `
    SELECT 
      p.*,
      u.name AS author_name,
      u.avatar AS author_avatar,
      u.username AS author_username
    FROM posts p
    LEFT JOIN users u ON p.authorId = u.id
    WHERE p.status = 'published'
    AND p.featured = true
    ORDER BY p.publishedAt DESC
    LIMIT 5
  `;

  const { rows } = await client.query(query);
  return rows;
};

const toggleFeaturedPost = async (id) => {
  const query = `
    UPDATE posts
    SET featured = NOT featured
    WHERE id = $1
    RETURNING id, featured;
  `;

  const { rows } = await client.query(query, [id]);

  return rows[0];
};

/*
--------------------------------
Next / Previous Navigation
--------------------------------
*/
const getPostNavigation = async (slug) => {
  const currentQuery = `
    SELECT id, publishedAt
    FROM posts
    WHERE slug = $1
  `;

  const { rows } = await client.query(currentQuery, [slug]);

  if (!rows.length) return null;

  const post = rows[0];

  const prevQuery = `
    SELECT slug, title
    FROM posts
    WHERE publishedAt < $1
    ORDER BY publishedAt DESC
    LIMIT 1
  `;

  const nextQuery = `
    SELECT slug, title
    FROM posts
    WHERE publishedAt > $1
    ORDER BY publishedAt ASC
    LIMIT 1
  `;

  const prev = await client.query(prevQuery, [post.publishedat]);
  const next = await client.query(nextQuery, [post.publishedat]);

  return {
    previous: prev.rows[0] || null,
    next: next.rows[0] || null,
  };
};

/*
--------------------------------
Posts By Category
--------------------------------
*/
const getPostsByCategory = async (categoryId, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  const query = `
    SELECT 
      p.*,
      u.name AS author_name,
      u.avatar AS author_avatar,
      u.username AS author_username
    FROM posts p
    JOIN post_categories pc ON p.id = pc.postId
    LEFT JOIN users u ON p.authorId = u.id
    WHERE pc.categoryId = $1
    AND p.status = 'published'
    ORDER BY p.publishedAt DESC
    LIMIT $2 OFFSET $3
  `;

  const { rows } = await client.query(query, [categoryId, limit, offset]);

  return rows;
};

/*
--------------------------------
Posts By Tag
--------------------------------
*/
const getPostsByTag = async (tagId, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  const query = `
    SELECT 
      p.*,
      u.name AS author_name,
      u.avatar AS author_avatar,
      u.username AS author_username
    FROM posts p
    JOIN post_tags pt ON p.id = pt.postId
    LEFT JOIN users u ON p.authorId = u.id
    WHERE pt.tagId = $1
    AND p.status = 'published'
    ORDER BY p.publishedAt DESC
    LIMIT $2 OFFSET $3
  `;

  const { rows } = await client.query(query, [tagId, limit, offset]);

  return rows;
};



const togglePostLike = async (postId, userId) => {
  // Check if like exists
  const checkQuery = `
    SELECT id FROM post_likes
    WHERE post_id = $1 AND user_id = $2
  `;
  const checkResult = await client.query(checkQuery, [postId, userId]);

  if (checkResult.rows.length > 0) {
    // 👉 Unlike (delete)
    await client.query(
      `DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2`,
      [postId, userId]
    );

    return { liked: false };
  } else {
    // 👉 Like (insert)
    await client.query(
      `INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2)`,
      [postId, userId]
    );

    return { liked: true };
  }
};

async function deletePostCategoriesByPostId(postId) {
  const query = `
    DELETE FROM post_categories
    WHERE postid = $1
  `;
  await client.query(query, [postId]);
}

async function deletePostTagsByPostId(postId) {
  const query = `
    DELETE FROM post_tags
    WHERE postid = $1
  `;
  await client.query(query, [postId]);
}

async function deleteCommentsByPostId(postId) {
  await client.query(`DELETE FROM comments WHERE postid = $1`, [postId]);
}



module.exports = {
  createPost,
  getPostById,
  incrementViewCount,
  deletePostCategoriesByPostId,
  deletePostTagsByPostId,
  getPostBySlug,
  deleteCommentsByPostId,
  getPostsByTag,
  getAllPublishedPosts,
  getAllPosts,
  updatePost,
  deletePost,
  togglePostLike,
  searchPosts,
  getPostsByCategory,
  getSimilarPosts,
  getRecommendedPosts,
  getTrendingPosts,
  getLatestPosts,
  getPostsByAuthor,
  toggleFeaturedPost,
  getArchivePosts,
  getFeaturedPosts,
  getPostNavigation,
};
