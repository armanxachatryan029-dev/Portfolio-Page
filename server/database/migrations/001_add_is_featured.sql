-- Safe migration: add is_featured column to existing projects table
-- Existing rows automatically receive DEFAULT FALSE

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE;
