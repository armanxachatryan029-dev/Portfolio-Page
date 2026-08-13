/**
 * PostgreSQL connection pool.
 * Uses DATABASE_URL from environment variables (Render-compatible).
 */

const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
  console.warn("Warning: DATABASE_URL is not set. Database operations will fail.");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("render.com")
    ? { rejectUnauthorized: false }
    : undefined,
});

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL pool error:", err.message);
});

module.exports = pool;
