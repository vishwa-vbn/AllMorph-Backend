// src/config/db.js
const { Pool } = require("pg");
require("dotenv").config();

// PostgreSQL Connection Pool Configuration
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false, // Set to true if using a custom CA in production
  },
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait before timing out when connecting a new client
});

// Event listeners for the pool
pool.on("connect", () => {
  console.log("✅ Database Pool: New client connected");
});

pool.on("error", (err) => {
  console.error("❌ Database Pool Error:", err.message);
});

// For backward compatibility and ease of use, we export a query helper
module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
  // We keep the old name if any parts of the code specifically require the 'queryClient' object
  queryClient: pool, 
};