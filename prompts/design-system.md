# Prompt: Theme + design system foundation with base components

## Goal
Wire the existing Frontpage brand tokens into the app and ship a small set of
reusable, typed, accessible base components (shadcn-style) that the rest of the
build will consume. Include a working light/dark theme with a class toggle that
defaults to the OS preference.

## Skills read
- `guidance/brand-kit.md` (color, type, spacing, radius, shadow, layout tokens; Lucide icons)
- `guidance/accessibility.md` (WCAG 2.1 AA: semantic HTML, focus-visible, never color alone)
- `.agents/skills/vercel-react-best-practices` (component/data patterns)
- Tailwind v4 `@theme` / `@custom-variant` (starter files already use v4 `@theme inline`)

## Existing code inspected
- `app/app.css` — default React Router starter theme (to be replaced).
- `app/root.tsx` — loads Inter from Google Fonts; renders `<html>`/`<body>`.
- `starter/tokens.css` — full token set, dark mode via `prefers-color-scheme`.
- `starter/tailwind.css` — Tailwind v4 `@theme inline` mapping of tokens.
- `app/routes/home.tsx` + `app/welcome/` — placeholder starter page.
- `package.json` — Tailwind v4 present; no cva/clsx/tailwind-merge/lucide-react.

## Decisions (confirmed with user)
1. **Dark mode:** class toggle on `<html>` (`.dark` / `.light`), defaulting to
   the OS preference when no class is set. Enables a future/near theme toggle.
2. **Component machinery:** full shadcn-style — add `class-variance-authority`,
   `clsx`, `tailwind-merge`, plus `lucide-react` for icons.
3. **Batch:** Core (Button, Input, Card, Badge) + Feedback (Spinner, Skeleton,
   EmptyState) + Icons (Lucide). No overlay/dialog components this batch.
4. A minimal `ThemeToggle` + no-FOUC init script are included because a class
   toggle is inert without them; it also demonstrates the icon + button system.

## Files likely to change / add
- `app/app.css` — rewrite: `@import "tailwindcss"`, import tokens, `@theme inline`
  mapping (from `starter/tailwind.css`), `@custom-variant dark`, base body styles.
- `app/styles/tokens.css` — tokens with class-based dark strategy:
  `:root` light; `@media (prefers-color-scheme: dark) :root:not(.light)` dark;
  `:root.dark` dark. (Content copied from `starter/tokens.css`, dark block reworked.)
- `app/lib/utils.ts` — `cn()` = `twMerge(clsx(...))`.
- `app/lib/theme.ts` — `getTheme()`, `setTheme()`, `applyTheme()`; localStorage key.
- `app/components/ui/button.tsx` — cva variants: `primary | secondary | ghost |
  destructive | outline`; sizes `sm | md | lg | icon`; `asChild`-free (plain).
- `app/components/ui/input.tsx` — styled input, focus-visible ring, invalid state.
- `app/components/ui/card.tsx` — `Card`, `CardHeader`, `CardTitle`,
  `CardDescription`, `CardContent`, `CardFooter`.
- `app/components/ui/badge.tsx` — variants incl. feed status: `default | accent |
  success | warning | error`.
- `app/components/ui/spinner.tsx` — Lucide `Loader2` spin, sized, `role=status`.
- `app/components/ui/skeleton.tsx` — pulse placeholder.
- `app/components/ui/empty-state.tsx` — icon + title + description + optional action.
- `app/components/theme-toggle.tsx` — button cycling light/dark, Lucide sun/moon.
- `app/root.tsx` — add inline no-FOUC script that sets the initial theme class
  before paint; load JetBrains Mono only if trivial (else defer — code font is
  for reader view, not this batch).
- `app/routes/home.tsx` + `app/routes.ts` — optional `/style-guide` route that
  renders every component for visual QA (dev showcase; keep or drop on request).
- `package.json` — add the 4 deps.

## Implementation requirements
- Tailwind v4 dark variant: `@custom-variant dark (&:where(.dark, .dark *));`.
- All components typed, forwardRef where a ref is natural (Button, Input), spread
  rest props, expose `className` merged via `cn()`. No `any`.
- Use token-backed Tailwind classes only (`bg-surface`, `text-text-primary`,
  `border-border`, `text-accent`, etc.) — no raw hex, no `gray-950`.
- Accessibility: real `<button>`/`<input>`; visible `focus-visible` ring using
  `--color-accent`; Spinner `role="status"` + sr-only label; icon-only buttons
  require `aria-label`; status conveyed by text/icon, never color alone.
- `applyTheme` runs client-side; the inline script mirrors it to avoid FOUC and
  must be self-contained (no imports).

## Security requirements
- No secrets, no network calls, no data fetching — pure presentation layer.
- Inline theme script contains no user input; only reads localStorage + matchMedia.

## Acceptance criteria
- `npm run typecheck` passes.
- App renders with brand tokens applied; toggling theme flips light/dark with no
  flash on reload; system preference respected when never toggled.
- Each component renders in both themes with correct tokens and visible focus.
- No new `any`; no raw hex in component classNames.

## Checks to run
- `npm run typecheck`
- `npm run build` (root/CSS/config changed)

## Manual test steps
1. `npm run dev`, open the app (or `/style-guide` if added).
2. Confirm every component (Button variants/sizes, Input incl. invalid, Card,
   Badge statuses, Spinner, Skeleton, EmptyState) renders correctly.
3. Toggle theme → colors flip; reload → no flash, choice persists.
4. Set OS to dark with no prior toggle → app starts dark.
5. Keyboard-tab through interactive elements → visible focus ring on each.
