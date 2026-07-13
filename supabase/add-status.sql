-- Add status field to places (active, inactive, complete).
-- Run in Supabase SQL Editor after add-active.sql.

alter table public.places
  add column if not exists status text;

update public.places
set status = case when active then 'active' else 'inactive' end
where status is null;

alter table public.places
  alter column status set default 'active',
  alter column status set not null;

alter table public.places
  drop constraint if exists places_status_check;

alter table public.places
  add constraint places_status_check
  check (status in ('active', 'inactive', 'complete'));
