/**
 * Auth routes — login and logout for admin panel.
 */

const express = require("express");
const router = express.Router();

// POST /api/auth/login — admin login
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  const adminUser = process.env.ADMIN_USERNAME;
  const adminPass = process.env.ADMIN_PASSWORD;

  if (username === adminUser && password === adminPass) {
    req.session.isAdmin = true;
    return res.json({ success: true, message: "Logged in successfully." });
  }

  res.status(401).json({ error: "Invalid username or password." });
});

// POST /api/auth/logout — admin logout
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Could not log out." });
    }
    res.json({ success: true, message: "Logged out." });
  });
});

// GET /api/auth/check — check if logged in
router.get("/check", (req, res) => {
  res.json({ isAdmin: !!(req.session && req.session.isAdmin) });
});

module.exports = router;
