-- SAWAH 0006: table privileges
--
-- RLS narrows access inside a grant, it does not create one. Supabase's default
-- privileges deliberately withhold SELECT and DML from anon and authenticated,
-- so without this every request is "permission denied for table" no matter how
-- correct the policies are.
--
-- Grants are the outer boundary, policies are the inner one. Keep both narrow.

grant usage on schema public to anon, authenticated;

-- Reference data. Read only for everyone, written by migrations alone.
grant select on public.dictionaries to anon, authenticated;
grant select on public.regions      to anon, authenticated;

-- Public identity. The table holds handle and role only, never an email.
grant select on public.profiles to anon, authenticated;
grant update on public.profiles to authenticated;

-- Entries. Anyone may read, policy limits that to verified plus your own.
grant select                   on public.entries to anon, authenticated;
grant insert, update, delete   on public.entries to authenticated;

-- Voting and reporting require an account, so anon gets nothing at all.
grant select, insert, update, delete on public.votes to authenticated;
grant select, insert, update         on public.flags to authenticated;

-- Read paths used by the browse and map views.
grant execute on function public.search_entries(text, text[], text, text[], int, int)
  to anon, authenticated;
grant execute on function public.suggest_terms(text, text, int) to anon, authenticated;
grant execute on function public.region_counts(text)            to anon, authenticated;
