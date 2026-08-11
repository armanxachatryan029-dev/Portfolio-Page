/**
 * Profile routes — serves profile data from profile.json.
 * Edit server/data/profile.json to change your personal info.
 */

const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const profilePath = path.join(__dirname, "../data/profile.json");

// GET /api/profile — return profile data
router.get("/", (req, res) => {
  try {
    const data = fs.readFileSync(profilePath, "utf8");
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ error: "Could not load profile." });
  }
});

module.exports = router;
