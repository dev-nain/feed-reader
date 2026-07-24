# Prompt: Home feed dashboard UI (main feed view) with mock data

## Goal
Replace the placeholder style-guide at `/` with the **main feed dashboard** — the
screen users spend 90% of their time in. Static, presentational only: mock feed
data, no DB, no loaders, no auth. Built entirely on the existing design system
(tokens + `ui/*` components). This is the brand kit's #1 key screen, so it must
look like a real product, not a dev showcase.

Scope is **Core #3 Content Browsing** (list view) + the sidebar nav from
**Core #4 Category Organization** and read/unread visuals from **Core #5**, all
as static mock UI. No behavior wired.

## Skills / guidance read
- `guidance/brand-kit.md` — color/type/spacing/radius/shadow/layout tokens, key screens, quality spectrum.
- `guidance/patterns.md` — feed item hierarchy (title > source > time > excerpt), sidebar with unread counts, read = de-emphasized not hidden, "choose 2-3 metadata", responsive sidebar collapse, no info overload.
- `guidance/accessibility.md` — semantic HTML, focus-visible, never color alone.
- Existing components: `button`, `input`, `badge`, `card`, `spinner`, `skeleton`, `empty-state`, `theme-toggle`.

## Existing code inspected
- `app/routes/home.tsx` — current index route = component style-guide showcase.
- `app/routes.ts` — `index("routes/home.tsx")` + `set-theme`.
- `app/components/ui/*` — Button (primary/secondary/outline/ghost/destructive; sm/md/lg/icon), Badge (default/accent/success/warning/error), Card, Input (aria-invalid), Spinner, Skeleton, EmptyState.
- `data/sample-feeds.json` — 19 feeds / 5 categories (Frontend, Design, Backend & DevOps, General Tech, AI & ML). Used for realistic mock names.

## Decisions / assumptions
1. **"Homepage" = main feed dashboard** (confirmed with user), not the landing page.
2. **Mock-only.** Feed items/categories are hardcoded mock data in `app/lib/mock-feed.ts`, marked `ponytail:` as throwaway (real data replaces it when Content Browsing is wired). No fetching, no interactivity beyond native focus/hover + the existing ThemeToggle.
3. **Preserve the style-guide.** Move the current showcase to a new `/style-guide` route (dev QA aid the design-system prompt already anticipated) rather than deleting it.
4. **List layout only.** Card/magazine layout switching is a design-it-yourself feature (`design-challenges.md`) — out of scope; skipped.
5. **Favicons without network:** render a small rounded square with the source's initial letter (feeds have no bundled favicon assets, and we make no network calls). `ponytail:` note left for swapping in real favicons later.
6. **Relative timestamps** are mock strings ("2h", "5h", "yesterday", "2d"); no date library.

## Files to change / add
- `app/lib/mock-feed.ts` — types (`Category`, `Feed`, `FeedItem`) + a hardcoded mock dataset (categories with feeds + unread counts, ~10-12 feed items with title/source/time/excerpt/read/unread). `ponytail: mock data, replace with loader when Content Browsing lands`.
- `app/routes/home.tsx` — rewrite as the dashboard. Local presentational sub-components (`Sidebar`, `FeedItemRow`, `Toolbar`) live in this file to keep the diff small; promote later if reused.
- `app/routes/style-guide.tsx` — the previous showcase content, moved verbatim.
- `app/routes.ts` — add `route("style-guide", "routes/style-guide.tsx")`.

## Layout & visual spec
Overall shell: `min-h-screen`, `bg-bg-primary`, two-column on desktop.

**Sidebar** (`w-sidebar` = 16.25rem, `bg-bg-secondary`, `border-r border-border`, hidden below `lg`, sticky full-height):
- Brand: Rss icon (`text-accent`) + "Frontpage" wordmark (`text-lg font-semibold`).
- Primary nav: "All Items" (active — `bg-accent-subtle text-accent`, unread total badge), "Saved" (Bookmark icon). Active state via bg + weight, not color alone (also `font-medium` + left indicator).
- Categories: each an uppercase `text-xs text-text-tertiary` label, then feeds beneath — favicon square + title + right-aligned unread count (`text-text-tertiary`, hidden when 0). Hover `bg-bg-tertiary`, `rounded-md`, touch target ≥ 36px.
- Footer: ThemeToggle + a subtle "Try as guest" hint line (`text-xs text-text-tertiary`).

**Toolbar** (sticky top, `bg-bg-primary/80 backdrop-blur border-b border-border`):
- Mobile: hamburger (Menu icon) + brand. Desktop: current view title "All Items" + item count (`text-text-tertiary`).
- Search `Input` (Search icon prefix) — `max-w-md`, flex-grow.
- Actions: "Mark all read" (ghost button, hidden on xs), Refresh icon button (`aria-label`), ThemeToggle on mobile only if not in sidebar.

**Feed list** (`max-w-feed mx-auto`, `divide-y divide-border-subtle`):
Each `FeedItemRow` (semantic `<article>`, whole row is an `<a>`-like focusable block with `focus-visible` ring, `hover:bg-bg-tertiary`, `rounded-lg`, `p-4`):
- Line 1: unread dot (`size-2 rounded-full bg-unread`, invisible placeholder when read to keep alignment) + **title** (`text-base`, `font-semibold` unread / `font-normal` read) + relative time far right (`text-xs text-text-tertiary`, `title=` full date).
- Line 2: favicon square + source name (`text-sm text-text-secondary`) + optional category `Badge variant="default"`.
- Line 3: excerpt (`text-sm text-text-secondary`, `line-clamp-2`).
- Read items: wrap content in `opacity-60` (de-emphasized, not hidden). Unread: full opacity + semibold title.
- Metadata capped at 3 pieces (source, time, category) per anti-pattern guidance.
- Include one "12 new items" accent banner at top of list (static) to show the refresh pattern.

Empty-safe: if the mock list were empty, render existing `EmptyState` (Inbox icon) — include the code path even though mock data is populated.

## Typography / spacing / color
- Titles `text-base font-semibold`, source `text-sm`, meta `text-xs`. Never >2 sizes per item cluster.
- Only token-backed Tailwind classes (`bg-surface`, `text-text-secondary`, `border-border`, `bg-accent-subtle`, `text-accent`, `bg-unread`) — no raw hex, no `gray-*`.
- Vertical rhythm: `p-4` rows, `gap-1`/`gap-2` within a row, `px-3 py-2` sidebar items, section gaps `space-y-6` in sidebar.
- Icons: 16px inline/metadata, 20px actions, 24px brand/nav — per brand kit.

## Responsiveness
- `< lg`: sidebar hidden; toolbar shows hamburger + brand. (Drawer open/close is behavior — out of scope; hamburger is presentational, `aria-label` only. `ponytail:` note.)
- `≥ lg`: sidebar visible, dashboard title in toolbar.
- Feed list single column at all sizes; no horizontal scroll. Touch targets ≥ 44px on interactive rows/buttons where reasonable.

## Accessibility
- `<nav aria-label="Feeds">`, `<main>`, `<article>` per item; headings hierarchical (`h1` brand or view title, `h2`/`h3` where appropriate).
- Every icon-only control has `aria-label`; decorative icons `aria-hidden`.
- Unread conveyed by dot **and** weight (never color alone); feed health, if shown, uses Badge text + icon.
- Visible `focus-visible` ring on every focusable row/control (reuse existing ring tokens).

## Security
- Pure presentation. No secrets, no network, no user input persisted. Mock data is static and developer-authored.

## Acceptance criteria
- `npm run typecheck` passes; `npm run build` succeeds.
- `/` renders the populated dashboard in both light and dark themes with correct tokens and no raw hex; theme toggle flips with no flash.
- Sidebar shows 5 categories with feeds + unread counts and an active "All Items" state.
- Feed rows show title/source/time/excerpt with clear unread-vs-read distinction (dot + weight + opacity).
- Layout is single-column and sidebar-hidden below `lg`; no horizontal scroll at 375px.
- Keyboard tab reaches rows and controls with a visible focus ring.
- `/style-guide` still renders every base component.
- No new `any`.

## Checks to run
- `npm run typecheck`
- `npm run build`
- `npm run lint`

## Manual test steps
1. `npm run dev`, open `/`.
2. Confirm sidebar (categories + counts + active All Items), toolbar (search, mark-all-read, refresh), and populated feed list with unread/read styling + "new items" banner.
3. Toggle theme → colors flip, no flash on reload.
4. Resize to 375px → sidebar hidden, hamburger appears, no horizontal scroll, list readable.
5. Tab through → visible focus ring on rows and controls.
6. Open `/style-guide` → all base components still render in both themes.
