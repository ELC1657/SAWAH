-- SAWAH 0003: row level security
-- Default deny. Every table below is readable/writable only through an explicit policy.

alter table public.dictionaries enable row level security;
alter table public.regions      enable row level security;
alter table public.profiles     enable row level security;
alter table public.entries      enable row level security;
alter table public.votes        enable row level security;
alter table public.flags        enable row level security;

-- --------------------------------------------------- dictionaries and regions
-- Reference data. Public reads, writes only via service role / migrations.
create policy dictionaries_read on public.dictionaries
  for select to anon, authenticated using (is_active);

create policy regions_read on public.regions
  for select to anon, authenticated using (true);

-- -------------------------------------------------------------------- profiles
-- Contains handle and role only. No email, no PII, so public read is safe.
create policy profiles_read on public.profiles
  for select to anon, authenticated using (true);

-- one handle change, self only, role is untouchable from the client
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = (select auth.uid()) and handle_changed = false)
  with check (id = (select auth.uid()));

-- --------------------------------------------------------------------- entries
-- Verified entries are public. Authors see their own queue. Admins see everything.
create policy entries_read on public.entries
  for select to anon, authenticated
  using (
    status = 'verified'
    or submitted_by = (select auth.uid())
    or public.is_admin()
  );

create policy entries_insert_own on public.entries
  for insert to authenticated
  with check (submitted_by = (select auth.uid()));

create policy entries_update on public.entries
  for update to authenticated
  using (
    (submitted_by = (select auth.uid()) and status = 'pending')
    or public.is_admin()
  )
  with check (
    (submitted_by = (select auth.uid()) and status = 'pending')
    or public.is_admin()
  );

create policy entries_delete on public.entries
  for delete to authenticated
  using (
    (submitted_by = (select auth.uid()) and status = 'pending')
    or public.is_admin()
  );

-- ----------------------------------------------------------------------- votes
-- Who voted which way stays private. The public sees only entries.score.
create policy votes_read_own on public.votes
  for select to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());

create policy votes_write_own on public.votes
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and not exists (
      select 1 from public.entries e
       where e.id = entry_id and e.submitted_by = (select auth.uid())
    )
  );

create policy votes_change_own on public.votes
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy votes_clear_own on public.votes
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- ----------------------------------------------------------------------- flags
create policy flags_read on public.flags
  for select to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());

create policy flags_insert_own on public.flags
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy flags_resolve on public.flags
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());
