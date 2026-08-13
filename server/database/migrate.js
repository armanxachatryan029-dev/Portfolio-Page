/**
 * Migration script — imports projects from server/data/projects.json into PostgreSQL.
 * Safe to run multiple times (skips existing IDs).
 * Run: node server/database/migrate.js
 */

require("dotenv").config();

const fs = require("fs");
const path = require("path");
const pool = require("../db");

const projectsPath = path.join(__dirname, "../data/projects.json");

async function migrate() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set. Add it to your .env file.");
    process.exit(1);
  }

  if (!fs.existsSync(projectsPath)) {
    console.error("projects.json not found at:", projectsPath);
    process.exit(1);
  }

  const projects = JSON.parse(fs.readFileSync(projectsPath, "utf8"));

  if (!Array.isArray(projects)) {
    console.error("projects.json must contain an array.");
    process.exit(1);
  }

  // Ensure table exists
  await initDatabaseForMigration();

  let inserted = 0;
  let skipped = 0;

  for (const project of projects) {
    const result = await pool.query(
      `INSERT INTO projects (
        id, title, description, category, project_type,
        thumbnail_url, video_url, video_file, project_url, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (id) DO NOTHING`,
      [
        project.id,
        project.title || "Untitled",
        project.description || "",
        project.category || "Other",
        project.projectType || "video",
        project.thumbnail || "/images/placeholder-project.svg",
        project.videoUrl || "",
        project.videoFile || "",
        project.projectUrl || "",
        project.createdAt ? new Date(project.createdAt) : new Date(),
      ]
    );

    if (result.rowCount === 1) {
      inserted++;
      console.log(`  Imported: ${project.title} (${project.id})`);
    } else {
      skipped++;
      console.log(`  Skipped (already exists): ${project.title} (${project.id})`);
    }
  }

  console.log(`\nMigration complete. Inserted: ${inserted}, Skipped: ${skipped}`);
  await pool.end();
}

async function initDatabaseForMigration() {
  const fs = require("fs");
  const schemaPath = path.join(__dirname, "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf8");
  await pool.query(schema);
}

if (require.main === module) {
  migrate().catch((err) => {
    console.error("Migration failed:", err.message);
    process.exit(1);
  });
}

module.exports = migrate;
