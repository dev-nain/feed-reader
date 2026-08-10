/*
 * The 19 curated feeds that back Discover and the guest experience.
 *
 * Transcribed from `data/sample-feeds.json` rather than imported: `/data/` is
 * gitignored, so a fresh `npm ci` checkout (CI, deploy) has no such file.
 * The two `edgeCases` entries there — a dead URL and a duplicate Simon Willison
 * feed — are deliberately excluded; they exist to exercise error handling and
 * import dedupe, not to appear in a curated catalogue.
 */

export type FeedFormat = "rss2" | "atom";

export interface CatalogFeed {
	id: string;
	title: string;
	feedUrl: string;
	siteUrl: string;
	/** `siteUrl` hostname without `www.` — the second line of a catalogue row. */
	domain: string;
	format: FeedFormat;
}

export interface CatalogCategory {
	/** Matches a key of `categoryStyles` in `mock-feed.ts` for the accent. */
	name: string;
	slug: string;
	feeds: CatalogFeed[];
}

type RawFeed = Omit<CatalogFeed, "domain">;

const RAW: { name: string; slug: string; feeds: RawFeed[] }[] = [
	{
		name: "Frontend",
		slug: "frontend",
		feeds: [
			{
				id: "css-tricks",
				title: "CSS-Tricks",
				feedUrl: "https://css-tricks.com/feed/",
				siteUrl: "https://css-tricks.com/",
				format: "rss2",
			},
			{
				id: "smashing-magazine",
				title: "Smashing Magazine",
				feedUrl: "https://www.smashingmagazine.com/feed/",
				siteUrl: "https://www.smashingmagazine.com/",
				format: "rss2",
			},
			{
				id: "josh-w-comeau",
				title: "Josh W. Comeau",
				feedUrl: "https://www.joshwcomeau.com/rss.xml",
				siteUrl: "https://www.joshwcomeau.com/",
				format: "rss2",
			},
			{
				id: "kent-c-dodds",
				title: "Kent C. Dodds",
				feedUrl: "https://kentcdodds.com/blog/rss.xml",
				siteUrl: "https://kentcdodds.com/",
				format: "rss2",
			},
			{
				id: "web-dev",
				title: "web.dev",
				feedUrl: "https://web.dev/feed.xml",
				siteUrl: "https://web.dev/",
				format: "atom",
			},
			{
				id: "mdn-blog",
				title: "MDN Blog",
				feedUrl: "https://developer.mozilla.org/en-US/blog/rss.xml",
				siteUrl: "https://developer.mozilla.org/en-US/blog/",
				format: "rss2",
			},
		],
	},
	{
		name: "Design",
		slug: "design",
		feeds: [
			{
				id: "sidebar",
				title: "Sidebar.io",
				feedUrl: "https://sidebar.io/feed.xml",
				siteUrl: "https://sidebar.io/",
				format: "atom",
			},
			{
				id: "nielsen-norman-group",
				title: "Nielsen Norman Group",
				feedUrl: "https://www.nngroup.com/feed/rss/",
				siteUrl: "https://www.nngroup.com/",
				format: "rss2",
			},
			{
				id: "figma-blog",
				title: "Figma Blog",
				feedUrl: "https://www.figma.com/blog/feed/",
				siteUrl: "https://www.figma.com/blog/",
				format: "rss2",
			},
			{
				id: "a-list-apart",
				title: "A List Apart",
				feedUrl: "https://alistapart.com/main/feed/",
				siteUrl: "https://alistapart.com/",
				format: "rss2",
			},
			{
				id: "ux-collective",
				title: "UX Collective",
				feedUrl: "https://uxdesign.cc/feed",
				siteUrl: "https://uxdesign.cc/",
				format: "rss2",
			},
		],
	},
	{
		name: "Backend & DevOps",
		slug: "backend-devops",
		feeds: [
			{
				id: "cloudflare-blog",
				title: "Cloudflare Blog",
				feedUrl: "https://blog.cloudflare.com/rss/",
				siteUrl: "https://blog.cloudflare.com/",
				format: "rss2",
			},
			{
				id: "vercel-blog",
				title: "Vercel Blog",
				feedUrl: "https://vercel.com/atom",
				siteUrl: "https://vercel.com/blog",
				format: "atom",
			},
			{
				id: "github-blog",
				title: "The GitHub Blog",
				feedUrl: "https://github.blog/feed/",
				siteUrl: "https://github.blog/",
				format: "rss2",
			},
			{
				id: "netlify-blog",
				title: "Netlify Blog",
				feedUrl: "https://www.netlify.com/blog/index.xml",
				siteUrl: "https://www.netlify.com/blog/",
				format: "rss2",
			},
		],
	},
	{
		name: "General Tech",
		slug: "general-tech",
		feeds: [
			{
				id: "pragmatic-engineer",
				title: "The Pragmatic Engineer",
				feedUrl: "https://blog.pragmaticengineer.com/rss/",
				siteUrl: "https://blog.pragmaticengineer.com/",
				format: "rss2",
			},
			{
				id: "hacker-news-best",
				title: "Hacker News Best",
				feedUrl: "https://hnrss.org/best",
				siteUrl: "https://news.ycombinator.com/best",
				format: "rss2",
			},
		],
	},
	{
		name: "AI & ML",
		slug: "ai-ml",
		feeds: [
			{
				id: "simon-willison",
				title: "Simon Willison's Weblog",
				feedUrl: "https://simonwillison.net/atom/everything/",
				siteUrl: "https://simonwillison.net/",
				format: "atom",
			},
			{
				id: "hugging-face-blog",
				title: "Hugging Face Blog",
				feedUrl: "https://huggingface.co/blog/feed.xml",
				siteUrl: "https://huggingface.co/blog",
				format: "atom",
			},
		],
	},
];

const WWW = /^www\./;

function domainOf(siteUrl: string): string {
	return new URL(siteUrl).hostname.replace(WWW, "");
}

/* Derived once at module scope — this is static data, not per-request work. */

export const catalogCategories: CatalogCategory[] = RAW.map((category) => ({
	name: category.name,
	slug: category.slug,
	feeds: category.feeds.map((feed) => ({
		...feed,
		domain: domainOf(feed.siteUrl),
	})),
}));

export const allCatalogFeeds: CatalogFeed[] = catalogCategories.flatMap(
	(category) => category.feeds,
);

export const catalogTotal = allCatalogFeeds.length;

const BY_SLUG = new Map(
	catalogCategories.map((category) => [category.slug, category]),
);

export function findCatalogCategory(
	slug: string | undefined,
): CatalogCategory | undefined {
	return slug ? BY_SLUG.get(slug) : undefined;
}

/** Case-insensitive match on title or domain. Blank query matches nothing. */
export function searchCatalog(query: string): CatalogFeed[] {
	const term = query.trim().toLowerCase();
	if (!term) return [];
	return allCatalogFeeds.filter(
		(feed) =>
			feed.title.toLowerCase().includes(term) || feed.domain.includes(term),
	);
}

const ADDRESS = /^(https?:\/\/|[\w-]+\.[a-z]{2,})/i;

/** Whether the query reads as a URL, so we can offer the direct-add path. */
export function looksLikeAddress(query: string): boolean {
	return ADDRESS.test(query.trim());
}
