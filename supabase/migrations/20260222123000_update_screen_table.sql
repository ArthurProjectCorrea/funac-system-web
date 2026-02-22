-- migration: add url and icon columns to screen
-- Adds optional `url` and `icon` columns to the existing `screen` table.

BEGIN;

ALTER TABLE public.screen
  ADD COLUMN IF NOT EXISTS url varchar;

ALTER TABLE public.screen
  ADD COLUMN IF NOT EXISTS icon varchar;

COMMIT;
