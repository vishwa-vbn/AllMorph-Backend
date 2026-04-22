const { queryClient: pool } = require("../config/db");

class Comment {
static async createComment({ content, postId, authorId, authorName, authorEmail, parentId = null }) {

  let status = 'approved'; // ← ALL COMMENTS AUTO-APPROVED
  let finalAuthorId   = null;
  let finalAuthorName = authorName;
  let finalAuthorEmail = authorEmail;

  // ────────────────────────────────────────
  // If authorId is provided → user is logged in
  // ────────────────────────────────────────
  if (authorId) {
    const user = await pool.query(
      `SELECT id, name, email, role FROM users WHERE id = $1`,
      [authorId]
    );

    if (user.rows.length === 0) {
      throw new Error("User account not found");
    }

    const u = user.rows[0];

    finalAuthorId    = u.id;
    finalAuthorName  = u.name || u.username || "User";
    finalAuthorEmail = u.email;
  }
  // Guest → must provide name & email
  else {
    if (!authorName || !authorEmail) {
      throw new Error("Name and email are required for guest comments");
    }
  }

  const { rows } = await pool.query(
    `INSERT INTO comments (
       content, postid, authorid, authorname, authoremail, parentid, status, createdat
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
     RETURNING *`,
    [
      content,
      postId,
      finalAuthorId,
      finalAuthorName,
      finalAuthorEmail,
      parentId,
      status
    ]
  );

  const newComment = rows[0];

  // Notify (your existing notification logic)
  await pool.query(
    `SELECT pg_notify('comment_changes', $1::text)`,
    [JSON.stringify({ action: 'create', comment: newComment })]
  );

  return newComment;
}
  static async getCommentsByPost(postId, status = null) {
    let query = `SELECT * FROM comments WHERE postId = $1`;
    let values = [postId];

    if (status) {
      query += ` AND status = $2`;
      values.push(status);
    }

    const { rows } = await pool.query(query, values);
    return rows;
  }

  static async updateCommentStatus(commentId, status) {
    const { rows } = await pool.query(
      `UPDATE comments SET status = $1 WHERE id = $2 RETURNING *`,
      [status, commentId]
    );
    
    // Notify about status update
    await pool.query(
      `SELECT pg_notify('comment_changes', $1::text)`,
      [JSON.stringify({ action: 'update', comment: rows[0] })]
    );
    
    return rows[0];
  }

  static async deleteComment(commentId) {
    const { rows } = await pool.query(
      `DELETE FROM comments WHERE id = $1 RETURNING *`,
      [commentId]
    );
    
    // Notify about deletion
    await pool.query(
      `SELECT pg_notify('comment_changes', $1::text)`,
      [JSON.stringify({ action: 'delete', commentId })]
    );
    
    return rows[0];
  }


  static async getApprovedCommentsByPost(postId) {
  const { rows } = await pool.query(
    `SELECT * 
     FROM comments 
     WHERE postid = $1 AND status = 'approved'
     ORDER BY createdat ASC`,
    [postId]
  );

  return rows;
}
}

module.exports = Comment;