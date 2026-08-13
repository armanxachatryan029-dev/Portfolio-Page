-- Portfolio projects table
-- Run via: node server/database/init.js

CREATE TABLE IF NOT EXISTS projects (
  id            VARCHAR(50) PRIMARY KEY,
  title         VARCHAR(255) NOT NULL DEFAULT 'Untitled',
  description   TEXT DEFAULT '',
  category      VARCHAR(100) DEFAULT 'Other',
  project_type  VARCHAR(50) DEFAULT 'video',
  thumbnail_url TEXT DEFAULT '/images/placeholder-project.svg',
  video_url     TEXT DEFAULT '',
  video_file    TEXT DEFAULT '',
  project_url   TEXT DEFAULT '',
  is_featured   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects (created_at DESC);
