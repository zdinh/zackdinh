-- Run this if reads work but adds/deletes fail with error 42501.
-- Supabase dashboard: SQL Editor → New query → paste → Run

drop policy if exists "Allow public read" on public.places;
drop policy if exists "Allow public insert" on public.places;
drop policy if exists "Allow public update" on public.places;
drop policy if exists "Allow public delete" on public.places;

create policy "Allow public read"
  on public.places
  for select
  to anon, authenticated
  using (true);

create policy "Allow public insert"
  on public.places
  for insert
  to anon, authenticated
  with check (true);

create policy "Allow public update"
  on public.places
  for update
  to anon, authenticated
  using (true)
  with check (true);

create policy "Allow public delete"
  on public.places
  for delete
  to anon, authenticated
  using (true);

grant select, insert, update, delete on public.places to anon, authenticated;
