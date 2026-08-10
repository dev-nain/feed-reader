# Welcome to React Router!

A modern, production-ready template for building full-stack React applications using React Router.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/remix-run/react-router-templates/tree/main/default)

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

## Design decisions

Product and data-model choices that the code cannot explain on its own. The
schema lives in `supabase/migrations/`; `docs/schema.dbml` and `docs/schema.mmd`
render it.

### Unsubscribing clears read state but keeps saved articles

Removing a feed deletes this user's read markers for that feed's items and
keeps anything they starred. Resubscribing therefore presents the feed as
entirely unread.

The alternative — preserving read markers forever — means unsubscribing and
resubscribing is indistinguishable from never having left, and the read table
accumulates rows for feeds the user has abandoned. Saved articles are treated
as a reading list rather than a subscription artifact, so they survive
independently: an article you saved is yours whether or not you still follow
where it came from.

### "Mark all as read" is a watermark on when we fetched, not when it was published

Marking a feed, category, or the whole river as read writes a single timestamp
per subscription rather than one row per article. An item counts as read when
it was **first seen** before that timestamp.

Comparing against the publish date instead looks equivalent and is not. Feeds
are fetched on a 15–60 minute cron, so publication always precedes fetch, and
aggregator and Medium-hosted feeds routinely backdate. A publish-date watermark
would mark a newly arrived, backdated article as already read, and the user
would never see it.

### Guests read the catalog; nobody writes it but the server

Feeds and articles are one shared, deduplicated catalog that no user owns, with
a per-user overlay for subscriptions, categories, read state and saves. One
fetch of CSS-Tricks serves every subscriber, and a guest browsing the 19 curated
feeds reads the same rows while writing nothing — which is what makes guest mode
session-scoped by construction rather than by convention.

Feed fetching and the retention sweep run as the service role, which holds
write access to the catalog and read access to nothing but the two queries it
needs. Per-user tables are written only by the user's own session, under RLS.

### Reading feed metadata requires naming your columns

`feeds` carries fetch bookkeeping — etags, error text, the cron schedule — that
no browser needs, so `anon` and `authenticated` hold column-level grants
covering the catalog fields only. A consequence worth knowing before you hit it:
`select *` on `feeds` fails with `42501`, and supabase-js `.select()` with no
argument means `select *`. Name the columns.

### The reader view is all Inter, sized like a UI not like a magazine

The article is set entirely in **Inter** — no serif anywhere, and `--font-serif`
is no longer mapped into the Tailwind theme. This departs from
`guidance/brand-kit.md`, which reserves Georgia for "article content / reader
view".

The sizing follows a working reader (Feeder) rather than a print analogy: title
30px/1.3 bold and flat across breakpoints, body at **16px on 1.55** — plain
`--text-base` — with paragraphs separated by ~1.2em of space. Long-form
legibility comes from leading and rhythm, not from a larger face; scaling body
copy up to 19px serif made the column feel like a different product from the
feed list sitting beside it in split view.

The body is also styled without `@tailwindcss/typography`. The plugin's
`em`-based cascade is sized against its own scale, not the kit's: at `prose-lg`
an in-body `h2` computed to 30px while the page title was 31px, so the hierarchy
collapsed, and neither 30px nor its 24px `h3` exists on the 1.25 scale. Because
article content is a closed `Block` union, every element is authored explicitly
anyway — so the blocks carry brand-scale classes directly and the plugin is
gone. The column is capped at `68ch`, which tracks the font size instead of
fighting it.

### The article page shows no AI summary

An earlier iteration carried a mock "AI Summary" panel and a "Source Details"
card in a rail beside the text. Both are removed: AI summarization is a
differentiator that has not been picked yet (`spec/differentiators.md` §1), and
a placeholder for it sat between the reader and the article. Source, author and
publication date remain in the article header. Category is currently shown only
on feed rows in the list, not on the detail page.

---

Built with ❤️ using React Router.
