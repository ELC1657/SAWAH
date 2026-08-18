-- SAWAH 0007: reset privileges to exactly what is intended
--
-- Depending on how the schema is applied (migration vs SQL editor) Postgres
-- default privileges can hand anon and authenticated more than 0006 asked for.
-- Observed in production: anon held SELECT on votes and flags, which RLS
-- happened to block but which should never have been granted.
--
-- Revoke everything first, then grant the exact set. Idempotent: safe to run
-- repeatedly, and it corrects drift rather than adding to it.

revoke all on all tables in schema public from anon, authenticated;

-- Reference data. Public reads, written by migrations only.
grant select on public.dictionaries to anon, authenticated;
grant select on public.regions      to anon, authenticated;

-- Public identity: handle and role, never an email.
grant select on public.profiles to anon, authenticated;
grant update on public.profiles to authenticated;

-- Entries: anyone may read, RLS narrows that to verified plus your own.
grant select                 on public.entries to anon, authenticated;
grant insert, update, delete on public.entries to authenticated;

-- Voting and reporting require an account. anon gets nothing at all, at the
-- grant level as well as the policy level.
grant select, insert, update, delete on public.votes to authenticated;
grant select, insert, update         on public.flags to authenticated;

grant execute on function public.search_entries(text, text[], text, text[], int, int)
  to anon, authenticated;
grant execute on function public.suggest_terms(text, text, int) to anon, authenticated;
grant execute on function public.region_counts(text)            to anon, authenticated;
