-- Frontpage — schema review fixes.
--
-- Follow-up to 20260809185753_core_schema and 20260809185758_rls_policies.
-- Those two keep their committed shape; every correction lands forward.
-- Nothing here destroys data.
--
-- 1. read watermark is ingest-time, not publish-time   (silent unread loss)
-- 2. subscriptions may only use the owner's categories (cross-user write)
-- 3. index the new FK for the category-delete cascade
-- 4. grant the service role the catalog               (all server writes broken)
-- 5. stop exposing fetch internals to anon
-- 6. drop grants and a policy that back nothing
-- 7. backfill profiles for accounts predating the signup trigger
-- 8. tighten the cron work-queue index
-- 9. constrain curated_category to the five names in data/
-- 10. record the caveats that bit us in review

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. The read watermark measures when we saw an item, not when it was published
-- ─────────────────────────────────────────────────────────────────────────────
--
-- read_through_at was specified against sort_at (= coalesce(published_at,
-- created_at)). That marks any FUTURE item with an older publish date as
-- already read. It is not a corner case: cron runs every 15-60 minutes so
-- publish always precedes fetch, Medium-hosted and aggregator feeds backdate,
-- and a fresh subscription backfills a feed's whole history at once. Mark a
-- feed read, and the next cron run's articles arrive invisible.
--
-- "Mark all as read" means "everything I could see at time T", and what the
-- user could see is what had been ingested — created_at. Everything already in
-- the table has created_at <= T; everything ingested later has created_at > T.
--
-- No DDL: the expression lives in the loader. These comments are where the
-- contract is written down, and no loader reads this schema yet.

comment on table public.item_states is
  $c$Sparse: grows with engagement, not with catalog size. Resolution order for a given item — is_read = case when read_at is not null then true when marked_unread_at is not null then false else created_at <= coalesce(subscriptions.read_through_at, '-infinity') end. Note created_at (first seen), NOT sort_at: a watermark on publish date silently swallows backdated items fetched after the mark. Marking unread deletes the row when starred_at is null, and nulls read_at otherwise.$c$;

comment on column public.subscriptions.read_through_at is
  'Ingest-time "mark all as read" watermark: one UPDATE instead of N inserts. Compare against feed_items.created_at (first seen), never sort_at/published_at — feeds publish before we fetch, and backdated items would arrive pre-read. Residual: a fetch transaction opened before the mark and committed after it stamps created_at at transaction start and is swallowed; seconds wide, and closable with clock_timestamp() at ingest if it ever matters.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. A subscription may only point at a category its own owner holds
-- ─────────────────────────────────────────────────────────────────────────────
--
-- Referential integrity checks run as the table owner and bypass RLS, so
-- `references categories (id)` validated against every user's categories. The
-- insert policy only constrains user_id, and category_id is a guessable
-- sequential bigint, so user A could file a subscription under user B's
-- category: it succeeded, then vanished from A's sidebar because their own
-- category join returned nothing. It also distinguished live ids from dead
-- ones by whether the insert raised.
--
-- Fixed in the schema rather than in RLS because RLS would not constrain
-- service-role writes, and OPML import runs server-side.

alter table public.categories
  add constraint categories_id_user_unique unique (id, user_id);

alter table public.subscriptions
  drop constraint subscriptions_category_id_fkey;

-- The (category_id) column list is load-bearing. A bare ON DELETE SET NULL
-- nulls every referencing column, including the NOT NULL user_id, and every
-- category delete would fail. PG 15+; config.toml pins major_version = 17.
alter table public.subscriptions
  add constraint subscriptions_category_fkey
    foreign key (category_id, user_id) references public.categories (id, user_id)
    on delete set null (category_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Index the FK the way the cascade actually queries it
-- ─────────────────────────────────────────────────────────────────────────────
--
-- Deleting a category makes Postgres find referencing rows by the FK columns.
-- subscriptions_user_category_idx leads with user_id and cannot serve that.
-- This was the schema's only unindexed FK referent.

create index subscriptions_category_fk_idx
  on public.subscriptions (category_id, user_id)
  where category_id is not null;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. The service role could neither read nor write anything
-- ─────────────────────────────────────────────────────────────────────────────
--
-- Supabase's current default privileges give anon, authenticated and
-- service_role only Dxtm — truncate, references, trigger, maintain — on new
-- tables, and EXECUTE on new functions to postgres alone:
--
--   pg_default_acl: postgres|r|{... service_role=Dxtm/postgres}
--                   postgres|f|{postgres=X/postgres}
--
-- That is the Data API auto-exposure removal of 2026-04-28, and the previous
-- migration is right to grant explicitly rather than inherit. It just granted
-- to anon and authenticated only. service_role got nothing, so every path the
-- schema describes as service-role-owned was in fact impossible:
--
--   * inserting a feed on user-add or first fetch  -> permission denied
--   * upserting feed_items after a fetch           -> permission denied
--   * writing etag / last_success_at / next_fetch_at -> permission denied
--   * prune_feed_items                             -> denied twice over,
--     once on EXECUTE and again on feed_items inside the body
--
-- service_role has bypassrls, so RLS was never what stood in the way — only
-- the missing grants. The grants below are the write model the rest of the
-- schema already documents, made real: the service role owns the global
-- catalog and nothing else. It gets no access to categories, collections,
-- profiles or the user's own rows; those are written by the user's own
-- session under RLS, which is what keeps per-user data behind auth.uid().

-- The catalog it writes.
grant select, insert, update         on public.feeds      to service_role;
grant select, insert, update, delete on public.feed_items to service_role;

-- Feeds are never deleted; dead_at retires them (Core #8). No delete grant.

-- Read-only, and only what the documented worker queries need:
--   subscriptions    — access pattern 7, the reschedule after a fetch computes
--                      min(refresh_interval_minutes) across a feed's subscribers
--   item_states,
--   collection_items — the two NOT EXISTS guards in prune_feed_items() that
--                      keep starred and collected articles from being pruned
grant select on public.subscriptions    to service_role;
grant select on public.item_states      to service_role;
grant select on public.collection_items to service_role;

-- And the sweep itself. The previous migration's
-- `revoke execute ... from public, anon, authenticated` removed nothing that
-- was ever granted, but it stays in place as defence in depth; this is the
-- half that was missing.
grant execute on function public.prune_feed_items(integer) to service_role;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. anon reads the catalog, not the fetcher's diary
-- ─────────────────────────────────────────────────────────────────────────────
--
-- `grant select on public.feeds` handed every browser session etag,
-- last_modified, next_fetch_at, consecutive_failures and last_error.
-- last_error is the one that matters: it carries fetch failure text verbatim,
-- including whatever a third-party host puts in it.
--
-- Column grants rather than a feeds_public view: one table keeps one name, and
-- PostgREST resource embedding from subscriptions stays straightforward.
--
-- Health status derivation is unaffected — last_success_at, consecutive_failures
-- and dead_at are all still readable, and status stays derived, never stored.
--
-- Consequence, verified against this database rather than assumed: `select *`
-- as anon or authenticated now fails with "permission denied for table feeds".
-- Read paths must name their columns. That is wanted anyway; see the
-- content_blocks comment in section 10.

revoke select on public.feeds from anon, authenticated;

grant select (
  id, feed_url, url_key, site_url, title, description, icon_url, language,
  feed_format, curated_category, last_success_at, consecutive_failures,
  dead_at, created_at, updated_at
) on public.feeds to anon, authenticated;

-- Withheld deliberately: etag, last_modified, last_fetched_at, last_error,
-- last_error_at, next_fetch_at. Grant individually if a UI need appears.

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. Remove grants and a policy that back nothing
-- ─────────────────────────────────────────────────────────────────────────────
--
-- profiles has no insert or delete policy — the signup trigger owns inserts and
-- rows die with auth.users — so both grants were already inert. Dropping them
-- makes that a decision instead of an oversight.

revoke insert, delete on public.profiles from authenticated;

-- collection_items' only non-key column is added_at. Moving an item between
-- collections is a delete plus an insert, not an update.

drop policy "own collection items are updatable" on public.collection_items;

revoke update on public.collection_items from authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. Backfill profiles for any account that predates the signup trigger
-- ─────────────────────────────────────────────────────────────────────────────
--
-- handle_new_user only fires on insert. Any account created before it existed
-- has no profile row, and therefore no preferences.

insert into public.profiles (id)
select u.id from auth.users u
on conflict (id) do nothing;

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. Keep unscheduled feeds out of the cron work queue index
-- ─────────────────────────────────────────────────────────────────────────────
--
-- The only query is `where next_fetch_at <= now() and dead_at is null`, which
-- no null next_fetch_at can satisfy. Null means every subscriber chose manual
-- refresh and the feed is not curated — dead weight in this index.

drop index public.feeds_due_idx;

create index feeds_due_idx on public.feeds (next_fetch_at)
  where dead_at is null and next_fetch_at is not null;

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. curated_category holds one of the five names from data/, or nothing
-- ─────────────────────────────────────────────────────────────────────────────
--
-- Free text let the catalog drift from app/lib/discover-catalog.ts, where the
-- Discover hub's sections are keyed by these exact strings. Names are taken
-- from data/README.md and data/sample-feeds.json — the fixed corpus.

alter table public.feeds
  add constraint feeds_curated_category_check
  check (
    curated_category is null
    or curated_category in ('Frontend', 'Design', 'Backend & DevOps', 'General Tech', 'AI & ML')
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 10. Record the caveats, so the next reader does not rediscover them
-- ─────────────────────────────────────────────────────────────────────────────

comment on column public.feeds.url_key is
  'Dedup key: lower(feed_url) with scheme, leading www. and trailing slashes stripped. Caveats — it lowercases the whole URL including the path, so two feeds differing only by path case collapse into one and the second is silently dropped by `on conflict (url_key) do nothing`; query strings are not normalized, so ?format=rss and ?format=atom stay distinct. Both are acceptable for the curated corpus. Revisit before accepting arbitrary user-submitted URLs at volume.';

comment on column public.feed_items.guid is
  'Feed-supplied <guid>/<id>, else the link, else sha256(title || published_at). INGEST REQUIREMENT: hash anything over ~1KB before insert. This column carries a btree unique index with a 2704-byte limit, and exceeding it aborts the whole upsert batch, not just the offending row.';

comment on column public.feed_items.content_blocks is
  'Full article content as the reader''s Block[] union, converted at ingest. Never raw HTML: the reader has no dangerouslySetInnerHTML, so there is no XSS surface to sanitize. Null = the feed supplied only an excerpt (Core #6: no reader view offered). NEVER `select *` on this table from a list loader — TOAST keeps this column off the main heap only while nothing asks for it.';
