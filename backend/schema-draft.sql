-- Roavely schema draft for a DEDICATED Supabase project.
-- Not yet deployed. Review and run ONLY in the new Roavely project, never DeckVault.
-- Requires PostgreSQL 15+, Supabase auth, and RLS.
begin;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 80),
  home_airport text,
  interests text[] not null default '{}',
  travel_pace text not null default 'Balanced',
  travel_style text not null default 'Mid-range',
  updated_at timestamptz not null default now()
);
create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id),
  title text not null,
  destination text,
  starts_on date,
  ends_on date,
  currency char(3) not null default 'USD',
  target_budget numeric(12,2) not null default 0 check (target_budget>=0),
  created_at timestamptz not null default now(),
  constraint valid_trip_dates check (ends_on is null or starts_on is null or ends_on>=starts_on)
);
create table if not exists public.trip_members (
  trip_id uuid not null references public.trips(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check(role in ('owner','member')),
  joined_at timestamptz not null default now(),
  primary key (trip_id,user_id)
);
-- Security-definer helper avoids recursive trip_members policies. Never accepts an arbitrary user ID.
create or replace function private.is_member(p_trip uuid)
returns boolean language sql stable security definer set search_path = ''
as $$ select (select auth.uid()) is not null and exists (
  select 1 from public.trip_members m
  where m.trip_id=p_trip and m.user_id=(select auth.uid())
) $$;
create or replace function private.is_owner(p_trip uuid)
returns boolean language sql stable security definer set search_path = ''
as $$ select (select auth.uid()) is not null and exists (
  select 1 from public.trips t
  where t.id=p_trip and t.owner_id=(select auth.uid())
) $$;
create or replace function private.shared_member(p_other uuid)
returns boolean language sql stable security definer set search_path = ''
as $$ select (select auth.uid()) is not null and exists (
  select 1 from public.trip_members a
  join public.trip_members b on a.trip_id=b.trip_id
  where a.user_id=(select auth.uid()) and b.user_id=p_other
) $$;
revoke all on function private.is_member(uuid),private.is_owner(uuid),private.shared_member(uuid) from public,anon;
grant usage on schema private to authenticated;
grant execute on function private.is_member(uuid),private.is_owner(uuid),private.shared_member(uuid) to authenticated;

create table if not exists public.trip_invites (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  token_hash text not null unique,
  created_by uuid not null references auth.users(id),
  expires_at timestamptz not null,
  max_uses int not null default 20 check(max_uses between 1 and 100),
  used_count int not null default 0 check(used_count>=0),
  created_at timestamptz not null default now()
);
-- Signed-in person exchanges a random invite token for trip membership.
-- Store only sha256(token) in trip_invites; generate >=128-bit random tokens client-side.
create or replace function public.join_trip(p_token text)
returns uuid language plpgsql security definer set search_path = ''
as $$
declare v_trip uuid;
begin
  if (select auth.uid()) is null then raise exception 'Authentication required'; end if;
  if char_length(p_token)<24 or char_length(p_token)>256 then raise exception 'Invalid invitation'; end if;
  select i.trip_id into v_trip from public.trip_invites i
  where i.token_hash=encode(sha256(convert_to(p_token,'UTF8')),'hex')
    and i.expires_at>now() and i.used_count<i.max_uses
  limit 1;
  if v_trip is null then raise exception 'Invalid or expired invitation'; end if;
  if exists(select 1 from public.trip_members m where m.trip_id=v_trip and m.user_id=(select auth.uid())) then
    return v_trip;
  end if;
  update public.trip_invites i set used_count=i.used_count+1
  where i.trip_id=v_trip and i.token_hash=encode(sha256(convert_to(p_token,'UTF8')),'hex')
    and i.expires_at>now() and i.used_count<i.max_uses
  returning i.trip_id into v_trip;
  if v_trip is null then raise exception 'Invitation no longer available'; end if;
  insert into public.trip_members(trip_id,user_id,role) values(v_trip,(select auth.uid()),'member')
    on conflict do nothing;
  return v_trip;
end $$;
revoke all on function public.join_trip(text) from public,anon;
grant execute on function public.join_trip(text) to authenticated;

create table if not exists public.trip_preferences (
  trip_id uuid not null references public.trips(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  budget numeric(12,2) not null default 0 check(budget>=0),
  notes text,
  primary key(trip_id,user_id)
);
create table if not exists public.suggestions (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  created_by uuid not null references auth.users(id),
  title text not null check(char_length(title) between 1 and 200),
  city text,
  category text not null default 'activity',
  estimated_cost numeric(12,2) not null default 0 check(estimated_cost>=0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create table if not exists public.suggestion_votes (
  suggestion_id uuid not null references public.suggestions(id) on delete cascade,
  trip_id uuid not null references public.trips(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  vote text not null check(vote in ('love','yes','maybe','no')),
  primary key(suggestion_id,user_id)
);
create table if not exists public.suggestion_comments (
  id uuid primary key default gen_random_uuid(),
  suggestion_id uuid not null references public.suggestions(id) on delete cascade,
  trip_id uuid not null references public.trips(id) on delete cascade,
  author_id uuid not null references auth.users(id),
  body text not null check(char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);
create table if not exists public.polls (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  author_id uuid not null references auth.users(id),
  question text not null,
  created_at timestamptz not null default now()
);
create table if not exists public.poll_choices (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  trip_id uuid not null references public.trips(id) on delete cascade,
  label text not null
);
create table if not exists public.poll_votes (
  poll_id uuid not null references public.polls(id) on delete cascade,
  choice_id uuid not null references public.poll_choices(id) on delete cascade,
  trip_id uuid not null references public.trips(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  primary key (poll_id,user_id)
);
create table if not exists public.date_windows (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  author_id uuid not null references auth.users(id),
  starts_on date not null,
  ends_on date not null,
  check(ends_on>=starts_on)
);
create table if not exists public.date_votes (
  date_window_id uuid not null references public.date_windows(id) on delete cascade,
  trip_id uuid not null references public.trips(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  response text not null check(response in ('yes','maybe','no')),
  primary key(date_window_id,user_id)
);
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  author_id uuid not null references auth.users(id),
  body text not null check(char_length(body) between 1 and 5000),
  created_at timestamptz not null default now()
);
create table if not exists public.itinerary_days (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  label text not null,
  calendar_date date,
  order_index int not null default 0
);
create table if not exists public.itinerary_items (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  day_id uuid not null references public.itinerary_days(id) on delete cascade,
  suggestion_id uuid references public.suggestions(id) on delete set null,
  title text not null,
  starts_at time,
  estimated_cost numeric(12,2) not null default 0 check(estimated_cost>=0),
  order_index int not null default 0
);
create table if not exists public.trip_costs (
  trip_id uuid primary key references public.trips(id) on delete cascade,
  flights numeric(12,2) not null default 0,
  lodging numeric(12,2) not null default 0,
  local_transport numeric(12,2) not null default 0,
  meals numeric(12,2) not null default 0,
  activities numeric(12,2) not null default 0,
  other numeric(12,2) not null default 0
);
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  paid_by uuid not null references auth.users(id),
  title text not null,
  total numeric(12,2) not null check(total>=0),
  created_at timestamptz not null default now()
);
create table if not exists public.expense_shares (
  expense_id uuid not null references public.expenses(id) on delete cascade,
  trip_id uuid not null references public.trips(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  owed numeric(12,2) not null check(owed>=0),
  settled boolean not null default false,
  primary key(expense_id,user_id)
);
create table if not exists public.savings (
  trip_id uuid not null references public.trips(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  target numeric(12,2) not null default 0 check(target>=0),
  saved numeric(12,2) not null default 0 check(saved>=0),
  primary key(trip_id,user_id)
);
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  trip_id uuid references public.trips(id) on delete cascade,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- All public data tables use RLS; authenticated != permission to read arbitrary trips.
do $$
declare item text;
begin
  foreach item in array array['profiles','trips','trip_members','trip_invites','trip_preferences',
    'suggestions','suggestion_votes','suggestion_comments','polls','poll_choices','poll_votes',
    'date_windows','date_votes','chat_messages','itinerary_days','itinerary_items',
    'trip_costs','expenses','expense_shares','savings','notifications'] loop
    execute format('alter table public.%I enable row level security',item);
  end loop;
end $$;

create policy profiles_read on public.profiles for select to authenticated
  using(id=(select auth.uid()) or private.shared_member(id));
create policy profiles_insert on public.profiles for insert to authenticated
  with check(id=(select auth.uid()));
create policy profiles_update on public.profiles for update to authenticated
  using(id=(select auth.uid())) with check(id=(select auth.uid()));

create policy trips_read on public.trips for select to authenticated
  using(owner_id=(select auth.uid()) or private.is_member(id));
create policy trips_insert on public.trips for insert to authenticated
  with check(owner_id=(select auth.uid()));
create policy trips_update on public.trips for update to authenticated
  using(private.is_owner(id)) with check(private.is_owner(id));

create policy members_read on public.trip_members for select to authenticated
  using(private.is_member(trip_id) or private.is_owner(trip_id));
create policy members_insert on public.trip_members for insert to authenticated
  with check(private.is_owner(trip_id) and
    ((role='owner' and user_id=(select auth.uid())) or role='member'));
create policy members_delete on public.trip_members for delete to authenticated
  using(private.is_owner(trip_id) or user_id=(select auth.uid()));

create policy invites_read on public.trip_invites for select to authenticated
  using(private.is_owner(trip_id));
create policy invites_add on public.trip_invites for insert to authenticated
  with check(private.is_owner(trip_id) and created_by=(select auth.uid()));
create policy invites_remove on public.trip_invites for delete to authenticated
  using(private.is_owner(trip_id));

-- Shared records: read/write within trip, only one person's votes or authored content.
create policy preferences_read on public.trip_preferences for select to authenticated using(private.is_member(trip_id));
create policy preferences_insert on public.trip_preferences for insert to authenticated with check(private.is_member(trip_id) and user_id=(select auth.uid()));
create policy preferences_update on public.trip_preferences for update to authenticated using(user_id=(select auth.uid()) and private.is_member(trip_id)) with check(user_id=(select auth.uid()) and private.is_member(trip_id));

create policy suggestions_read on public.suggestions for select to authenticated using(private.is_member(trip_id));
create policy suggestions_insert on public.suggestions for insert to authenticated with check(private.is_member(trip_id) and created_by=(select auth.uid()));
create policy suggestions_update on public.suggestions for update to authenticated using(created_by=(select auth.uid()) and private.is_member(trip_id)) with check(created_by=(select auth.uid()) and private.is_member(trip_id));
create policy suggestions_delete on public.suggestions for delete to authenticated using(created_by=(select auth.uid()) and private.is_member(trip_id));

create policy suggestion_votes_read on public.suggestion_votes for select to authenticated using(private.is_member(trip_id));
create policy suggestion_votes_insert on public.suggestion_votes for insert to authenticated with check(private.is_member(trip_id) and user_id=(select auth.uid()));
create policy suggestion_votes_update on public.suggestion_votes for update to authenticated using(user_id=(select auth.uid()) and private.is_member(trip_id)) with check(user_id=(select auth.uid()) and private.is_member(trip_id));
create policy suggestion_votes_delete on public.suggestion_votes for delete to authenticated using(user_id=(select auth.uid()) and private.is_member(trip_id));

create policy comments_read on public.suggestion_comments for select to authenticated using(private.is_member(trip_id));
create policy comments_insert on public.suggestion_comments for insert to authenticated with check(private.is_member(trip_id) and author_id=(select auth.uid()));
create policy comments_delete on public.suggestion_comments for delete to authenticated using(author_id=(select auth.uid()) and private.is_member(trip_id));

create policy polls_read on public.polls for select to authenticated using(private.is_member(trip_id));
create policy polls_insert on public.polls for insert to authenticated with check(private.is_member(trip_id) and author_id=(select auth.uid()));
create policy choices_read on public.poll_choices for select to authenticated using(private.is_member(trip_id));
create policy choices_insert on public.poll_choices for insert to authenticated with check(private.is_member(trip_id));
create policy poll_votes_read on public.poll_votes for select to authenticated using(private.is_member(trip_id));
create policy poll_votes_insert on public.poll_votes for insert to authenticated with check(private.is_member(trip_id) and user_id=(select auth.uid()));
create policy poll_votes_update on public.poll_votes for update to authenticated using(private.is_member(trip_id) and user_id=(select auth.uid())) with check(private.is_member(trip_id) and user_id=(select auth.uid()));
create policy poll_votes_delete on public.poll_votes for delete to authenticated using(private.is_member(trip_id) and user_id=(select auth.uid()));

create policy windows_read on public.date_windows for select to authenticated using(private.is_member(trip_id));
create policy windows_insert on public.date_windows for insert to authenticated with check(private.is_member(trip_id) and author_id=(select auth.uid()));
create policy date_votes_read on public.date_votes for select to authenticated using(private.is_member(trip_id));
create policy date_votes_insert on public.date_votes for insert to authenticated with check(private.is_member(trip_id) and user_id=(select auth.uid()));
create policy date_votes_update on public.date_votes for update to authenticated using(private.is_member(trip_id) and user_id=(select auth.uid())) with check(private.is_member(trip_id) and user_id=(select auth.uid()));
create policy date_votes_delete on public.date_votes for delete to authenticated using(private.is_member(trip_id) and user_id=(select auth.uid()));

create policy chat_read on public.chat_messages for select to authenticated using(private.is_member(trip_id));
create policy chat_insert on public.chat_messages for insert to authenticated with check(private.is_member(trip_id) and author_id=(select auth.uid()));

create policy days_read on public.itinerary_days for select to authenticated using(private.is_member(trip_id));
create policy days_insert on public.itinerary_days for insert to authenticated with check(private.is_member(trip_id));
create policy days_update on public.itinerary_days for update to authenticated using(private.is_member(trip_id)) with check(private.is_member(trip_id));
create policy days_delete on public.itinerary_days for delete to authenticated using(private.is_member(trip_id));
create policy items_read on public.itinerary_items for select to authenticated using(private.is_member(trip_id));
create policy items_insert on public.itinerary_items for insert to authenticated with check(private.is_member(trip_id));
create policy items_update on public.itinerary_items for update to authenticated using(private.is_member(trip_id)) with check(private.is_member(trip_id));
create policy items_delete on public.itinerary_items for delete to authenticated using(private.is_member(trip_id));

create policy costs_read on public.trip_costs for select to authenticated using(private.is_member(trip_id));
create policy costs_insert on public.trip_costs for insert to authenticated with check(private.is_member(trip_id));
create policy costs_update on public.trip_costs for update to authenticated using(private.is_member(trip_id)) with check(private.is_member(trip_id));
create policy expenses_read on public.expenses for select to authenticated using(private.is_member(trip_id));
create policy expenses_insert on public.expenses for insert to authenticated with check(private.is_member(trip_id) and paid_by=(select auth.uid()));
create policy shares_read on public.expense_shares for select to authenticated using(private.is_member(trip_id));
create policy shares_insert on public.expense_shares for insert to authenticated with check(private.is_member(trip_id));
create policy shares_update on public.expense_shares for update to authenticated using(private.is_member(trip_id) and user_id=(select auth.uid())) with check(private.is_member(trip_id) and user_id=(select auth.uid()));

create policy savings_read on public.savings for select to authenticated using(user_id=(select auth.uid()));
create policy savings_insert on public.savings for insert to authenticated with check(user_id=(select auth.uid()) and private.is_member(trip_id));
create policy savings_update on public.savings for update to authenticated using(user_id=(select auth.uid()) and private.is_member(trip_id)) with check(user_id=(select auth.uid()) and private.is_member(trip_id));

create policy notices_read on public.notifications for select to authenticated using(user_id=(select auth.uid()));
create policy notices_update on public.notifications for update to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));

-- Explicit grants required if Data API auto-exposure is disabled.
grant select,insert,update,delete on public.profiles,public.trips,public.trip_members,
 public.trip_invites,public.trip_preferences,public.suggestions,public.suggestion_votes,
 public.suggestion_comments,public.polls,public.poll_choices,public.poll_votes,
 public.date_windows,public.date_votes,public.chat_messages,public.itinerary_days,
 public.itinerary_items,public.trip_costs,public.expenses,public.expense_shares,
 public.savings,public.notifications to authenticated;
revoke all on public.profiles,public.trips,public.trip_members,public.trip_invites,
 public.trip_preferences,public.suggestions,public.suggestion_votes,public.suggestion_comments,
 public.polls,public.poll_choices,public.poll_votes,public.date_windows,public.date_votes,
 public.chat_messages,public.itinerary_days,public.itinerary_items,public.trip_costs,
 public.expenses,public.expense_shares,public.savings,public.notifications from anon;

commit;

-- Production checklist:
-- 1. Add foreign-key consistency checks to prevent cross-trip references (vote + trip_id,
--    item + day_id, share + expense_id), or eliminate redundant trip_id via safe views.
-- 2. Prevent members editing arbitrary poll choices and other members' expense shares.
-- 3. Add abuse prevention, moderation, rate limits, notification fan-out and invitation expiry.
-- 4. Verify table-by-table RLS with TWO accounts in DIFFERENT trips.
-- 5. Run Supabase security + performance advisors before connecting a public UI.
-- 6. Setup Realtime publication selectively after validating RLS.
