/**
 * Main server file — starts Express and serves the portfolio site.
 *
 * Run: npm install && npm start
 * Site: http://localhost:3000
 * Admin: http://localhost:3000/admin
 */

require("dotenv").config();

const express = require("express");
const session = require("express-session");
const path = require("path");

const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const projectRoutes = require("./routes/projects");

const app = express();
const PORT = process.env.PORT || 5000;

// Parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session for admin login
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
    },
  })
);

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/projects", projectRoutes);

// Serve static files (HTML, CSS, JS, images, videos)
app.use(express.static(path.join(__dirname, "../client")));

// Admin page
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/admin.html"));
});

// Project detail page
app.get("/project/:id", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/project.html"));
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Portfolio site running at http://localhost:${PORT}`);
  console.log(`Admin panel at http://localhost:${PORT}/admin`);
});
