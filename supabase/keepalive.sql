-- Lightweight table for GitHub Actions keep-alive pings.
-- Run once in Supabase SQL Editor (after schema.sql / auth-rls.sql).

create table if not exists public.keepalive (
  id int primary key default 1 check (id = 1),
  pinged_at timestamptz not null default now()
);

insert into public.keepalive (id) values (1) on conflict (id) do nothing;

alter table public.keepalive enable row level security;

drop policy if exists "Anon read keepalive" on public.keepalive;
create policy "Anon read keepalive"
  on public.keepalive
  for select
  to anon, authenticated
  using (true);

grant select on public.keepalive to anon, authenticated;
