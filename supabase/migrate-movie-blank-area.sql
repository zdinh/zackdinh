-- Move movie places to a blank area.
-- Run in Supabase SQL Editor after schema.sql.

-- Drop duplicates where the blank-area row already exists.
delete from public.places as old
where lower(trim(old.category)) = 'movie'
  and old.area <> ''
  and exists (
    select 1
    from public.places as blank
    where blank.name = old.name
      and blank.category = old.category
      and blank.area = ''
  );

-- Move remaining movie places to a blank area.
update public.places
set area = ''
where lower(trim(category)) = 'movie'
  and area <> '';
