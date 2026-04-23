// src/config/db.js
const { Client } = require("pg");
require("dotenv").config();

// PostgreSQL Connection Configuration
// Using a per-request connection method to avoid Pool usage while allowing concurrent user access.
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false, // Set to true if using a custom CA in production
  },
};

/**
 * Standard query helper that creates a new connection for every request.
 * This satisfies the requirement to avoid pooling while allowing the database 
 * to handle multiple concurrent connections from different users.
 */
const query = async (text, params) => {
  const client = new Client(dbConfig);
  try {
    await client.connect();
    const result = await client.query(text, params);
    return result;
  } catch (err) {
    console.error("❌ Database Query Error:", err.message);
    throw err;
  } finally {
    try {
      await client.end();
    } catch (endErr) {
      console.error("❌ Error closing connection:", endErr.message);
    }
  }
};

// Export query helper and aliases for backward compatibility
module.exports = {
  query,
  // These objects wrap the query function to maintain compatibility with existing models
  client: { query },
  pool: { query },
  queryClient: { query },
};