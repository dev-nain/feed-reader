-- Frontpage — row level security.
--
-- Two access models:
--   1. The global catalog (feeds, feed_items) is world-readable and has NO write
--      policy at all. Only the service role — which bypasses RLS — writes it.
--      That is what makes guest mode work without a single write, and what keeps
--      feed fetching server-only (AGENTS.md §7).
--   2. Everything else is owned by exactly one user. Every policy pairs
--      `to authenticated` with an ownership predicate; `to authenticated` alone
--      is authentication without authorization.
--
-- auth.uid() is wrapped in a `select` throughout so the planner evaluates it
-- once per statement rather than once per row.

-- ─────────────────────────────────────────────────────────────────────────────
-- Enable RLS on every table in the exposed schema
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.profiles         enable row level security;
alter table public.feeds            enable row level security;
alter table public.feed_items       enable row level security;
alter table public.categories       enable row level security;
alter table public.subscriptions    enable row level security;
alter table public.item_states      enable row level security;
alter table public.collections      enable row level security;
alter table public.collection_items enable row level security;

-- ─────────────────────────────────────────────────────────────────────────────
-- Data API grants — explicit, not inherited from default privileges
-- ─────────────────────────────────────────────────────────────────────────────

grant select on public.feeds, public.feed_items to anon, authenticated;

grant select, insert, update, delete on
  public.profiles,
  public.categories,
  public.subscriptions,
  public.item_states,
  public.collections,
  public.collection_items
to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- Global catalog — read-only to the world
-- ─────────────────────────────────────────────────────────────────────────────

create policy "feeds are publicly readable"
  on public.feeds for select
  to anon, authenticated
  using (true);

create policy "feed items are publicly readable"
  on public.feed_items for select
  to anon, authenticated
  using (true);

-- Deliberately no insert/update/delete policies on either table.

-- ─────────────────────────────────────────────────────────────────────────────
-- profiles — select and update only; the signup trigger owns inserts
-- ─────────────────────────────────────────────────────────────────────────────

create policy "own profile is selectable"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "own profile is updatable"
  on public.profiles for update
  to authenticated
  using       ((select auth.uid()) = id)
  with check  ((select auth.uid()) = id);

-- ─────────────────────────────────────────────────────────────────────────────
-- categories
-- ─────────────────────────────────────────────────────────────────────────────

create policy "own categories are selectable"
  on public.categories for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "own categories are insertable"
  on public.categories for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "own categories are updatable"
  on public.categories for update
  to authenticated
  using       ((select auth.uid()) = user_id)
  with check  ((select auth.uid()) = user_id);   -- without this, user_id could be reassigned

create policy "own categories are deletable"
  on public.categories for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- subscriptions
-- ─────────────────────────────────────────────────────────────────────────────

create policy "own subscriptions are selectable"
  on public.subscriptions for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "own subscriptions are insertable"
  on public.subscriptions for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "own subscriptions are updatable"
  on public.subscriptions for update
  to authenticated
  using       ((select auth.uid()) = user_id)
  with check  ((select auth.uid()) = user_id);

create policy "own subscriptions are deletable"
  on public.subscriptions for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- item_states
-- ─────────────────────────────────────────────────────────────────────────────

create policy "own item states are selectable"
  on public.item_states for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "own item states are insertable"
  on public.item_states for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "own item states are updatable"
  on public.item_states for update
  to authenticated
  using       ((select auth.uid()) = user_id)
  with check  ((select auth.uid()) = user_id);

create policy "own item states are deletable"
  on public.item_states for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- collections
-- ─────────────────────────────────────────────────────────────────────────────

create policy "own collections are selectable"
  on public.collections for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "own collections are insertable"
  on public.collections for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "own collections are updatable"
  on public.collections for update
  to authenticated
  using       ((select auth.uid()) = user_id)
  with check  ((select auth.uid()) = user_id);

create policy "own collections are deletable"
  on public.collections for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- collection_items — ownership reached through the parent collection
-- ─────────────────────────────────────────────────────────────────────────────

create policy "own collection items are selectable"
  on public.collection_items for select
  to authenticated
  using (exists (
    select 1 from public.collections c
     where c.id = collection_id and c.user_id = (select auth.uid())
  ));

create policy "own collection items are insertable"
  on public.collection_items for insert
  to authenticated
  with check (exists (
    select 1 from public.collections c
     where c.id = collection_id and c.user_id = (select auth.uid())
  ));

create policy "own collection items are updatable"
  on public.collection_items for update
  to authenticated
  using (exists (
    select 1 from public.collections c
     where c.id = collection_id and c.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.collections c
     where c.id = collection_id and c.user_id = (select auth.uid())
  ));

create policy "own collection items are deletable"
  on public.collection_items for delete
  to authenticated
  using (exists (
    select 1 from public.collections c
     where c.id = collection_id and c.user_id = (select auth.uid())
  ));

-- No anon policy on any user-owned table: guests cannot write, by construction.
