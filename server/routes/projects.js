/**
 * Project routes — CRUD for portfolio projects.
 * Projects are stored in server/data/projects.json.
 * Uploaded files go to client/images/ and client/videos/.
 */

const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
const projectsPath = path.join(__dirname, "../data/projects.json");
const imagesDir = path.join(__dirname, "../../client/images");
const videosDir = path.join(__dirname, "../../client/videos");

// Make sure upload folders exist
[imagesDir, videosDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Helper: read all projects from JSON file
function readProjects() {
  const data = fs.readFileSync(projectsPath, "utf8");
  return JSON.parse(data);
}

// Helper: save projects to JSON file
function saveProjects(projects) {
  fs.writeFileSync(projectsPath, JSON.stringify(projects, null, 2));
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
router.get("/", (req, res) => {
  try {
    const projects = readProjects();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: "Could not load projects." });
  }
});

// GET /api/projects/:id — get single project (public)
router.get("/:id", (req, res) => {
  try {
    const projects = readProjects();
    const project = projects.find((p) => p.id === req.params.id);
    if (!project) {
      return res.status(404).json({ error: "Project not found." });
    }
    res.json(project);
  } catch (err) {
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
  (req, res) => {
    try {
      const { title, description, category, projectType, videoUrl, projectUrl } =
        req.body;

      const projects = readProjects();

      const newProject = {
        id: generateId(),
        title: title || "Untitled",
        description: description || "",
        category: category || "Other",
        projectType: projectType || "video",
        thumbnail: req.files?.thumbnail
          ? "/images/" + req.files.thumbnail[0].filename
          : "/images/placeholder-project.svg",
        videoUrl: videoUrl || "",
        videoFile: req.files?.video
          ? "/videos/" + req.files.video[0].filename
          : "",
        projectUrl: projectUrl || "",
        createdAt: new Date().toISOString(),
      };

      projects.unshift(newProject);
      saveProjects(projects);

      res.json({ success: true, project: newProject });
    } catch (err) {
      res.status(500).json({ error: "Could not add project." });
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
  (req, res) => {
    try {
      const projects = readProjects();
      const index = projects.findIndex((p) => p.id === req.params.id);

      if (index === -1) {
        return res.status(404).json({ error: "Project not found." });
      }

      const existing = projects[index];
      const { title, description, category, projectType, videoUrl, projectUrl } =
        req.body;

      projects[index] = {
        ...existing,
        title: title ?? existing.title,
        description: description ?? existing.description,
        category: category ?? existing.category,
        projectType: projectType ?? existing.projectType,
        videoUrl: videoUrl ?? existing.videoUrl,
        projectUrl: projectUrl ?? existing.projectUrl,
        thumbnail: req.files?.thumbnail
          ? "/images/" + req.files.thumbnail[0].filename
          : existing.thumbnail,
        videoFile: req.files?.video
          ? "/videos/" + req.files.video[0].filename
          : existing.videoFile,
      };

      saveProjects(projects);
      res.json({ success: true, project: projects[index] });
    } catch (err) {
      res.status(500).json({ error: "Could not update project." });
    }
  }
);

// DELETE /api/projects/:id — delete project (admin only)
router.delete("/:id", requireAuth, (req, res) => {
  try {
    const projects = readProjects();
    const filtered = projects.filter((p) => p.id !== req.params.id);

    if (filtered.length === projects.length) {
      return res.status(404).json({ error: "Project not found." });
    }

    saveProjects(filtered);
    res.json({ success: true, message: "Project deleted." });
  } catch (err) {
    res.status(500).json({ error: "Could not delete project." });
  }
});

module.exports = router;
