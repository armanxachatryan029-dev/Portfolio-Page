/**
 * Project routes — CRUD for portfolio projects.
 * Projects are stored in PostgreSQL.
 * Uploaded files go to client/images/ and client/videos/.
 */

const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const pool = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
const imagesDir = path.join(__dirname, "../../client/images");
const videosDir = path.join(__dirname, "../../client/videos");

// Make sure upload folders exist
[imagesDir, videosDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Map DB row → API response (keeps frontend-compatible field names)
function rowToProject(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    projectType: row.project_type,
    thumbnail: row.thumbnail_url,
    videoUrl: row.video_url,
    videoFile: row.video_file,
    projectUrl: row.project_url,
    isFeatured: Boolean(row.is_featured),
    createdAt: row.created_at instanceof Date
      ? row.created_at.toISOString()
      : row.created_at,
  };
}

function parseBoolean(value) {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value === "boolean") return value;
  return value === "true" || value === "1";
}

// Helper: generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// Multer setup — handles file uploads (thumbnail + video)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "video") {
      cb(null, videosDir);
    } else {
      cb(null, imagesDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname.replace(/\s+/g, "-");
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max
});

// GET /api/projects — get all projects (public)
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM projects ORDER BY is_featured DESC, created_at DESC"
    );
    res.json(result.rows.map(rowToProject));
  } catch (err) {
    console.error("GET /api/projects error:", err.message);
    if (err.message.includes("connect") || err.code === "ECONNREFUSED") {
      return res.status(500).json({ error: "Database connection failed." });
    }
    res.status(500).json({ error: "Could not load projects." });
  }
});

// GET /api/projects/:id — get single project (public)
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM projects WHERE id = $1", [
      req.params.id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Project not found." });
    }

    res.json(rowToProject(result.rows[0]));
  } catch (err) {
    console.error("GET /api/projects/:id error:", err.message);
    if (err.message.includes("connect") || err.code === "ECONNREFUSED") {
      return res.status(500).json({ error: "Database connection failed." });
    }
    res.status(500).json({ error: "Could not load project." });
  }
});

// POST /api/projects — add new project (admin only)
router.post(
  "/",
  requireAuth,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { title, description, category, projectType, videoUrl, projectUrl, isFeatured } =
        req.body;

      const id = generateId();
      const thumbnail = req.files?.thumbnail
        ? "/images/" + req.files.thumbnail[0].filename
        : "/images/placeholder-project.svg";
      const videoFile = req.files?.video
        ? "/videos/" + req.files.video[0].filename
        : "";
      const featured = parseBoolean(isFeatured) ?? false;

      const result = await pool.query(
        `INSERT INTO projects (
          id, title, description, category, project_type,
          thumbnail_url, video_url, video_file, project_url, is_featured
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *`,
        [
          id,
          title || "Untitled",
          description || "",
          category || "Other",
          projectType || "video",
          thumbnail,
          videoUrl || "",
          videoFile,
          projectUrl || "",
          featured,
        ]
      );

      const newProject = rowToProject(result.rows[0]);
      res.json({ success: true, project: newProject });
    } catch (err) {
      console.error("POST /api/projects error:", err.message);
      if (err.message.includes("connect") || err.code === "ECONNREFUSED") {
        return res.status(500).json({ error: "Database connection failed." });
      }
      res.status(500).json({ error: "Failed to create project." });
    }
  }
);

// PUT /api/projects/:id — edit project (admin only)
router.put(
  "/:id",
  requireAuth,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const existingResult = await pool.query(
        "SELECT * FROM projects WHERE id = $1",
        [req.params.id]
      );

      if (existingResult.rows.length === 0) {
        return res.status(404).json({ error: "Project not found." });
      }

      const existing = existingResult.rows[0];
      const { title, description, category, projectType, videoUrl, projectUrl, isFeatured } =
        req.body;

      const updatedTitle = title ?? existing.title;
      const updatedDescription = description ?? existing.description;
      const updatedCategory = category ?? existing.category;
      const updatedProjectType = projectType ?? existing.project_type;
      const updatedVideoUrl = videoUrl ?? existing.video_url;
      const updatedProjectUrl = projectUrl ?? existing.project_url;
      const updatedIsFeatured =
        parseBoolean(isFeatured) !== undefined
          ? parseBoolean(isFeatured)
          : existing.is_featured;
      const updatedThumbnail = req.files?.thumbnail
        ? "/images/" + req.files.thumbnail[0].filename
        : existing.thumbnail_url;
      const updatedVideoFile = req.files?.video
        ? "/videos/" + req.files.video[0].filename
        : existing.video_file;

      const result = await pool.query(
        `UPDATE projects SET
          title = $1,
          description = $2,
          category = $3,
          project_type = $4,
          video_url = $5,
          project_url = $6,
          thumbnail_url = $7,
          video_file = $8,
          is_featured = $9,
          updated_at = NOW()
        WHERE id = $10
        RETURNING *`,
        [
          updatedTitle,
          updatedDescription,
          updatedCategory,
          updatedProjectType,
          updatedVideoUrl,
          updatedProjectUrl,
          updatedThumbnail,
          updatedVideoFile,
          updatedIsFeatured,
          req.params.id,
        ]
      );

      res.json({ success: true, project: rowToProject(result.rows[0]) });
    } catch (err) {
      console.error("PUT /api/projects/:id error:", err.message);
      if (err.message.includes("connect") || err.code === "ECONNREFUSED") {
        return res.status(500).json({ error: "Database connection failed." });
      }
      res.status(500).json({ error: "Failed to update project." });
    }
  }
);

// DELETE /api/projects/:id — delete project (admin only)
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM projects WHERE id = $1 RETURNING id",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Project not found." });
    }

    res.json({ success: true, message: "Project deleted." });
  } catch (err) {
    console.error("DELETE /api/projects/:id error:", err.message);
    if (err.message.includes("connect") || err.code === "ECONNREFUSED") {
      return res.status(500).json({ error: "Database connection failed." });
    }
    res.status(500).json({ error: "Failed to delete project." });
  }
});

module.exports = router;
