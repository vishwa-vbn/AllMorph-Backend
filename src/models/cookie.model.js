const { queryClient: client } = require("../config/db");

const storeConsent = async (data) => {
  const {
    user_id = null,
    ip_address,
    consent_given,
    preferences,
    user_agent,
  } = data;

  const query = `
    INSERT INTO cookie_consents 
    (user_id, ip_address, consent_given, preferences, user_agent)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;

  const { rows } = await client.query(query, [
    user_id,
    ip_address,
    consent_given,
    JSON.stringify(preferences),
    user_agent,
  ]);

  return rows[0];
};

const getAllConsents = async () => {
  const query = `
    SELECT * FROM cookie_consents
    ORDER BY created_at DESC;
  `;

  const { rows } = await client.query(query);
  return rows;
};

const getConsentById = async (id) => {
  const query = `SELECT * FROM cookie_consents WHERE id = $1`;
  const { rows } = await client.query(query, [id]);
  return rows[0];
};

const deleteConsent = async (id) => {
  const query = `DELETE FROM cookie_consents WHERE id = $1 RETURNING *`;
  const { rows } = await client.query(query, [id]);
  return rows[0];
};

const getConsentCount = async () => {
  const query = `SELECT COUNT(*) FROM cookie_consents`;
  const { rows } = await client.query(query);
  return parseInt(rows[0].count, 10);
};

module.exports = {
  storeConsent,
  getAllConsents,
  getConsentById,
  deleteConsent,
  getConsentCount,
};
