# Frontpage — Architecture Decision Record

Status: **agreed**, pre-implementation. Every decision below is revisitable; the
reasoning is recorded so a reversal is a deliberate act rather than a surprise.

This document has been revised once already: an earlier draft specified a
separate NestJS backend with hand-rolled JWT auth on Fly.io + Neon. That was a
defensible reading of the constraints as first stated, but one constraint
changed everything — see §1.

---

## 1. Stack & topology

| Layer | Choice |
|---|---|
| App | React Router v7 (framework mode) — SSR loaders/actions |
| Scheduled work | Cloudflare Worker + Cron Triggers |
| Database | Supabase (Postgres) |
| ORM | Drizzle |
| Auth | Supabase Auth — email + password |
| AI | Anthropic API (summarization differentiator) |
| Repo | pnpm monorepo — `app`, `worker`, `packages/feed-engine`, `packages/shared` |
| Hosting | Cloudflare Pages/Workers, end to end |

### Why not a separate backend

The genuinely hard engineering in this challenge is the feed pipeline —
parsing, normalization, deduplication, conditional GET, backoff. **None of that
requires a backend framework.** It is pure functions plus a scheduler.

The one thing that *did* justify a long-running NestJS server was
`@nestjs/schedule`: background polling needs a process that stays alive, and
serverless can't hold a scheduler. **Cloudflare Cron Triggers remove that
constraint** — scheduled invocation with no long-running process. Once cron is
external, every remaining NestJS feature (DI, module system, throttler, guards)
is ceremony wrapped around a problem that no longer exists at this scale.

Collapsing to a fullstack framework also dissolves a second problem for free.
The earlier design put the web app and API on different origins, which made the
session cookie a **third-party cookie** — blocked by Safari, fought by Chrome. A
fullstack framework makes the app and its server routes **same-origin by
construction**, so that entire failure mode simply does not exist. This isn't a
mitigation; it's the problem ceasing to be.

What carries over untouched, because it never lived in the framework:

| Decision | Status |
|---|---|
| Items global, not per-user (§2) | unchanged |
| Watermark read-state model (§2) | unchanged |
| Postgres-as-queue via `next_fetch_at` (§3) | unchanged — Supabase *is* Postgres |
| Guest = localStorage, zero DB writes (§5) | unchanged |
| The pure feed-engine package | unchanged — now provably portable |

The feed engine being a dependency-free module was the right call precisely
because it survived a total stack change without edits.

### Why React Router v7

Framework mode (the evolution of Remix) gives server `loader`/`action`
functions that run on Cloudflare's runtime and hold the service-role database
key. That is exactly the shape this app wants: a data-heavy dashboard whose
queries run server-side, with the client never touching a privileged key. It
deploys natively to Cloudflare Pages, keeping the whole system on one platform
and one runtime.

---

## 2. How feeds actually work (and why there's no external API)

This section exists because the runtime decisions in §3 only make sense once the
mechanics are on the table.

**There is no RSS API, no vendor, no key, no quota.** A feed is a URL that
returns an XML document over a plain HTTP GET. The protocol predates modern web
APIs and has barely changed since ~2005. The only external paid service in the
entire project is Anthropic, for the optional summarization feature. Feed
fetching costs nothing and depends on no one.

The flip side of "no provider": nothing enforces politeness. No rate-limit
response tells us to back off. Identifying User-Agent, conditional GET, and
failure backoff are entirely our responsibility (§3).

### Three formats, one normalized shape

The parser collapses all of these into a single `ParsedItem`:

| | RSS 2.0 | Atom 1.0 | RSS 1.0 / RDF |
|---|---|---|---|
| Entry element | `<item>` | `<entry>` | `<item>` — **sibling of `<channel>`, not nested** |
| Link | `<link>` text | `<link href="">` attribute | `<link>` text |
| Body | `<description>`, `<content:encoded>` | `<summary>`, `<content>` | `<description>` |
| Date | `<pubDate>` (RFC 822) | `<published>`/`<updated>` (ISO 8601) | `<dc:date>` |
| Identity | `<guid>` | `<id>` | `rdf:about` attribute |

RDF is the trap: its `<item>` elements sit *outside* `<channel>`, so code that
walks `channel.item` finds nothing and reports an empty feed rather than an
error. Feeds also embed HTML inside XML two ways at once — CDATA blocks and
entity-escaped markup — and namespaced elements like `content:encoded` (full
post HTML) are silently dropped by naive parsers.

### The CORS wall — the reason server-side fetching is mandatory

RSS feeds were built for desktop readers, not browsers, so publishers have no
reason to send CORS headers. Checked against the sample feeds:

```
css-tricks.com/feed/         → no CORS header    ✗ browser fetch blocked
smashingmagazine.com/feed/   → no CORS header    ✗ browser fetch blocked
simonwillison.net/atom/…     → allow-origin: *   ✓
vercel.com/atom              → allow-origin: *   ✓
```

Half work from a browser, half don't. A client-only reader would pass every test
the developer ran and then silently fail on half a real user's feeds. Fetching
server-side (in a loader or the cron worker), where the same-origin policy does
not apply, is the only thing that works — not a preference.

### Format must be sniffed, never trusted

`data/README.md` documents **web.dev as an Atom feed**. It currently serves
**RSS 2.0** (`<rss version="2.0">`, `<item>`, `<pubDate>`). The challenge's own
data is out of date with reality. The lesson lands for free: **detect format
from the document root on every fetch** — never from metadata, config,
`Content-Type`, or file extension. A publisher migrating platforms can change a
feed's format between two polls.

---

## 3. Feed pipeline

### Postgres as the queue — no Redis, ticked by Cloudflare Cron

Durable scheduling state lives in a `feeds.next_fetch_at` column. A Cron Trigger
fires on a fixed interval and, each tick:

1. Claims due feeds: `SELECT … WHERE next_fetch_at <= now()
   ORDER BY next_fetch_at FOR UPDATE SKIP LOCKED LIMIT :batch`.
2. Fetches them concurrently under a cap.
3. Writes back each feed's next due time.

`SKIP LOCKED` is cheap insurance: Cron invocations don't overlap per schedule by
default, but a slow tick can still be running when the next fires, and the lock
guarantees no feed is claimed twice.

### The Workers tradeoff, stated honestly

Serverless cron is not a free lunch — it swaps one constraint for another. A
Worker invocation has **duration and subrequest limits**, so the poller must be
**batch-oriented**: each tick claims a bounded set of due feeds rather than
draining the whole table, and frequent ticks work through any backlog. The
`next_fetch_at` design already supports this exactly — a feed not claimed this
tick is simply claimed next tick. At the guest scale (19 feeds) plus early
per-user feeds this is comfortably within limits; the batching is what lets it
scale past them without re-architecture.

We traded "must keep a process alive" for "must fit work into a Worker
invocation." The second is the better problem: it costs nothing at idle and the
platform handles the scheduling.

### Runtime constraint: Web APIs, not Node APIs

Everything runs on Cloudflare's edge runtime, which rules out Node-only
dependencies. This is the one design change the platform forces, and it's
favorable:

- **Encoding** (ISO-8859-1, Windows-1252 — a core requirement) uses the
  platform's native `TextDecoder`, which supports those labels directly. The
  earlier plan's `iconv-lite` needs Node's `Buffer` and is **dropped entirely**.
- **Fetching** uses the standard `fetch` and `AbortController`.
- The parser targets Web APIs from the first line, so it runs in a loader, in
  the cron worker, and in a unit test without conditional code.

### Fetch policy

| Concern | Policy |
|---|---|
| Timeout | 10s per feed (`AbortController`) |
| Body cap | 5 MB, aborted past the limit |
| Conditional GET | Send stored `If-None-Match` / `If-Modified-Since`; a **304 bumps the timestamp and skips parsing and all writes** |
| Redirects | Follow up to 5; 301/308 rewrites the stored `feed_url` |
| Identity | `User-Agent: Frontpage/1.0 (+url)` on every request |
| Success | `next_fetch_at = now() + refresh interval` |
| Failure | `next_fetch_at = now() + min(2^failures × 5min, 24h)`, jittered |
| Dead feeds | Transient vs. permanent distinguished in `FeedErrorKind`; permanent errors decay to a daily retry rather than stopping |

Conditional GET is not a nicety here. CSS-Tricks returns
`etag`, `last-modified`, and `cache-control: max-age=3600`. Storing the two
validators and sending them back turns an unchanged feed into a 304 with an
empty body — the difference between trivial and rude across 19 feeds on a
schedule. Backoff is jittered so feeds that fail together don't retry in
lockstep.

### Parsing

A pure, dependency-light, Web-API-only module in `packages/feed-engine` — no
framework coupling, no I/O — so it is trivially testable and shared by the app
and the worker:

```
raw bytes
  → encoding detection (XML declaration → HTTP charset → BOM → UTF-8)
  → TextDecoder decode (UTF-8, ISO-8859-1, Windows-1252)
  → fast-xml-parser (lenient mode, partial recovery)
  → format detection from document root (rss2 | rss1/RDF | atom)
  → per-format extractor
  → normalizer (entities decoded, dates parsed, URLs absolutized,
                HTML sanitized, excerpt derived)
  → ParsedFeed
```

Date parsing handles ISO 8601, RFC 822/2822, and common non-standard variants,
falling back to `null` rather than `Date.now()` — a wrong date silently
corrupts sort order, which is worse than an absent one. Non-fatal problems
accumulate in `ParsedFeed.warnings`, so a partial parse is visible in feed
health instead of failing silently.

**Testing: light touch.** Unit tests target the paths where correctness is
genuinely uncertain — date formats, encodings, entity decoding, malformed-XML
recovery — not a full fixture corpus.

---

## 4. Data model

### The load-bearing decision: items are global, not per-user

`feeds` and `items` are shared rows deduped by normalized URL. Users attach via
`subscriptions`. One fetch of CSS-Tricks serves every user and every guest.
Per-user item copies would duplicate 19 feeds × ~20 items for every visitor and
put writes on the unauthenticated guest path.

```
auth.users ──< subscriptions >── feeds ──< items
   │                │                        │
   │                └── categories           │
   └──────────────< item_state >─────────────┘
```

### Tables

```sql
-- Managed by Supabase Auth, in the `auth` schema. We never write these;
-- our foreign keys reference auth.users(id) (a UUID).
auth.users   (id, email, encrypted_password, ...)

-- Global, shared across all users. `public` schema.
feeds  (id, feed_url UNIQUE, site_url, title, description, icon_url, format,
        etag, last_modified,                    -- conditional GET validators
        last_fetched_at, last_success_at, next_fetch_at,
        failure_count, last_error JSONB, created_at)

items  (id, feed_id, guid_hash, title, link, excerpt, content_html, author,
        published_at, image_url, tags,
        content_hash,                           -- change detection on re-fetch
        summary, summary_model, summary_at,     -- AI cache, shared by all users
        search_vector TSVECTOR, created_at,
        UNIQUE (feed_id, guid_hash))

-- Per-user.
categories    (id, user_id, name, color, position, UNIQUE (user_id, name))
subscriptions (id, user_id, feed_id, category_id, custom_title,
               read_through_at,                 -- the watermark; see below
               UNIQUE (user_id, feed_id))
item_state    (user_id, item_id, status, bookmarked_at,
               PRIMARY KEY (user_id, item_id))
preferences   (user_id PRIMARY KEY, theme, layout, refresh_interval,
               hide_read, reading JSONB)
```

`subscriptions` — not `feeds` — owns `category_id` and `custom_title`, because
those are one user's opinion about a shared row. The API flattens the two into a
single `Feed` shape for the client, which has no use for the distinction.

### Read state without unbounded growth

The spec asks this directly. The answer has two halves.

**Sparse rows.** The default is unread, so an `item_state` row exists *only*
where a user has explicitly diverged — read, un-read, or bookmarked something. A
user who reads nothing writes nothing.

**A watermark.** Each subscription carries `read_through_at`; anything published
at or before it counts as read:

```sql
effective_status = COALESCE(
  item_state.status,                                     -- explicit override
  CASE WHEN items.published_at <= subscriptions.read_through_at
       THEN 'read' ELSE 'unread' END                     -- watermark default
)
```

"Mark all as read" becomes **one timestamp write** plus a delete of rows the
watermark now subsumes — not N inserts. The table tracks divergence from a
moving default, so it stays proportional to user *activity*, never to
items × users. Unread counts stay cheap for the same reason.

### Indexes

| Index | Serves |
|---|---|
| `items (feed_id, published_at DESC, id)` | main list scan + keyset cursor |
| `items USING GIN (search_vector)` | full-text search (#14) |
| `subscriptions (user_id, category_id)` | category filtering |
| `item_state (user_id, item_id)` | PK; state join |
| `item_state (user_id) WHERE bookmarked_at IS NOT NULL` | partial — Saved view |
| `feeds (next_fetch_at)` | the scheduler's due-feed claim |

### Pagination

Keyset on `(published_at DESC, id)`, not `OFFSET`. The list gains rows at the
head during background refresh, so offset paging would duplicate or skip items
mid-scroll. The cursor is an opaque encoding of that tuple.

### Deduplication

- **Feed identity** — normalized URL: lowercased host, trailing slash stripped,
  tracking params removed. A permanent redirect (301/308) rewrites `feed_url`.
- **Item identity** — `guid_hash`: feed GUID → canonical link →
  hash(title + published_at). Covers feeds that omit GUIDs.
- **Re-fetch drift** — compare `content_hash`; changed content updates the row
  in place, never creating a second item.
- **Retention** — prune items older than 90 days unless bookmarked;
  `item_state` cascades.

---

## 5. Auth & data access

### Supabase Auth

Supabase Auth provides sign-up, sign-in, sign-out, password reset, email
verification, and session management against the same Postgres that holds the
application data. Because the app and its server routes are same-origin, its
cookie is first-party and the third-party-cookie problem never arises. This is
the third and final auth decision on this project; it is now locked, because
auth touches the schema and every protected route.

The client uses `supabase-js` for the auth flows only. All application data
flows through React Router `loader`/`action` functions.

### Server-side authorization, not RLS

Supabase's default posture is Row-Level Security with client-side queries. We
deliberately query server-side instead:

- Our data splits into **global** rows (`feeds`, `items`) and **per-user** rows.
  Expressing "everyone reads items, but only through their own subscriptions,
  and read-state is per user" in RLS policies is fiddly and easy to get subtly
  wrong.
- Loaders and actions already run on the server and can hold the service-role
  key, so authorization is enforced in one place, in TypeScript, next to the
  query — reviewable and testable.

RLS stays enabled as defense-in-depth (deny-by-default on the per-user tables),
but correctness does not depend on getting a dozen policies exactly right.

### The one integration gotcha: connecting from the edge

Cloudflare's runtime can't open arbitrary TCP the way a Node server does, so the
database connection goes through **Supabase's Supavisor pooler in transaction
mode**, with Drizzle over a serverless-compatible driver. Transaction-mode
pooling **does not support prepared statements**, so the driver is configured
with `prepare: false`. Recording this here because it is a silent-failure
footgun otherwise — it works locally against a direct connection and breaks only
once deployed.

Drizzle is kept (over `supabase-js`'s PostgREST) because the queries that matter
— `FOR UPDATE SKIP LOCKED`, keyset pagination, `tsvector` search — aren't
expressible through PostgREST, and typed schema + migrations give the
access-pattern reasoning the challenge asks us to document.

---

## 6. Guest mode

**A guest writes nothing to the database.** Items are already global and cached,
so a guest's read state and bookmarks live in localStorage keyed by global item
ID.

- Instant — no user provisioning on the click.
- Abuse-proof — unauthenticated traffic cannot write.
- Literally satisfies "session-based, not persisted across visits."
- **Sign-up migrates local state into real rows** — a genuine conversion moment
  rather than a discarded session.

The client keeps one state interface with two implementations, local and remote,
so components never branch on whether the viewer is a guest.

Supabase supports anonymous sign-ins that provision a real user per visitor. We
deliberately don't use them, for the same reason we rejected Better Auth's
`anonymous` plugin earlier: it puts a database write on the unauthenticated path
— the exact property guest mode exists to avoid — and makes the guest bootstrap
per-visitor and therefore uncacheable.

### The guest bootstrap is edge-cacheable

Every guest gets the *same* payload — same 19 feeds, same categories, same first
page of items — so it's a static asset with a short TTL served from Cloudflare's
edge. The submitted URL is a guest link; this is what makes its first paint
instant instead of waiting on a database round trip.

---

## 7. Performance

Targets: landing TTI < 2s, feed load < 3s, search < 500ms, Lighthouse
> 85/90/90.

| Lever | Approach |
|---|---|
| First paint | SSR loader returns user, categories, feeds, counts, health, and the first page of items together — no client waterfall |
| Guest first paint | Bootstrap cached at Cloudflare's edge; no cold DB read |
| Bundle | Router and data-layer chunks cached separately from app code |
| Long lists | Virtualized past ~100 items; keyset pagination beneath |
| Images | `loading="lazy"`, explicit dimensions to prevent layout shift |
| Perceived speed | Optimistic read-state toggles; skeletons matched to content shape |
| Search | Postgres `tsvector` + GIN, debounced client-side |

Cloudflare's edge is a genuine advantage over the earlier always-on-server plan:
no cold start to defend against, and static assets serve from close to the user
by default.

---

## 8. AI summarization (differentiator 1)

**Summaries cache globally, keyed by item content hash — not per user.** One
reader summarizing an article warms it for everyone, guests included.

Generated **on demand**, never precomputed: 19 feeds × ~20 items per refresh
would be ~380 model calls an hour for content nobody has opened.

- Per-user and per-IP rate limits; guests get a small allowance.
- Absent `ANTHROPIC_API_KEY`, the feature reports itself unavailable and the
  rest of the app is unaffected — additive, never load-bearing.
- Failures degrade to the feed's own excerpt.
- Weekly digest synthesis is cached per user per week.

Model selection and pricing will be read from current Anthropic documentation at
implementation time, not assumed.

---

## 9. Accessibility (differentiator 2)

Design tokens already encode the hard parts (to be reused from the earlier
`tokens.css` draft):

- Theme resolution where an explicit choice overrides the OS preference in
  **both** directions — a bare `prefers-color-scheme` block can't express
  "light, even though my OS is dark."
- Reduced motion honors the OS setting *and* offers an in-app override.
  Durations are zeroed rather than animations disabled, so `transitionend`
  handlers still fire and no state machine stalls.
- High-contrast mode collapses the muted greys — exactly the tokens that fail
  AAA — toward the primary text color.
- `:focus-visible` only, so pointer users never see a ring and keyboard users
  always do.
- An inline pre-paint script applies theme/contrast/motion before first render,
  avoiding a flash of the wrong theme.

Still to build: reader font/size/measure controls, a dyslexia-friendly face,
full ARIA landmarks and live regions for refresh and bulk actions, skip links,
and an accessibility statement page. Status indicators pair an icon with color
throughout — feed health is never communicated by hue alone.

---

## 10. Deployment

```
Browser
   │  (single origin — app and server routes are one deployment)
   ▼
Cloudflare Pages/Workers ── React Router v7 (SSR loaders/actions)
   │
   ├── Cloudflare Cron Trigger ── feed-poller Worker
   │                                 (imports packages/feed-engine)
   ▼
Supabase ── Postgres (via Supavisor pooler, prepare: false)
```

Everything is on Cloudflare, one runtime, one origin. There is no always-on host
to pay for and no cold-start on the submitted guest link to defend against — the
edge-cached bootstrap and the platform's global distribution handle first paint.

Submitted URL is the guest route, per the challenge instructions — not the
landing page.

---

## 11. Open — the three design challenges

Architecture is settled; these are product decisions and remain open. Per
`AGENTS.md`, these are the "design-it-yourself" features where we decide together
before building:

1. **Content discovery & onboarding** — how a new user gets from empty to
   populated; curation vs. customization.
2. **Digest view** — what it contains, how it ranks, and what makes it
   meaningfully different from scrolling the main feed.
3. **Layout customization** — four modes are declared (`compact`, `comfortable`,
   `cards`, `magazine`) with `comfortable` as the default; scope, persistence,
   and switching UX undecided.

Deferred implementation decisions: OPML import/export sits behind the same
parser and normalization layer; the keyboard-shortcut layer and command palette
are additive over the finished list view.

---

## Decision log

| # | Decision | Superseded |
|---|---|---|
| 1 | Fullstack React Router v7, not a separate NestJS backend | NestJS API |
| 2 | Cloudflare Cron Triggers for polling | `@nestjs/schedule` |
| 3 | Supabase (Postgres) + Supabase Auth | Neon + Better Auth + hand-rolled JWT |
| 4 | All-Cloudflare hosting, single origin | Vercel + Fly.io + proxy rewrite |
| 5 | Web-API-only feed engine (`TextDecoder`) | Node `iconv-lite`/`Buffer` |
| 6 | Drizzle over Supavisor pooler, `prepare: false` | Drizzle over Neon direct |

Unchanged since the first draft: global items, watermark read-state,
Postgres-as-queue, guest = localStorage, on-demand globally-cached AI summaries,
accessibility-first token design.
