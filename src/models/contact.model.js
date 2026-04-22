
const { queryClient: client } = require("../config/db");

const createMessage = async (data) => {
  const { name, email, subject, message } = data;
  const query = `
    INSERT INTO contact_messages (name, email, subject, message)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const { rows } = await client.query(query, [name, email, subject, message]);
  return rows[0];
};

const getAllMessages = async () => {
  const query = `SELECT * FROM contact_messages ORDER BY created_at DESC;`;
  const { rows } = await client.query(query);
  return rows;
};

const getMessageById = async (id) => {
  const query = `SELECT * FROM contact_messages WHERE id = $1;`;
  const { rows } = await client.query(query, [id]);
  return rows[0];
};

const updateMessageStatus = async (id, status) => {
  const query = `
    UPDATE contact_messages
    SET status = $2
    WHERE id = $1
    RETURNING *;
  `;
  const { rows } = await client.query(query, [id, status]);
  return rows[0];
};

const deleteMessage = async (id) => {
  const query = `DELETE FROM contact_messages WHERE id = $1 RETURNING *;`;
  const { rows } = await client.query(query, [id]);
  return rows[0];
};

const getUnreadMessages = async () => {
  const query = `SELECT * FROM contact_messages WHERE status = 'unread' ORDER BY created_at DESC;`;
  const { rows } = await client.query(query);
  return rows;
};


const getUnreadMessagesCount = async () => {
  const query = `
    SELECT COUNT(*) AS count 
    FROM contact_messages 
    WHERE status = 'unread';
  `;
  const { rows } = await client.query(query);

  return parseInt(rows[0].count, 10);
};
module.exports = {
  createMessage,
  getUnreadMessagesCount,
  getAllMessages,
  getMessageById,
  updateMessageStatus,
  deleteMessage,
  getUnreadMessages,
};
