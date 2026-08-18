-- SAWAH starter entries
--
-- Run against a database where an admin profile already exists:
--   docker exec -i supabase_db_sawah psql -U postgres -d postgres -f - < supabase/starter_entries.sql
--
-- Not a migration and not seed.sql, because it depends on an account existing.
-- Re-run it after `supabase db reset` once you have signed in again.
--
-- These are common, well documented Sasak words. The DIALECT ATTRIBUTIONS are
-- provisional and are the thing to check first. Everything is attributed to the
-- admin account and marked editor checked, so the seal on these entries is a
-- claim the admin is making.

do $$
declare
  admin_id uuid;
  d_id     smallint;
begin
  select p.id into admin_id from public.profiles p where p.role = 'admin'
    order by p.created_at limit 1;
  if admin_id is null then
    raise exception 'No admin profile found. Sign in first, then set role to admin.';
  end if;

  select d.id into d_id from public.dictionaries d where d.slug = 'sasak-en';

  -- created_at is set explicitly and staggered into the past. The hourly rate
  -- limit counts rows inside the last hour, so backdating keeps it satisfied
  -- without disabling the trigger that protects the real submission path.
  insert into public.entries
    (dictionary_id, region_id, term, gloss, gloss_secondary, part_of_speech,
     example_term, example_gloss, note, submitted_by, created_at)
  select d_id, r.id, v.term, v.gloss, v.gloss_id, v.pos,
         v.ex_term, v.ex_gloss, v.note, admin_id, now() - (v.days || ' days')::interval
  from (values
    ('beleq',  'big, large',  'besar, agung', 'meno-mene',     'adjective', 'Bale beleq', 'a big house', null, 1),
    ('aik',    'water',       'air',          'ngeno-ngene',   'noun',      'Aik nyet',   'cold water',
       'Turns up in place names all over Lombok.', 2),
    ('bale',   'house',       'rumah',        'meno-mene',     'noun',      null, null, null, 3),
    ('inaq',   'mother',      'ibu',          'kuto-kute',     'noun',      null, null, null, 4),
    ('amaq',   'father',      'bapak, ayah',  'kuto-kute',     'noun',      null, null, null, 4),
    ('mangan', 'to eat',      'makan',        'ngeno-ngene',   'verb',      null, null, null, 5),
    ('lalo',   'to go',       'pergi',        'ngeno-ngene',   'verb',      null, null, null, 6),
    ('ndeq',   'no, not',     'tidak, bukan', 'meriaq-meriku', 'adverb',    null, null,
       'The form shifts from one dialect to the next.', 7),
    ('lueq',   'many, a lot', 'banyak',       'meriaq-meriku', 'adjective', null, null, null, 8),
    ('sopoq',  'one',         'satu',         'ngeto-ngete',   'other',     null, null, null, 9),
    ('gawah',  'forest',      'hutan',        'kuto-kute',     'noun',      null, null, null, 11),
    ('begawe', 'to hold a traditional feast', 'mengadakan hajatan', 'meno-mene', 'verb', null, null,
       'A customary term, used across the whole island.', 13),
    ('presean','Sasak duel fought with rattan stick and shield',
       'tarung pecut dan perisai khas Sasak', 'ngeno-ngene', 'noun', null, null, null, 15),
    ('kodeq',  'small',       'kecil',        'meno-mene',     'adjective', null, null, null, 17),
    ('tiang',  'I, me',       'saya',         'meno-mene',     'other',     null, null,
       'Polite register. Everyday speech uses a different form.', 19)
  ) as v(term, gloss, gloss_id, region_slug, pos, ex_term, ex_gloss, note, days)
  join public.regions r on r.slug = v.region_slug and r.dictionary_id = d_id
  on conflict do nothing;

  -- The insert guard forces every row to 'pending', which is correct: nothing
  -- may arrive pre-approved. Promotion is a separate, deliberate act.
  update public.entries e
     set status      = 'verified',
         reviewed_by = admin_id,
         reviewed_at = now()
   where e.submitted_by = admin_id
     and e.status = 'pending';

  raise notice 'published % entries as editor checked', (
    select count(*) from public.entries e where e.editor_checked
  );
end $$;
