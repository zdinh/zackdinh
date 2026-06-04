-- Seed existing places from places.html (idempotent)
insert into public.places (name, area, category) values
  ('Reinne''s Place', 'Long Beach', 'coffee'),
  ('Steelhead', 'Long Beach', 'coffee'),
  ('Colossus', 'Long Beach', 'coffee'),
  ('Gusto', 'Long Beach', 'coffee'),
  ('Vine', 'Long Beach', 'drinks'),
  ('Babygees', 'Long Beach', 'drinks'),
  ('Ballast Point', 'Long Beach', 'drinks'),
  ('ABYC', 'Long Beach', 'drinks'),
  ('The Attic', 'Long Beach', 'drinks'),
  ('Speakcheesy', 'Long Beach', 'food'),
  ('Brothers Keeper', 'Long Beach', 'food'),
  ('Due Fiori', 'Long Beach', 'food'),
  ('Colossus', 'Long Beach', 'food'),
  ('Gusto', 'Long Beach', 'food'),
  ('Ballast Point', 'Long Beach', 'food'),
  ('The Attic', 'Long Beach', 'food')
on conflict (name, area, category) do nothing;
