create table public.places (
  id bigint generated always as identity primary key,
  name text not null,
  area text not null,
  category text not null,
  created_at timestamptz not null default now(),
  unique (name, area, category)
);

create index places_area_category_idx on public.places (area, category);

alter table public.places enable row level security;

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
