-- SAWAH 0009: an Indonesian translation is required, not optional
--
-- Indonesian started as an optional bridge for Sasak speakers reaching the
-- English. In practice it is half the point: it is the language every Sasak
-- speaker already reads, and an entry without it serves only the English side.
-- Every entry now carries both, which makes the dictionary genuinely trilingual
-- rather than English-first with a courtesy gloss.

-- The insert guard used to blank an empty string to null, which was the right
-- behaviour while the column was optional and the wrong one now: it would turn
-- a validation problem into a not-null violation with a worse error message.
create or replace function public.guard_entry_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recent_hour int;
  recent_day  int;
begin
  -- submissions always enter the queue, never pre-verified, never pre-scored
  new.status      := 'pending';
  new.score       := 0;
  new.flag_count  := 0;
  new.reviewed_by := null;
  new.reviewed_at := null;

  new.term            := btrim(new.term);
  new.gloss           := btrim(new.gloss);
  new.gloss_secondary := btrim(coalesce(new.gloss_secondary, ''));

  select count(*) into recent_hour
    from public.entries
   where submitted_by = new.submitted_by
     and created_at > now() - interval '1 hour';

  if recent_hour >= public.rate_limit_hourly() then
    raise exception 'SAWAH_RATE_LIMIT_HOUR';
  end if;

  select count(*) into recent_day
    from public.entries
   where submitted_by = new.submitted_by
     and created_at > now() - interval '24 hours';

  if recent_day >= public.rate_limit_daily() then
    raise exception 'SAWAH_RATE_LIMIT_DAY';
  end if;

  return new;
end
$$;

alter table public.entries
  alter column gloss_secondary set not null;
