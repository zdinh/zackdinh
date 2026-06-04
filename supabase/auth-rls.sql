-- Fix table permissions + RLS for authenticated Google sign-in.
-- Run in Supabase dashboard: SQL Editor → New query → paste → Run

create or replace function public.places_is_allowed_user()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from auth.users u
    where u.id = auth.uid()
      and lower(u.email) in (
        'zack.dinh@gmail.com',
        'abbyherold@gmail.com'
      )
  );
$$;

revoke all on public.places from anon;

drop policy if exists "Allow public read" on public.places;
drop policy if exists "Allow public insert" on public.places;
drop policy if exists "Allow public update" on public.places;
drop policy if exists "Allow public delete" on public.places;
drop policy if exists "Allowed user read" on public.places;
drop policy if exists "Allowed user insert" on public.places;
drop policy if exists "Allowed user update" on public.places;
drop policy if exists "Allowed user delete" on public.places;

alter table public.places enable row level security;

create policy "Allowed user read"
  on public.places
  for select
  to authenticated
  using (public.places_is_allowed_user());

create policy "Allowed user insert"
  on public.places
  for insert
  to authenticated
  with check (public.places_is_allowed_user());

create policy "Allowed user update"
  on public.places
  for update
  to authenticated
  using (public.places_is_allowed_user())
  with check (public.places_is_allowed_user());

create policy "Allowed user delete"
  on public.places
  for delete
  to authenticated
  using (public.places_is_allowed_user());

grant select, insert, update, delete on public.places to authenticated;
