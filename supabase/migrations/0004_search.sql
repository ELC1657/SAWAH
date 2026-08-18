-- SAWAH 0004: search
-- Full text for exact-ish matches, trigram for the fact that Sasak spelling
-- is not standardised and contributors will type the same word four ways.

-- return signature changes when columns are added, so replace outright
drop function if exists public.search_entries(text, text[], text, text[], int, int);

create or replace function public.search_entries(
  q            text     default null,
  region_slugs text[]   default null,
  dict         text     default 'sasak-en',
  statuses     text[]   default array['verified'],
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
    -- exact headword first, then prefix, then relevance, then freshness
    case when parsed.raw is not null
         and public.immutable_unaccent(lower(e.term)) = parsed.norm then 0 else 1 end,
    case when parsed.raw is not null
         and public.immutable_unaccent(lower(e.term)) like parsed.norm || '%' then 0 else 1 end,
    case when parsed.tsq is null then 0
         else ts_rank(e.search_vector, parsed.tsq) end desc,
    case when parsed.raw is null then 0
         else similarity(public.immutable_unaccent(lower(e.term)), parsed.norm) end desc,
    e.created_at desc
  limit  greatest(1, least(lim, 100))
  offset greatest(0, off)
$$;

-- suggestion strip under the search field, headwords only
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
    and e.status = 'verified'
    and nullif(btrim(q), '') is not null
    and public.immutable_unaccent(lower(e.term)) like public.immutable_unaccent(lower(btrim(q))) || '%'
  order by length(e.term), e.score desc
  limit greatest(1, least(lim, 10))
$$;

-- counts per dialect, including dialects with nothing in them yet, so the
-- dialect key can carry real numbers instead of being decoration
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
    on e.region_id = r.id and e.status = 'verified'
  where d.slug = dict
  group by r.slug, r.name, r.area, r.color, r.sort_order
  order by r.sort_order
$$;
