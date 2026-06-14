-- Add optional notes to places.
-- Run in Supabase SQL Editor after schema.sql.

alter table public.places
  add column if not exists notes text;
