-- SAWAH 0008: entries are public the moment they are submitted
--
-- The original model held every submission back until a moderator or the vote
-- threshold approved it. That is wrong for a dictionary of a language with
-- almost nothing written down: an unverified word is still more useful to a
-- learner than no word at all.
--
-- New model:
--   pending   live, not yet verified, no seal
--   verified  live, verified by an editor or by votes, carries the seal
--   rejected  removed from public view
--
-- The seal keeps its exact meaning. What changes is that being unverified no
-- longer means being invisible.

drop policy if exists entries_read on public.entries;

create policy entries_read on public.entries
  for select to anon, authenticated
  using (
    status <> 'rejected'
    or submitted_by = (select auth.uid())
    or public.is_admin()
  );

-- browse and search now default to everything that has not been rejected
create or replace function public.search_entries(
  q            text     default null,
  region_slugs text[]   default null,
  dict         text     default 'sasak-en',
  statuses     text[]   default array['pending', 'verified'],
  lim          int      default 30,
  off          int      default 0
)
returns table (
  id               uuid,
  term             text,
  gloss            text,
  gloss_secondary  text,
  part_of_speech   text,
  example_term     text,
  example_gloss    text,
  note             text,
  status           text,
  editor_checked   boolean,
  score            int,
  flag_count       int,
  created_at       timestamptz,
  region_slug      text,
  region_name      text,
  region_area      text,
  region_color     text,
  submitter_handle text,
  submitted_by     uuid,
  total_count      bigint
)
language sql
stable
security invoker
set search_path = public, extensions
as $$
  with needle as (
    select nullif(btrim(coalesce(q, '')), '') as raw
  ),
  parsed as (
    select
      raw,
      case when raw is null then null else public.immutable_unaccent(lower(raw)) end as norm,
      case when raw is null then null
           else plainto_tsquery('simple', public.immutable_unaccent(raw)) end as tsq
    from needle
  )
  select
    e.id, e.term, e.gloss, e.gloss_secondary, e.part_of_speech,
    e.example_term, e.example_gloss, e.note,
    e.status, e.editor_checked, e.score, e.flag_count, e.created_at,
    r.slug, r.name, r.area, r.color,
    p.handle::text, e.submitted_by,
    count(*) over () as total_count
  from public.entries e
  join public.regions      r on r.id = e.region_id
  join public.dictionaries d on d.id = e.dictionary_id
  join public.profiles     p on p.id = e.submitted_by
  cross join parsed
  where d.slug  = dict
    and e.status = any (statuses)
    and (region_slugs is null or r.slug = any (region_slugs))
    and (
      parsed.raw is null
      or e.search_vector @@ parsed.tsq
      or public.immutable_unaccent(lower(e.term))  like parsed.norm || '%'
      or public.immutable_unaccent(lower(e.gloss)) like '%' || parsed.norm || '%'
      or public.immutable_unaccent(lower(coalesce(e.gloss_secondary, ''))) like '%' || parsed.norm || '%'
      or similarity(public.immutable_unaccent(lower(e.term)), parsed.norm) > 0.3
    )
  order by
    case when parsed.raw is not null
         and public.immutable_unaccent(lower(e.term)) = parsed.norm then 0 else 1 end,
    case when parsed.raw is not null
         and public.immutable_unaccent(lower(e.term)) like parsed.norm || '%' then 0 else 1 end,
    case when parsed.tsq is null then 0
         else ts_rank(e.search_vector, parsed.tsq) end desc,
    -- verified entries sit above unverified ones at equal relevance
    case when e.editor_checked then 0 else 1 end,
    case when parsed.raw is null then 0
         else similarity(public.immutable_unaccent(lower(e.term)), parsed.norm) end desc,
    e.created_at desc
  limit  greatest(1, least(lim, 100))
  offset greatest(0, off)
$$;

create or replace function public.suggest_terms(q text, dict text default 'sasak-en', lim int default 6)
returns table (term text, region_color text, region_slug text)
language sql
stable
security invoker
set search_path = public, extensions
as $$
  select e.term, r.color, r.slug
  from public.entries e
  join public.regions      r on r.id = e.region_id
  join public.dictionaries d on d.id = e.dictionary_id
  where d.slug = dict
    and e.status <> 'rejected'
    and nullif(btrim(q), '') is not null
    and public.immutable_unaccent(lower(e.term)) like public.immutable_unaccent(lower(btrim(q))) || '%'
  order by length(e.term), e.score desc
  limit greatest(1, least(lim, 10))
$$;

create or replace function public.region_counts(dict text default 'sasak-en')
returns table (region_slug text, region_name text, region_area text, region_color text, entry_count bigint)
language sql
stable
security invoker
set search_path = public
as $$
  select r.slug, r.name, r.area, r.color, count(e.id)
  from public.regions r
  join public.dictionaries d on d.id = r.dictionary_id
  left join public.entries e
    on e.region_id = r.id and e.status <> 'rejected'
  where d.slug = dict
  group by r.slug, r.name, r.area, r.color, r.sort_order
  order by r.sort_order
$$;
