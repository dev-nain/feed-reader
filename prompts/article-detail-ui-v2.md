# Prompt: Article detail v2 — Newsreader type, aside rail, "More from source" footer

Follow-up to `prompts/article-detail-ui.md` (shipped). Three requested changes.

## Goal
1. Article body set in **Newsreader** instead of Georgia.
2. A **right-hand rail** on the detail page: AI Summary + Source Details.
3. Replace the prev/next pager with **"More from {source}"** (falling back to
   "Related in {category}").

## Skills / guidance read
- `guidance/brand-kit.md` — type stack (currently `Georgia` for reader view), tokens.
- `spec/differentiators.md` §1 AI-Powered Summarization — "1-2 paragraph digest", "UX that makes AI feel helpful rather than intrusive".
- `spec/core-requirements.md` §6 — next/prev is an acceptance criterion; see decision 4.
- `guidance/accessibility.md` — landmarks, focus, never colour alone.

## Existing code inspected
- `app/components/article/reader.tsx` — `COLUMN` constant, `ArticleHeader`, `ArticleBody`, `ArticlePager`.
- `app/routes/article.tsx` — loader returns `{ item, prev, next }`.
- `app/root.tsx` — `links()` already preconnects Google Fonts and loads Inter.
- `app/app.css` — `--font-serif: "Georgia", "Charter", serif` in `@theme`.
- `app/lib/mock-feed.ts` — 7 items, every `source` unique, so "more from source" has nothing to show today.

## Decisions / assumptions
1. **Newsreader replaces Georgia** in the `--font-serif` token (Georgia stays as the fallback), loaded from Google Fonts alongside Inter in `root.tsx`. This deviates from the brand kit's type table — requested by the user, to be noted in the README.
2. **AI summary is mock text**, clearly labelled as AI-generated with a Sparkles icon and a "Generated summary — may contain errors" footnote. Presentational only; no AI SDK call, no Mistral key, nothing server-side. `ponytail:` marks the swap point for the real differentiator.
3. **Rail is `<aside>`, desktop-only (`xl:`)**. Below `xl` the two panels stack **below** the article rather than disappearing (content, not chrome). The reading measure is unchanged; the rail sits beside it and the page grows wider, capped by `max-w-page`.
4. **Prev/next is replaced, not kept.** Core #6 lists next/prev navigation as an acceptance criterion, so `ArticlePager` is deleted here and the criterion goes unmet — flagged rather than silently dropped. Say the word and I'll keep a slim prev/next strip above the new section.
5. **Related items need data**: add 4 more mock items so some sources repeat (a second Smashing Magazine, Simon Willison, Josh W. Comeau and Cloudflare piece). Fallback chain: same source → same category → nothing rendered.

## Files to change
- `app/app.css` — `--font-serif: "Newsreader", "Georgia", "Charter", serif`.
- `app/root.tsx` — add Newsreader to the existing Google Fonts stylesheet URL (one request, `display=swap`).
- `app/lib/mock-feed.ts` — 4 extra items; `relatedItems(item)` helper returning `{ label, items }`; mock `aiSummary(item)` string.
- `app/components/article/reader.tsx` — add `ArticleAside` + `MoreFromSource`, remove `ArticlePager` / `PagerLink`.
- `app/routes/article.tsx` — loader returns `{ item, related }` instead of `prev`/`next`; two-column grid layout.

## Layout & visual spec
**Page grid** (inside the existing scroll container): `mx-auto max-w-page px-5 sm:px-8`, `grid xl:grid-cols-[minmax(0,45rem)_18rem] xl:gap-10`. Article column keeps its 45rem measure; the rail is a fixed 18rem, `xl:sticky xl:top-6 self-start`.

**Rail panels** (each `rounded-lg border border-border bg-bg-secondary p-4`, `space-y-4` between):
- *AI Summary* — header row: Sparkles icon (`text-accent`) + "AI Summary" (`text-sm font-semibold`) + a `Badge` reading "Beta". Body: 2 short paragraphs, `text-sm text-text-secondary`. Footer: `text-xs text-text-tertiary` disclaimer. A "Regenerate" ghost button is **not** included — nothing to regenerate.
- *Source Details* — `SourceMark` + source name + category badge; then a `<dl>` of three rows (`Author`, `Published`, `Category`) with `text-xs uppercase tracking-wide text-text-tertiary` terms and `text-sm text-text-primary` values; then a "Visit {source}" external link (`text-sm text-accent`, `rel="noreferrer noopener"`, sr-only "opens in a new tab").
- Below `xl`: same panels, full width, stacked under the article body, `mt-8`.

**More from source** (replaces the pager, full width under the article column):
- `<section aria-labelledby>` with `<h2 id>` = "More from {source}" or "Related in {category}", `text-lg font-semibold`, `border-t border-border-subtle pt-6`.
- Up to 3 items as `Link` rows: `SourceMark` + title (`text-sm font-medium`, `line-clamp-2`) + relative time (`text-xs text-text-tertiary`), `rounded-lg p-3 hover:bg-bg-secondary`, visible focus ring.
- Renders nothing when there are no candidates.

## Typography
- Body/li/blockquote `font-serif` → now Newsreader; headings and all UI stay Inter. Rail text is Inter (`font-sans`) — it is UI, not prose.
- No new sizes: rail uses `text-sm` / `text-xs` only.

## Responsiveness
- `< xl`: single column, rail panels stack below the article, no horizontal scroll.
- `≥ xl`: article + sticky rail side by side inside `max-w-page`; text measure still ~45rem.

## Accessibility
- Rail is `<aside aria-label="Article context">`; related list is a `<section>` labelled by its heading; `<dl>` for source facts.
- AI content is labelled in text ("AI Summary" + disclaimer), not by colour or icon alone.
- Every link keeps `focus-visible:ring-2 focus-visible:ring-accent`; tap targets ≥44px.

## Security
- Summary and source facts are plain strings from the mock module — no HTML, no `dangerouslySetInnerHTML`, no AI call, no keys anywhere near the client.
- External links keep `rel="noreferrer noopener"`.

## Acceptance criteria
- Article body renders in Newsreader (verifiable via computed font-family); UI stays Inter.
- At ≥1280px the rail sits right of the article and sticks on scroll; below that both panels appear under the body in order.
- "More from {source}" lists up to 3 same-source items; where a source has no siblings the heading reads "Related in {category}"; where neither exists nothing renders.
- No prev/next pager remains; no dead imports.
- No horizontal scroll 320px → 1920px; light and dark both token-clean.

## Checks to run
`npm run typecheck`, `npm run lint`, `npm run build`.

## Manual test steps
1. `npm run dev`, open an article from the feed.
2. Confirm body text is Newsreader (DevTools → computed font-family on a `<p>`) and headings are Inter.
3. Resize across 1280px — rail moves from beside the article to below it; scroll to confirm stickiness on desktop.
4. Open article 1 (Smashing Magazine) → "More from Smashing Magazine"; open article 4 → check the source/category fallback wording.
5. Toggle theme; confirm rail panels and summary text recolour cleanly.
6. Tab through: toolbar → article → rail links → related links, ring visible at each stop.
