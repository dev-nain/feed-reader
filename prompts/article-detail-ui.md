# Prompt: Article detail (reader view) UI with mock data

## Goal
Add the **article detail / reader view** — the screen a feed item opens into.
Static, presentational only: mock content, no DB, no auth, no HTML sanitising
(no real feed HTML exists yet). Scope is **Core #6 Article View** rendered as
mock UI, matching the existing dashboard's design system and shell.

## Skills / guidance read
- `spec/core-requirements.md` §6 Article View (all acceptance criteria), §5 read state, §7 responsive.
- `guidance/brand-kit.md` — tokens, `--font-serif` (Georgia) exists and is currently unused → the reading surface is where it earns its keep; `--content-max-width: 45rem` is the reading measure.
- `guidance/patterns.md` — "reader view full-width on mobile with comfortable margins", max 2-3 metadata pieces, read state de-emphasised not hidden.
- `guidance/accessibility.md` — semantic HTML, focus-visible, skip-to-content, never colour alone.

## Existing code inspected
- `app/routes.ts` — `layout("routes/app-shell.tsx", [index("routes/home.tsx")])`; detail route nests in the same layout.
- `app/routes/app-shell.tsx` — `h-screen` flex shell, header + sidebar + `<Outlet />`; the outlet column owns its own scroll (`overflow-hidden` parent, child scrolls).
- `app/routes/home.tsx` — loader → `getLayout(request)`, toolbar + `<main className="min-h-0 flex-1 overflow-y-auto">`.
- `app/components/home/feed-item.tsx` — all three variants currently link to `href="#article"` (dead link). These become real links.
- `app/components/shared.tsx` — `SourceMark`, `ItemActions`, `UnreadDot`, `WithTooltip`, `REVEAL` — reuse, do not re-implement.
- `app/lib/mock-feed.ts` — `FeedItem` type + 7 items, `categoryStyles`, `sourceColor`.
- `app/lib/motion.ts` — `listContainer` / `listItem` variants.
- `app/app.css` — `@plugin "@tailwindcss/typography"` already added (uncommitted); `@theme` maps `--container-content` (45rem) and `--container-page`, **but not `--container-feed`** — so the existing `max-w-feed` in `feed-list.tsx` currently resolves to nothing.

## Decisions / assumptions
1. **Full-page route, not split pane.** `route("article/:id", "routes/article.tsx")` nested inside `app-shell`, so header + sidebar persist and only the content column swaps. Split-pane is a `design-challenges.md` layout option — out of scope, skipped.
2. **Mock body content.** Add one `body: string[]` field (array of paragraph/heading/code strings) to a small `articleBody` map in `mock-feed.ts` rather than per-item HTML — no `dangerouslySetInnerHTML` anywhere, so sanitisation is a non-question until real feed HTML lands. `ponytail:` comment noting the swap point.
3. **Prose styling via the already-installed `@tailwindcss/typography` plugin**, `prose prose-lg dark:prose-invert` with token overrides — no hand-rolled heading/paragraph CSS.
4. **No behaviour wired**: mark-read, bookmark, share, and next/prev are presentational (real links for next/prev, since they're just other mock ids). Read state on open is Core #5 behaviour — skipped.
5. **Reader view is the default**, per spec, with a prominent "Open original" external link. Feeds with excerpt-only content are out of scope for the mock.
6. **Fix `max-w-feed`** by adding `--container-feed: var(--feed-max-width)` to the `@theme` block — one line, and the detail page uses `max-w-content` for the reading measure.

## Files to change / add
- `app/routes.ts` — add `route("article/:id", "routes/article.tsx")` inside the `app-shell` layout children.
- `app/routes/article.tsx` — loader resolves `params.id` against mock items (`throw data(null, { status: 404 })` when missing), `meta` from the title, component composes the pieces below.
- `app/components/article/reader.tsx` — `ArticleHeader` (title/meta) + `ArticleBody` (prose) + `ArticlePager` (prev/next).
- `app/components/article/toolbar.tsx` — detail-page toolbar (back, actions, open original), mirroring `home/toolbar.tsx` structure.
- `app/lib/mock-feed.ts` — add `author` to `FeedItem`, add `articleBody` map + `adjacentItems(id)` helper.
- `app/components/home/feed-item.tsx` — replace the three `href="#article"` with `<Link to={`/article/${item.id}`}>`.
- `app/app.css` — add `--container-feed` to `@theme`.

## Layout & visual spec
**Detail toolbar** (sticky, `border-b border-border bg-bg-primary/80 backdrop-blur`, same height as the home toolbar):
- Left: back `Button variant="ghost" size="icon"` (ArrowLeft, `aria-label="Back to all items"`) using `<Link to="/">`, then the source name + `SourceMark` (truncate).
- Right: Save (Bookmark) and Share (Share2) via the existing `ItemActions`, plus a primary-ish `Button variant="outline" size="sm"` "Open original" (ExternalLink icon, `target="_blank" rel="noreferrer noopener"`).
- Mobile: collapse the source label; keep icon buttons only (all ≥44px targets).

**Article header** (`mx-auto max-w-content px-5 pt-10 pb-6 sm:px-8`):
- Category badge (reuse `categoryStyles[category].badge`) as the first element.
- `<h1>` `text-3xl font-bold tracking-tight text-text-primary` (2xl on mobile), `text-balance`.
- Meta line: `SourceMark` + source name (`font-medium text-text-primary`) · author · `<time dateTime>` full date — exactly three pieces per patterns.md, `text-sm text-text-secondary`, wraps gracefully.
- Thin `border-b border-border-subtle` under the header block.

**Article body** (`mx-auto max-w-content px-5 py-8 sm:px-8`):
- `prose prose-lg dark:prose-invert` with token overrides so nothing falls back to Tailwind greys: `prose-headings:text-text-primary prose-p:text-text-secondary prose-a:text-accent prose-strong:text-text-primary prose-code:text-text-primary prose-pre:bg-bg-secondary prose-pre:border prose-pre:border-border prose-blockquote:border-l-accent prose-img:rounded-lg`.
- Body font: `font-serif` on paragraphs for reading comfort (the brand kit's serif token, currently unused); headings stay `font-sans`. Measure capped by `max-w-content` (45rem).
- Content must exercise every element the spec names: h2, h3, paragraphs, ul/ol, blockquote, inline code, a code block, and one image placeholder (a token-coloured `div`, no network).
- End of article: `border-t border-border-subtle` then a muted "Read the full article at {source}" external link.

**Pager** (`mx-auto max-w-content px-5 pb-16 sm:px-8`, grid of two `Link` cards, `sm:grid-cols-2`):
- Each: `rounded-lg border border-border p-4 hover:bg-bg-secondary`, small `text-xs uppercase tracking-wide text-text-tertiary` label ("Previous" / "Next" with Chevron icon), then the target title `line-clamp-2 text-sm font-medium`.
- Missing neighbour → render nothing in that cell (keep the grid balanced with `sm:col-start-2` on a lone Next).

**Motion**: reuse the existing vocabulary — fade+`y: 8` in on the article container via `listItem`-style variants; nothing new invented. Respects `MotionConfig reducedMotion="user"` already set in the shell.

## Typography / spacing / colour
- Only token-backed classes (`text-text-*`, `bg-bg-*`, `border-border*`, `text-accent`) — no raw hex, no `gray-*`.
- Sizes: h1 `text-3xl`/`sm:text-3xl`, body `prose-lg` (~1.125rem), meta `text-sm`, labels `text-xs`.
- Vertical rhythm: header `pt-10 pb-6`, body `py-8`, pager `pb-16`; horizontal `px-5 sm:px-8`.
- Icons: 16px in meta/pager, 20px in toolbar actions.

## Responsiveness
- Content column scrolls inside the shell (`min-h-0 flex-1 overflow-y-auto`), same as home — page itself never scrolls, no horizontal scroll at any width.
- `< sm`: single column, `px-5`, h1 `text-2xl`, toolbar shows icons only, pager stacks.
- `≥ lg`: sidebar remains; reading measure stays 45rem centred in the remaining space (no full-bleed text).

## Accessibility
- `<main>` wrapping `<article>`; single `<h1>` = article title; body headings are h2/h3 in order.
- `<time dateTime="...">` with a machine-readable value; relative label only in tooltips.
- Every icon-only control has `aria-label`; decorative icons `aria-hidden`.
- External links: `rel="noreferrer noopener"` + visually-hidden "(opens in a new tab)".
- Pager links have `aria-label="Previous article: {title}"` / next.
- Visible `focus-visible:ring-2 focus-visible:ring-accent` on every link and control; category conveyed by text, not colour alone.

## Security requirements
- No `dangerouslySetInnerHTML`, no HTML strings in the mock data — body is plain text rendered through React, so no XSS surface exists at this stage.
- No network calls, no secrets, no env access; loader reads only from the local mock module.
- `params.id` is looked up in a fixed map, never interpolated into markup or a URL; unknown id → 404 via `data(null, { status: 404 })`.
- External links carry `rel="noreferrer noopener"` to prevent reverse-tabnabbing.

## Acceptance criteria
- Clicking any feed item in any of the three layouts navigates to `/article/:id` and renders that item's mock article.
- Reader view shows title, source, author, publication date, and a working "Open original" external link.
- Body renders headings, paragraphs, lists, blockquote, inline code, a code block, and an image placeholder, all token-styled in light and dark.
- Prev/next links move between adjacent mock items without returning to the list; ends of the list render only the available neighbour.
- Header + sidebar persist across the navigation (no full remount, no layout shift).
- Unknown id renders a 404 rather than crashing.
- No horizontal scroll from 320px to 1920px; keyboard tab order is toolbar → article links → pager, with a visible ring throughout.

## Checks to run
- `npm run typecheck`
- `npm run build` (routes changed)
- `npm run lint`

## Manual test steps
1. `npm run dev`, open `/`.
2. Click any feed item row → lands on `/article/<id>`; verify title/source/author/date and the category badge.
3. Toggle the theme → confirm prose, code block, blockquote and image placeholder all recolour (no grey leakage).
4. Switch home to grid and compact layouts; click an item in each → same detail page.
5. Use Next/Previous to walk from item 1 to item 7 and back; confirm the first has no Previous and the last no Next.
6. Tab through the page from the back button to the pager — every stop shows a focus ring.
7. Resize to 320px and 1920px — no horizontal scroll; text measure stays ~45rem on desktop.
8. Visit `/article/does-not-exist` → 404 page, app shell intact.

## Explicitly skipped
- Real feed HTML + sanitisation, read-on-open persistence, working bookmark/share, split-pane layout, font-size/width reader preferences, comments/annotations. Add when the DB and feed-parsing layers land.
