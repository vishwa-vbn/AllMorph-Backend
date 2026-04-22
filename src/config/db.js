// src/config/db.js
const { Pool } = require("pg");
require("dotenv").config();

// PostgreSQL Connection Pool Configuration
// Optimized for serverless (Vercel) — short-lived, isolated invocations
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false, // Set to true if using a custom CA in production
  },
  max: 15, // Increased for local development to avoid bottleneck
  idleTimeoutMillis: 30000, // Keep connections alive longer to reduce churn
  connectionTimeoutMillis: 10000, // Allow 10s for cold-start + remote DB handshake
});

// Event listeners for the pool
pool.on("connect", () => {
  // Silent in development to reduce log noise
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