-- Frontpage — core schema (Core #12 Data Persistence).
--
-- Shape: a shared, deduplicated global catalog (feeds, feed_items) that nobody
-- owns, plus a per-user overlay (profiles, subscriptions, categories,
-- item_states, collections). One fetch of CSS-Tricks serves every subscriber,
-- and a guest reads the same catalog while writing nothing.
--
-- RLS, grants and policies land in the next migration.
-- Design rationale: prompts/database-schema.md

-- ─────────────────────────────────────────────────────────────────────────────
-- Helper: touch updated_at
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- profiles — app-side mirror of auth.users, and the user's preference row
-- ─────────────────────────────────────────────────────────────────────────────

create table public.profiles (
  id              uuid primary key references auth.users (id) on delete cascade,
  display_name    text,
  -- All account-wide preferences: { "theme": "light"|"dark"|null, "layout": "list"|"grid"|"compact" }.
  -- Shape is validated by Zod at the action boundary; the check here only
  -- guarantees the value is an object, never an array or a scalar.
  personalisation jsonb not null default '{}'::jsonb
                    check (jsonb_typeof(personalisation) = 'object'),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on column public.profiles.personalisation is
  'Account-wide preferences blob. Update with `personalisation || $1::jsonb` so concurrent writes to different keys do not clobber each other. Read whole by primary key — deliberately unindexed.';

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Create the profile row on signup. SECURITY DEFINER is required: no
-- authenticated session exists at this point. It writes only new.id.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- feeds — global catalog. Written only by the service role; read by everyone.
-- ─────────────────────────────────────────────────────────────────────────────

create table public.feeds (
  id                   bigint generated always as identity primary key,
  feed_url             text not null,
  -- Deduplication is enforced by the database, not by application code:
  -- http/https, a leading www., and trailing slashes all collapse to one key.
  url_key              text generated always as (
                         lower(regexp_replace(feed_url, '^https?://(www\.)?|/+$', '', 'g'))
                       ) stored,
  site_url             text,
  title                text not null,
  description          text,
  icon_url             text,
  language             text,
  feed_format          text check (feed_format in ('rss2', 'rss1', 'atom', 'unknown')),
  -- Non-null marks one of the 19 curated feeds and names its category.
  curated_category     text,
  -- Conditional fetch (spec/technical-requirements.md §Server-Side Feed Fetching).
  etag                 text,
  last_modified        text,
  last_fetched_at      timestamptz,                -- last attempt
  last_success_at      timestamptz,                -- last 200/304; drives active vs stale
  last_error           text,
  last_error_at        timestamptz,
  consecutive_failures integer not null default 0,
  -- Cron work queue. Null = not scheduled: every subscriber chose manual
  -- refresh and the feed is not curated. Manual refresh still works.
  next_fetch_at        timestamptz default now(),
  dead_at              timestamptz,                -- permanently dead (Core #8)
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  constraint feeds_url_key_unique unique (url_key)
);

comment on table public.feeds is
  'Global, deduplicated feed catalog. No user_id: the only path from a user to a feed is through subscriptions. Health status (active/stale/error) is derived in the loader from last_success_at, consecutive_failures and dead_at — never stored.';

-- Access pattern 6, cron work queue:
--   select ... where next_fetch_at <= now() and dead_at is null
--   order by next_fetch_at limit 50 for update skip locked
create index feeds_due_idx on public.feeds (next_fetch_at) where dead_at is null;

-- Guest dashboard and Discover: the 19 curated feeds, grouped by category.
create index feeds_curated_idx on public.feeds (curated_category) where curated_category is not null;

create trigger feeds_set_updated_at
  before update on public.feeds
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- feed_items — global articles
-- ─────────────────────────────────────────────────────────────────────────────

create table public.feed_items (
  id           bigint generated always as identity primary key,
  feed_id      bigint not null references public.feeds (id) on delete cascade,
  -- <guid>/<id>, else the link, else sha256(title || published_at) from the worker.
  guid         text   not null,
  url          text,
  title        text   not null,
  author       text,
  summary      text,                               -- plain-text excerpt, entities normalized
  -- Full article content as the reader's Block[] union (h2/h3/p/quote/code/
  -- image/ul/ol), converted at ingest. Never raw HTML: the reader has no
  -- dangerouslySetInnerHTML, so there is no XSS surface to sanitize.
  -- Null = the feed supplied only an excerpt (Core #6: no reader view offered).
  content_blocks jsonb check (content_blocks is null or jsonb_typeof(content_blocks) = 'array'),
  image_url    text,
  published_at timestamptz,                        -- nullable: some feeds omit dates entirely
  created_at   timestamptz not null default now(), -- first seen
  updated_at   timestamptz not null default now(),
  -- One always-non-null column to order and paginate on, even for dateless feeds.
  sort_at      timestamptz generated always as (coalesce(published_at, created_at)) stored,
  -- Guards the upsert: an unchanged re-fetch performs no write at all.
  content_hash text not null,
  constraint feed_items_guid_unique unique (feed_id, guid)
);

comment on table public.feed_items is
  'Global articles. Upsert target: on conflict (feed_id, guid) do update ... where feed_items.content_hash is distinct from excluded.content_hash. Pruned by prune_feed_items() unless starred or filed in a collection.';

-- Access patterns 1-3: the river, by category, and by feed — all keyset-paginated
-- on (sort_at, id) descending.
create index feed_items_feed_sort_idx on public.feed_items (feed_id, sort_at desc, id desc);

-- Access pattern: the retention sweep in prune_feed_items().
create index feed_items_sort_idx on public.feed_items (sort_at desc, id desc);

create trigger feed_items_set_updated_at
  before update on public.feed_items
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- categories — per user, orderable (Core #4)
-- ─────────────────────────────────────────────────────────────────────────────

create table public.categories (
  id         bigint generated always as identity primary key,
  user_id    uuid    not null references auth.users (id) on delete cascade,
  name       text    not null check (length(btrim(name)) between 1 and 50),
  position   integer not null default 0,           -- manual ordering / drag-and-drop
  created_at timestamptz not null default now()
);

create unique index categories_user_name_key  on public.categories (user_id, lower(name));
create        index categories_user_order_idx on public.categories (user_id, position, id);

-- ─────────────────────────────────────────────────────────────────────────────
-- subscriptions — the user's own view of a global feed
-- ─────────────────────────────────────────────────────────────────────────────

create table public.subscriptions (
  id                       bigint generated always as identity primary key,
  user_id                  uuid   not null references auth.users (id) on delete cascade,
  feed_id                  bigint not null references public.feeds (id) on delete cascade,
  -- Null = Uncategorized. Deleting a category uncategorizes its feeds (Core #4).
  category_id              bigint references public.categories (id) on delete set null,
  custom_title             text check (custom_title is null or length(btrim(custom_title)) > 0),
  -- Per feed, not per user. 0 = manual only. The feed itself is fetched once,
  -- at the tightest cadence any of its subscribers asked for.
  refresh_interval_minutes integer not null default 30
                             check (refresh_interval_minutes in (0, 15, 30, 60)),
  -- "Mark all as read" watermark: one UPDATE instead of N inserts. Covers the
  -- per-feed, per-category and global variants of Core #5.
  read_through_at          timestamptz,
  created_at               timestamptz not null default now(),
  constraint subscriptions_user_feed_unique unique (user_id, feed_id)
);

comment on table public.subscriptions is
  'The user-facing identity of a feed: custom title, category, refresh interval, read watermark. Display title = coalesce(custom_title, feeds.title). The unique (user_id, feed_id) constraint is also what OPML import uses to detect duplicates.';

-- Access pattern 2: items by category.
create index subscriptions_user_category_idx on public.subscriptions (user_id, category_id);

-- Foreign-key index: joins from the catalog side, and cascade performance.
create index subscriptions_feed_idx on public.subscriptions (feed_id);

-- Access pattern 7, reschedule after fetch:
--   next_fetch_at = now() + min(refresh_interval_minutes) over this feed's
--   auto-refresh subscribers, else 60 min if curated, else null.
create index subscriptions_feed_interval_idx on public.subscriptions (feed_id, refresh_interval_minutes)
  where refresh_interval_minutes > 0;

-- Unsubscribing drops this user's read markers for the feed's items but keeps
-- what they saved — the Saved list is a reading list, not a subscription artifact.
create or replace function public.cleanup_subscription_states()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  delete from public.item_states st
   using public.feed_items i
   where st.item_id    = i.id
     and st.user_id    = old.user_id
     and i.feed_id     = old.feed_id
     and st.starred_at is null;

  update public.item_states st
     set read_at = null, marked_unread_at = null
    from public.feed_items i
   where st.item_id    = i.id
     and st.user_id    = old.user_id
     and i.feed_id     = old.feed_id
     and st.starred_at is not null
     and (st.read_at is not null or st.marked_unread_at is not null);

  return old;
end;
$$;

create trigger subscriptions_cleanup_states
  after delete on public.subscriptions
  for each row execute function public.cleanup_subscription_states();

-- ─────────────────────────────────────────────────────────────────────────────
-- item_states — sparse per-user interaction
-- ─────────────────────────────────────────────────────────────────────────────

create table public.item_states (
  user_id          uuid   not null references auth.users (id) on delete cascade,
  item_id          bigint not null references public.feed_items (id) on delete cascade,
  read_at          timestamptz,
  -- Explicit "mark unread" for an item that sits below the subscription's
  -- watermark; without it, Core #5's per-item unread and mark-all-read collide.
  marked_unread_at timestamptz,
  starred_at       timestamptz,
  primary key (user_id, item_id),
  -- The sparse invariant: a row exists only on real interaction.
  constraint item_states_has_state check (
    read_at is not null or marked_unread_at is not null or starred_at is not null
  ),
  constraint item_states_read_xor_unread check (read_at is null or marked_unread_at is null)
);

comment on table public.item_states is
  $c$Sparse: grows with engagement, not with catalog size. Resolution order for a given item — is_read = case when read_at is not null then true when marked_unread_at is not null then false else sort_at <= coalesce(subscriptions.read_through_at, '-infinity') end. Marking unread deletes the row when starred_at is null, and nulls read_at otherwise.$c$;

-- Access pattern 5: the Saved view, newest save first.
create index item_states_starred_idx on public.item_states (user_id, starred_at desc)
  where starred_at is not null;

-- Foreign-key index: cascade when prune_feed_items() removes items.
create index item_states_item_idx on public.item_states (item_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- collections — user-named lists of items
-- ─────────────────────────────────────────────────────────────────────────────

create table public.collections (
  id         bigint generated always as identity primary key,
  user_id    uuid    not null references auth.users (id) on delete cascade,
  name       text    not null check (length(btrim(name)) between 1 and 60),
  position   integer not null default 0,
  created_at timestamptz not null default now()
);

comment on table public.collections is
  'Named lists of items. Independent of starring: an item can be starred, collected, both, or neither.';

create unique index collections_user_name_key  on public.collections (user_id, lower(name));
create        index collections_user_order_idx on public.collections (user_id, position, id);

create table public.collection_items (
  collection_id bigint not null references public.collections (id) on delete cascade,
  item_id       bigint not null references public.feed_items (id) on delete cascade,
  added_at      timestamptz not null default now(),
  primary key (collection_id, item_id)
);

comment on table public.collection_items is
  'No user_id — RLS reaches ownership through collections.';

create index collection_items_item_idx on public.collection_items (item_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Retention — bounds feed_items, and transitively item_states
-- ─────────────────────────────────────────────────────────────────────────────

-- Deletes items older than the window that nobody has interacted with and that
-- sit in no collection. Starred and collected articles are never pruned.
-- Called by the cron worker with the service key.
create or replace function public.prune_feed_items(retain_days integer default 90)
returns bigint
language plpgsql
security invoker
set search_path = ''
as $$
declare
  deleted_count bigint;
begin
  with doomed as (
    delete from public.feed_items i
     where i.sort_at < now() - make_interval(days => retain_days)
       and not exists (select 1 from public.item_states      s where s.item_id = i.id)
       and not exists (select 1 from public.collection_items c where c.item_id = i.id)
    returning i.id
  )
  select count(*) into deleted_count from doomed;

  return deleted_count;
end;
$$;

-- Not a public endpoint: only the service role may run it.
revoke execute on function public.prune_feed_items(integer) from public, anon, authenticated;
