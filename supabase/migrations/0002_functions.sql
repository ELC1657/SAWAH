-- SAWAH 0002: triggers, handle generation, moderation automation, rate limiting
-- Every rule here is enforced in the database, so hitting PostgREST directly
-- bypasses nothing that the server actions enforce.

-- ------------------------------------------------------- moderation thresholds
-- Single source of truth. lib/constants.ts mirrors these for UI copy only.
create or replace function public.promote_threshold() returns int
  language sql immutable as $$ select 5 $$;
create or replace function public.reject_threshold() returns int
  language sql immutable as $$ select -3 $$;
create or replace function public.rate_limit_hourly() returns int
  language sql immutable as $$ select 8 $$;
create or replace function public.rate_limit_daily() returns int
  language sql immutable as $$ select 30 $$;

-- ---------------------------------------------------------- anonymous handles
create or replace function public.generate_handle()
returns text
language plpgsql
volatile
set search_path = public
as $$
declare
  adjectives text[] := array[
    'senja','fajar','embun','gerimis','pasir','karang','angin','ombak',
    'kabut','biru','hijau','jingga','kelabu','perak','pualam','sunyi'
  ];
  nouns text[] := array[
    'penyu','elang','rusa','kerbau','bangau','camar','lumba','kepiting',
    'tupai','merpati','kunang','capung','pelanduk','rajawali','walet','landak'
  ];
  candidate text;
  attempt   int := 0;
begin
  loop
    candidate :=
      adjectives[1 + floor(random() * array_length(adjectives, 1))::int] || '-' ||
      nouns[1 + floor(random() * array_length(nouns, 1))::int] || '-' ||
      lpad(floor(random() * 1000)::int::text, 3, '0');

    exit when not exists (select 1 from public.profiles p where p.handle = candidate);

    attempt := attempt + 1;
    if attempt > 20 then
      candidate := candidate || '-' || substr(gen_random_uuid()::text, 1, 4);
      exit;
    end if;
  end loop;

  return candidate;
end
$$;

-- a profile is created the moment an account exists, so submissions always have an author
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, handle)
  values (new.id, public.generate_handle())
  on conflict (id) do nothing;
  return new;
end
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------------ updated_at
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end
$$;

create trigger entries_touch_updated_at
  before update on public.entries
  for each row execute function public.touch_updated_at();

-- ----------------------------------------------------------- submission guards
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
  new.gloss_secondary := nullif(btrim(coalesce(new.gloss_secondary, '')), '');

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

create trigger entries_guard_insert
  before insert on public.entries
  for each row execute function public.guard_entry_insert();

-- non-admins may edit their own pending entry text, but never its moderation state
create or replace function public.guard_entry_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_admin boolean;
begin
  select (role = 'admin') into is_admin from public.profiles where id = auth.uid();

  if coalesce(is_admin, false) then
    return new;
  end if;

  new.status      := old.status;
  new.score       := old.score;
  new.flag_count  := old.flag_count;
  new.reviewed_by := old.reviewed_by;
  new.reviewed_at := old.reviewed_at;
  new.submitted_by := old.submitted_by;
  return new;
end
$$;

create trigger entries_guard_update
  before update on public.entries
  for each row execute function public.guard_entry_update();

-- ------------------------------------------------------- votes drive promotion
create or replace function public.sync_entry_score()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target uuid := coalesce(new.entry_id, old.entry_id);
  total  int;
  cur    public.entries%rowtype;
begin
  select coalesce(sum(value), 0) into total from public.votes where entry_id = target;
  select * into cur from public.entries where id = target;

  if cur.id is null then
    return coalesce(new, old);
  end if;

  -- Automation only ever acts on entries still in the queue, and never writes
  -- reviewed_by. That column is reserved for a human moderator, which is what
  -- makes entries.editor_checked meaningful.
  -- An admin decision is terminal and votes cannot undo it.
  if cur.status = 'pending' then
    if total >= public.promote_threshold() and cur.flag_count = 0 then
      update public.entries
         set score = total, status = 'verified', reviewed_at = now()
       where id = target;
      return coalesce(new, old);
    elsif total <= public.reject_threshold() then
      update public.entries
         set score = total, status = 'rejected', reviewed_at = now()
       where id = target;
      return coalesce(new, old);
    end if;
  end if;

  update public.entries set score = total where id = target;
  return coalesce(new, old);
end
$$;

create trigger votes_sync_score
  after insert or update or delete on public.votes
  for each row execute function public.sync_entry_score();

-- an entry cannot promote itself while unresolved reports sit against it
create or replace function public.sync_flag_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target uuid := coalesce(new.entry_id, old.entry_id);
  total  int;
begin
  select count(*) into total
    from public.flags where entry_id = target and status = 'open';
  update public.entries set flag_count = total where id = target;
  return coalesce(new, old);
end
$$;

create trigger flags_sync_count
  after insert or update or delete on public.flags
  for each row execute function public.sync_flag_count();

-- ----------------------------------------------------------------- admin check
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
$$;
