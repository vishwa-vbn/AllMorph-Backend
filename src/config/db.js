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
  max: 3, // Serverless: keep pool small to avoid exhausting DB connections
  idleTimeoutMillis: 10000, // Close idle clients quickly in serverless
  connectionTimeoutMillis: 10000, // Allow 10s for cold-start + remote DB handshake
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