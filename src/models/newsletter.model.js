
const { queryClient: client } = require("../config/db");

const subscribe = async (email, token) => {
  const query = `
    INSERT INTO newsletter_subscribers (email, verification_token)
    VALUES ($1, $2)
    ON CONFLICT (email) DO UPDATE 
    SET verification_token = $2, unsubscribed_at = NULL
    RETURNING *;
  `;
  const { rows } = await client.query(query, [email, token]);
  return rows[0];
};

const getAllSubscribers = async () => {
  const query = `SELECT * FROM newsletter_subscribers ORDER BY subscribed_at DESC;`;
  const { rows } = await client.query(query);
  return rows;
};

const getSubscriberById = async (id) => {
  const query = `SELECT * FROM newsletter_subscribers WHERE id = $1;`;
  const { rows } = await client.query(query, [id]);
  return rows[0];
};

const verifySubscriber = async (token) => {
  const query = `
    UPDATE newsletter_subscribers
    SET is_verified = true, verification_token = NULL
    WHERE verification_token = $1
    RETURNING *;
  `;
  const { rows } = await client.query(query, [token]);
  return rows[0];
};

const unsubscribe = async (email) => {
  const query = `
    UPDATE newsletter_subscribers
    SET unsubscribed_at = CURRENT_TIMESTAMP
    WHERE email = $1
    RETURNING *;
  `;
  const { rows } = await client.query(query, [email]);
  return rows[0];
};

const getSubscriberCount = async () => {
  const query = `SELECT COUNT(*) FROM newsletter_subscribers WHERE unsubscribed_at IS NULL;`;
  const { rows } = await client.query(query);
  return parseInt(rows[0].count, 10);
};

module.exports = {
  subscribe,
  getAllSubscribers,
  getSubscriberById,
  verifySubscriber,
  unsubscribe,
  getSubscriberCount,
};
