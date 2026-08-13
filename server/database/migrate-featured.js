/**
 * Migration: add is_featured column to projects table.
 * Run: node server/database/migrate-featured.js
 */

require("dotenv").config();

const fs = require("fs");
const path = require("path");
const pool = require("../db");

async function migrateFeatured() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  const sqlPath = path.join(__dirname, "migrations/001_add_is_featured.sql");
  const sql = fs.readFileSync(sqlPath, "utf8");

  await pool.query(sql);
  console.log("Migration complete: is_featured column added (or already exists).");
  await pool.end();
}

if (require.main === module) {
  migrateFeatured().catch((err) => {
    console.error("Migration failed:", err.message);
    process.exit(1);
  });
}

module.exports = migrateFeatured;
