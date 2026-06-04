-- Add active flag to places (default: active).
-- Run in Supabase SQL Editor after auth-rls.sql.

alter table public.places
  add column if not exists active boolean not null default true;

update public.places set active = true where active is null;
