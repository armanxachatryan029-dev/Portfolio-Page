/**
 * Database initialization — creates tables if they don't exist.
 * Run: node server/database/init.js
 */

require("dotenv").config();

const fs = require("fs");
const path = require("path");
const pool = require("../db");

async function initDatabase({ closePool = false } = {}) {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set.");
  }

  const schemaPath = path.join(__dirname, "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf8");

  await pool.query(schema);

  if (closePool) {
    await pool.end();
  }
}

if (require.main === module) {
  initDatabase({ closePool: true })
    .then(() => {
      console.log("Database initialized successfully.");
    })
    .catch((err) => {
      console.error("Database initialization failed:", err.message);
      process.exit(1);
    });
}

module.exports = initDatabase;
