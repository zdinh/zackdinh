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
