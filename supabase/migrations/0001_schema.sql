-- SAWAH 0001: core schema
-- Multi-dictionary from day one. Sasak/Indonesian is seeded row 1, not a hardcoded assumption.

create extension if not exists pgcrypto with schema extensions;
create extension if not exists citext with schema extensions;
create extension if not exists unaccent with schema extensions;
create extension if not exists pg_trgm with schema extensions;

-- unaccent() is stable, not immutable, so it cannot be used in a generated column.
-- Pinning the dictionary makes an immutable wrapper legal.
create or replace function public.immutable_unaccent(text)
returns text
language sql immutable strict parallel safe
as $$ select extensions.unaccent('extensions.unaccent'::regdictionary, $1) $$;

-- ---------------------------------------------------------------- dictionaries
create table public.dictionaries (
  id              smallint generated always as identity primary key,
  slug            text not null unique,
  name            text not null,
  source_language text not null,
  target_language text not null,
  source_label    text not null,
  target_label    text not null,
  -- optional bridge language, e.g. Indonesian on the Sasak/English pair
  secondary_language text,
  secondary_label    text,
  is_active       boolean not null default true,
  sort_order      smallint not null default 0
);

comment on table public.dictionaries is
  'One row per language pair. Adding a language is an insert, not a migration.';

-- --------------------------------------------------------------------- regions
create table public.regions (
  id            smallint generated always as identity primary key,
  dictionary_id smallint not null references public.dictionaries(id) on delete cascade,
  slug          text not null,
  name          text not null,
  area          text not null,
  color         text not null check (color ~ '^#[0-9A-Fa-f]{6}$'),
  sort_order    smallint not null default 0,
  unique (dictionary_id, slug),
  unique (id, dictionary_id)
);

-- -------------------------------------------------------------------- profiles
create table public.profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  handle         extensions.citext not null unique,
  role           text not null default 'member' check (role in ('member', 'admin')),
  handle_changed boolean not null default false,
  created_at     timestamptz not null default now()
);

comment on table public.profiles is
  'Public identity only. Email never leaves auth.users.';

-- --------------------------------------------------------------------- entries
create table public.entries (
  id             uuid primary key default gen_random_uuid(),
  dictionary_id  smallint not null references public.dictionaries(id),
  region_id      smallint not null,
  term           text not null check (char_length(btrim(term)) between 1 and 80),
  gloss          text not null check (char_length(btrim(gloss)) between 1 and 160),
  gloss_secondary text check (char_length(btrim(gloss_secondary)) between 1 and 160),
  part_of_speech text check (part_of_speech in ('noun','verb','adjective','adverb','phrase','other')),
  example_term   text check (char_length(example_term) <= 240),
  example_gloss  text check (char_length(example_gloss) <= 240),
  note           text check (char_length(note) <= 400),
  submitted_by   uuid not null references public.profiles(id) on delete cascade,
  status         text not null default 'pending' check (status in ('pending','verified','rejected')),
  score          int not null default 0,
  flag_count     int not null default 0,
  reviewed_by    uuid references public.profiles(id),
  reviewed_at    timestamptz,
  -- Verified by an editor, as opposed to verified by reaching the vote
  -- threshold. Generated, so the two can never drift apart: only a human
  -- moderator decision ever writes reviewed_by.
  editor_checked boolean generated always as
    (status = 'verified' and reviewed_by is not null) stored,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  search_vector  tsvector generated always as (
    setweight(to_tsvector('simple', public.immutable_unaccent(coalesce(term, ''))), 'A') ||
    setweight(to_tsvector('simple', public.immutable_unaccent(
      coalesce(gloss, '') || ' ' || coalesce(gloss_secondary, '')
    )), 'B') ||
    setweight(to_tsvector('simple', public.immutable_unaccent(
      coalesce(example_term, '') || ' ' || coalesce(example_gloss, '') || ' ' || coalesce(note, '')
    )), 'C')
  ) stored,
  -- a region can only be used by the dictionary that owns it
  foreign key (region_id, dictionary_id)
    references public.regions(id, dictionary_id) on delete restrict
);

-- exact duplicates are noise, near-duplicates are legitimate dialect variation
create unique index entries_dedupe_idx
  on public.entries (dictionary_id, region_id, lower(btrim(term)), lower(btrim(gloss)));

create index entries_search_idx      on public.entries using gin (search_vector);
create index entries_term_trgm_idx   on public.entries using gin (term extensions.gin_trgm_ops);
create index entries_gloss_trgm_idx  on public.entries using gin (gloss extensions.gin_trgm_ops);
create index entries_browse_idx      on public.entries (dictionary_id, status, created_at desc);
create index entries_region_idx      on public.entries (region_id, status);
create index entries_author_idx      on public.entries (submitted_by, created_at desc);

-- ----------------------------------------------------------------------- votes
create table public.votes (
  entry_id   uuid not null references public.entries(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  value      smallint not null check (value in (-1, 1)),
  created_at timestamptz not null default now(),
  primary key (entry_id, user_id)
);

create index votes_user_idx on public.votes (user_id);

-- ----------------------------------------------------------------------- flags
create table public.flags (
  id         uuid primary key default gen_random_uuid(),
  entry_id   uuid not null references public.entries(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  reason     text not null check (reason in ('wrong_translation','wrong_region','spam','offensive','other')),
  detail     text check (char_length(detail) <= 400),
  status     text not null default 'open' check (status in ('open','resolved','dismissed')),
  created_at timestamptz not null default now(),
  unique (entry_id, user_id)
);

create index flags_open_idx on public.flags (status, created_at desc);
