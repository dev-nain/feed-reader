# AGENTS.md — Frontpage

You are a **principal-level full-stack engineer and implementation agent** working on **Frontpage**, a customizable RSS/Atom content aggregator ("your personalized front page for tech content").

Frontpage is a **Product Challenge** on [Frontend Mentor](https://www.frontendmentor.io) — a real, multi-session build, no Figma. You are a collaborative builder, not a mentor.

Your job: understand the request, read the relevant spec and skills, stay **strictly inside the requested scope**, then implement to spec.

---

# 0. Prime directive — stay in scope

The specs already define this product. Your value is building **exactly** what is asked, to the spec, and nothing more.

- **Build only what the request and `spec/` define.** No features, tables, routes, settings, or abstractions that no one asked for.
- **Do not invent product scope.** Feed sources, categories, schema fields, and edge cases come from `spec/` and `data/` — never made up here or in code.
- **Respect the feature tiers** (section 1). Core → build to spec. Stretch / Differentiators → only when the user picks them. Design-it-yourself → ask first.
- When a request is bigger than the spec supports, build the spec version and say what you skipped in one line, rather than guessing at the extra.
- No speculative flexibility: no interface with one implementation, no config for a value that never changes, no "for later" scaffolding.

If in doubt about scope, ask one focused question before building — not after.

---

# 1. Product scope & feature tiers

Frontpage pulls RSS/Atom feeds into one organized reading dashboard. Full definition: `spec/product-definition.md`.

This project is the **full-stack path** (Supabase auth + database). The frontend-only alternative in `spec/technical-requirements.md` is **not** the chosen path — do not build localStorage-only variants.

Features are tiered. Treat the tier as a scope gate:

| Tier | Where | Rule |
|------|-------|------|
| **Core** (12 features) | `spec/core-requirements.md` | Build to spec, efficiently. This is the baseline product. |
| **Stretch** (6 features) | `spec/core-requirements.md` | Build only when the user asks for that feature. |
| **Design-it-yourself** (3) | `spec/design-challenges.md` | **Ask clarifying questions first.** The user makes the product decisions; document them in the README. |
| **Differentiators** (6, pick 1–2) | `spec/differentiators.md` | Build only the one(s) the user selects. |

Do not pull a Stretch, Design, or Differentiator feature into a Core task on your own initiative.

---

# 2. Workflow

For every implementation request:

1. Read `AGENTS.md`.
2. Read the relevant `spec/` and `guidance/` files for the feature.
3. Read the skills the task needs (section 3).
4. Inspect the code the change touches — trace the real flow before writing.
5. Confirm the request is in scope (section 0/1). For a design-it-yourself feature, ask clarifying questions first.
6. Create a detailed prompt file in `prompts/`.
7. Ask: `I prepared the implementation prompt at prompts/<file-name>.md. Is this good to execute?`
8. On approval, re-read the approved prompt file in prompts/ and implement it strictly. Implement only after user approval.
9. Run available checks: `npm run typecheck`, then `npm run build` when routes/config/server modules changed. Report the real output.
10. Share exact steps to run/test the feature.

Keep diffs small and reversible. Prefer reusing an existing helper, component, or pattern over adding a new one.

---

# 3. Skills

Use these project skills — read the one that matches the task before coding:

- `.agents/skills/react-router` — routes, route modules, **loaders + actions**, forms, fetchers, SSR, params. This is the framework's data layer; use it for all server reads/writes.
- `.agents/skills/vercel-react-best-practices` — React 19 component and data-fetching performance patterns.
- `.agents/skills/ai-sdk` — Vercel AI SDK with the **Mistral** provider for AI features (summaries, digest), and embeddings for similarity search.
- `.agents/skills/supabase` — auth, schema, migrations, queries, service-role usage, RLS, pgvector.
- `.agents/skills/supabase-postgres-best-practices` — query, index, and schema design for the access patterns in `spec/technical-requirements.md`.

Do not invent new skills. For Tailwind v4, Zod, and the custom UI components, follow existing project patterns and the starter files.

---

# 4. Prompt files

Prompt files live in the `prompts/` directory. Use names like:

- `prompts/oxylabs-scraping.md`
- `prompts/oxylabs-scheduler.md`
- `prompts/ai-analysis.md`
- `prompts/news-details-page-ui.md`

Each prompt must include:

- goal
- skills read
- existing code inspected
- decisions or assumptions
- files likely to change
- implementation requirements
- security requirements
- acceptance criteria
- checks to run
- exact manual test steps expected after implementation

For UI tasks, also include visual interpretation, layout, typography, spacing, colors, responsiveness, and pixel-perfect expectations.

---


# 5. Architecture — separation of concerns

Keep these layers separate. UI displays data; it does not fetch feeds, mutate state, or call AI.

- **Routes / UI** — React Router route modules and custom (shadcn-like) components. Presentation only.
- **Loaders** — all server-side reads (feed items, categories, read state, bookmarks) via `loader` functions.
- **Actions** — all mutations (add/edit/remove feed, mark read, bookmark, preferences) via `action` functions. Validate inputs with **Zod**.
- **Feed fetching & parsing** — server-side RSS/Atom fetch + parse (browsers can't fetch feeds directly; CORS). On-demand fetch runs server-side; scheduled fetch runs in the **Cloudflare Worker** cron. Timeouts, retries, dedupe, and encoding/date normalization per `spec/core-requirements.md` §2 and `spec/technical-requirements.md`.
- **Database** — Supabase reads/writes, server-only. RLS enforces per-user data.
- **AI** — Vercel AI SDK + Mistral for summaries/digest; validate model output with Zod before use or storage.
- **Vector / search** — pgvector for similarity and global search.
- **Analytics** — PostHog for product analytics only; it is never the source of truth for app data.

---

# 6. Tech stack

Use:

- **React Router v8** (framework mode, SSR — see `react-router.config.ts`) — routes, loaders, actions
- **React 19**
- **Tailwind v4** + custom shadcn-like components (`starter/tokens.css`, `starter/tailwind.css`, `guidance/brand-kit.md`)
- **Zod** — validation at every trust boundary (action inputs, feed URLs, AI output)
- **Supabase** — auth **and** database (this project uses Supabase Auth)
- **Vercel AI SDK** + **Mistral** — AI features
- **pgvector** — similarity / global search
- **Cloudflare Worker** — cron for scheduled feed fetching and AI features (summaries etc.)
- **PostHog** — product analytics

> **This is not the React Router you may know.** v8 framework mode (loaders/actions/route modules) differs from older React Router and from Remix. Read `.agents/skills/react-router` before writing routing or data code rather than relying on training-data recall.

Do not add a separate backend framework, a second auth provider, or a client-side-only data store. Do not add a dependency for what a few lines and an existing library already cover.

---

# 7. Security & data boundaries

Never expose to browser code:

- Supabase service-role key
- Mistral / AI provider credentials
- Cloudflare Worker / cron secret

Never run from browser code: feed fetching, AI calls, or privileged database writes. Keep secrets in server-only modules and environment variables; only anon/`*_PUBLIC` values may reach the client.

- **RLS** protects all per-user data (feeds, categories, read state, bookmarks, preferences).
- **Guest mode** is session-scoped and must not persist to a user account (`spec/core-requirements.md` §11).
- Deployment must expose no secrets and work for any visitor (`spec/technical-requirements.md`).

---

# 8. Specs & Guidance

| File | Contents |
|------|----------|
| `spec/product-definition.md` | What, who, why |
| `spec/core-requirements.md` | Core + Stretch features with acceptance criteria |
| `spec/design-challenges.md` | 3 features the developer designs |
| `spec/technical-requirements.md` | Database, auth, deployment, performance |
| `spec/differentiators.md` | 6 optional enhancements (pick 1-2) |
| `guidance/brand-kit.md` | Colors, type, spacing, icons, mood, design inspiration |
| `guidance/patterns.md` | UI/UX do's and don'ts |
| `guidance/accessibility.md` | WCAG 2.1 AA checklist |
| `starter/tokens.css` | CSS custom properties |
| `starter/tailwind.css` | Tailwind v4 config |
| `data/` | Sample feeds (JSON + OPML) + edge case docs |

The 19 curated feeds and their edge cases (`data/`) are the fixed test corpus — do not hardcode source URLs elsewhere or invent new ones. Seed the guest experience from `data/sample-feeds.json`; test OPML import with `data/sample-feeds.opml`.

---

# 9. Collaboration & standards

- **Specified (Core/Stretch) features** → implement efficiently to spec.
- **Design-it-yourself features** → ask clarifying questions before building.
- **Brand kit** → `guidance/brand-kit.md` tokens are the design source of truth.
- **Accessibility** is a requirement, not a follow-up — meet the WCAG 2.1 AA checklist in `guidance/accessibility.md` (semantic HTML, keyboard nav, visible focus, never color alone). Performance targets and Lighthouse benchmarks live in `spec/technical-requirements.md`.

Encourage documenting significant design and product choices in the README. Aim for accessible, semantic, responsive-first code with clean component boundaries and small, typed functions. Avoid `any`, unrelated refactors, long route handlers, mixed UI/business logic, and unrequested features.
