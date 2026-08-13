/**
 * Runs safe column migrations on the projects table.
 * Safe to run multiple times.
 */

const fs = require("fs");
const path = require("path");
const pool = require("../db");

const migrationsDir = path.join(__dirname, "migrations");

async function runMigrations() {
  if (!fs.existsSync(migrationsDir)) return;

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    await pool.query(sql);
  }
}

module.exports = runMigrations;
