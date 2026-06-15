-- Set all Movies places to a blank area.
-- Safe to re-run. Run in Supabase SQL Editor.

-- Step 1: delete stale rows when a blank-area row already exists for the same title.
with movie_places as (
  select
    id,
    name,
    lower(trim(category)) as category_key,
    trim(coalesce(area, '')) as area_key
  from public.places
  where lower(trim(category)) in ('movie', 'movies')
),
stale_with_blank_twin as (
  select m.id
  from movie_places m
  where m.area_key <> ''
    and exists (
      select 1
      from movie_places b
      where b.name = m.name
        and b.category_key = m.category_key
        and b.area_key = ''
        and b.id <> m.id
    )
)
delete from public.places
where id in (select id from stale_with_blank_twin);

-- Step 2: keep one row per title; drop extra stale copies (Everywhere, -, etc.).
with movie_places as (
  select
    id,
    name,
    lower(trim(category)) as category_key,
    trim(coalesce(area, '')) as area_key
  from public.places
  where lower(trim(category)) in ('movie', 'movies')
),
ranked as (
  select
    id,
    row_number() over (
      partition by name, category_key
      order by case when area_key = '' then 0 else 1 end, id
    ) as rn
  from movie_places
)
delete from public.places
where id in (select id from ranked where rn > 1);

-- Step 3: clear area on the one remaining row per title (cannot conflict now).
update public.places
set area = ''
where lower(trim(category)) in ('movie', 'movies')
  and trim(coalesce(area, '')) <> '';

-- Verify: should return 0 rows.
-- select name, area, category
-- from public.places
-- where lower(trim(category)) in ('movie', 'movies')
--   and trim(coalesce(area, '')) <> ''
-- order by name;
