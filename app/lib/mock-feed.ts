// ponytail: mock data, replace with a route loader when Content Browsing (Core #3) is wired.
// Static, developer-authored sample content so the dashboard UI can be built and
// reviewed before the database/parsing layers exist.

export interface Feed {
	id: string;
	title: string;
	unread: number;
}

export interface Category {
	name: string;
	unread: number;
	/** Whether the feed list under this category is shown (static in mock UI). */
	expanded: boolean;
	feeds: Feed[];
}

export interface FeedItem {
	id: string;
	title: string;
	source: string;
	author: string;
	category: string;
	/** Relative label shown in the row; `time` is the full date for the tooltip. */
	relative: string;
	time: string;
	/** Machine-readable publication date for <time dateTime>. */
	iso: string;
	excerpt: string;
	read: boolean;
	/** Saved to the Starred list. */
	starred: boolean;
	/** Date-group heading the item sits under. */
	group: string;
}

/** Per-category accent: sidebar dot + item badge. Literal strings so Tailwind scans them. */
export const categoryStyles: Record<
	string,
	{ dot: string; text: string; badge: string }
> = {
	Frontend: {
		dot: "bg-blue-500",
		text: "text-blue-500",
		badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
	},
	Design: {
		dot: "bg-rose-500",
		text: "text-rose-500",
		badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
	},
	"Backend & DevOps": {
		dot: "bg-amber-500",
		text: "text-amber-500",
		badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
	},
	"General Tech": {
		dot: "bg-violet-500",
		text: "text-violet-500",
		badge: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
	},
	"AI & ML": {
		dot: "bg-purple-500",
		text: "text-purple-500",
		badge: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
	},
};

/** Deterministic tile color for a source favicon stand-in (no network in mock UI). */
// ponytail: swap for real feed favicons once feeds carry icon URLs.
const SOURCE_COLORS = [
	"bg-red-500",
	"bg-orange-500",
	"bg-amber-500",
	"bg-emerald-500",
	"bg-teal-500",
	"bg-blue-500",
	"bg-indigo-500",
	"bg-violet-500",
	"bg-purple-500",
	"bg-pink-500",
];

function hash(name: string): number {
	let sum = 0;
	for (let i = 0; i < name.length; i++) sum = (sum + name.charCodeAt(i)) % 997;
	return sum;
}

export function sourceColor(name: string): string {
	return SOURCE_COLORS[hash(name) % SOURCE_COLORS.length];
}

export const categories: Category[] = [
	{
		name: "Frontend",
		unread: 14,
		expanded: false,
		feeds: [
			{ id: "css-tricks", title: "CSS-Tricks", unread: 3 },
			{ id: "smashing", title: "Smashing Magazine", unread: 4 },
			{ id: "joshwcomeau", title: "Josh W. Comeau", unread: 2 },
			{ id: "kentcdodds", title: "Kent C. Dodds", unread: 2 },
			{ id: "web-dev", title: "web.dev", unread: 3 },
		],
	},
	{
		name: "Design",
		unread: 11,
		expanded: false,
		feeds: [
			{ id: "sidebar", title: "Sidebar.io", unread: 5 },
			{ id: "nng", title: "NN Group", unread: 2 },
			{ id: "figma", title: "Figma Blog", unread: 2 },
			{ id: "ux-collective", title: "UX Collective", unread: 2 },
		],
	},
	{
		name: "Backend & DevOps",
		unread: 8,
		expanded: false,
		feeds: [
			{ id: "cloudflare", title: "Cloudflare Blog", unread: 6 },
			{ id: "vercel", title: "Vercel Blog", unread: 2 },
		],
	},
	{
		name: "General Tech",
		unread: 6,
		expanded: false,
		feeds: [
			{ id: "pragmatic", title: "The Pragmatic Engineer", unread: 1 },
			{ id: "hn-best", title: "Hacker News Best", unread: 5 },
		],
	},
	{
		name: "AI & ML",
		unread: 8,
		expanded: false,
		feeds: [
			{ id: "simonw", title: "Simon Willison", unread: 5 },
			{ id: "huggingface", title: "Hugging Face Blog", unread: 3 },
		],
	},
];

/*
 * Feeds filed in no category. They sit flat in the sidebar alongside the
 * category folders rather than inside an "Uncategorized" group of their own.
 */
export const uncategorized: Feed[] = [
	{ id: "mdn", title: "MDN Blog", unread: 2 },
	{ id: "alistapart", title: "A List Apart", unread: 1 },
	{ id: "github-blog", title: "The GitHub Blog", unread: 4 },
];

export const unreadTotal =
	categories.reduce((sum, c) => sum + c.unread, 0) +
	uncategorized.reduce((sum, feed) => sum + feed.unread, 0);

export const feedItems: FeedItem[] = [
	{
		id: "1",
		iso: "2026-07-24T09:14",
		title: "Practical Guide To Designing For Colorblind Users",
		source: "Smashing Magazine",
		author: "Elena Vasquez",
		category: "Design",
		relative: "2h ago",
		time: "Jul 24, 2026, 9:14 AM",
		excerpt:
			"Color blindness affects roughly 8% of men and 0.5% of women worldwide. Yet most interfaces rely heavily on color to convey meaning, status, and hierarchy. Here's how to design interfaces that work for everyone without sacrificing visual richness.",
		read: false,
		starred: false,
		group: "Today",
	},
	{
		id: "2",
		iso: "2026-07-24T08:02",
		title: "How We Reduced P99 Latency by 60% with Edge-First Caching",
		source: "Cloudflare Blog",
		author: "Marcus Chen",
		category: "Backend & DevOps",
		relative: "3h ago",
		time: "Jul 24, 2026, 8:02 AM",
		excerpt:
			"Our engineering team spent the last quarter rethinking how we cache at the edge. The result: dramatically lower tail latency for our most demanding customers, and lessons applicable to any distributed system.",
		read: false,
		starred: true,
		group: "Today",
	},
	{
		id: "3",
		iso: "2026-07-24T07:20",
		title: "Building Effective RAG Systems: What Actually Works in Production",
		source: "Simon Willison",
		author: "Simon Willison",
		category: "AI & ML",
		relative: "4h ago",
		time: "Jul 24, 2026, 7:20 AM",
		excerpt:
			"After months of experimenting with retrieval-augmented generation in real applications, here's what I've learned about chunking strategies, embedding models, and the surprising importance of metadata filtering.",
		read: false,
		starred: true,
		group: "Today",
	},
	{
		id: "4",
		iso: "2026-07-24T06:05",
		title: "The Surprising Truth About CSS Container Queries",
		source: "Josh W. Comeau",
		author: "Josh W. Comeau",
		category: "Frontend",
		relative: "5h ago",
		time: "Jul 24, 2026, 6:05 AM",
		excerpt:
			"Container queries have been available for a while now, but most developers are still using them like media queries with a different syntax. There's a much more powerful mental model that unlocks truly reusable components.",
		read: false,
		starred: false,
		group: "Today",
	},
	{
		id: "5",
		iso: "2026-07-24T05:11",
		title: "Introducing Variables 2.0: Design Tokens Meet Real Logic",
		source: "Figma Blog",
		author: "Priya Raman",
		category: "Design",
		relative: "6h ago",
		time: "Jul 24, 2026, 5:11 AM",
		excerpt:
			"Variables in Figma now support conditional logic, mathematical expressions, and cross-file references. This unlocks design system workflows that were previously only possible in code.",
		read: false,
		starred: false,
		group: "Today",
	},
	{
		id: "6",
		iso: "2026-07-23T11:05",
		title: "Shipping Faster with Preview Deployments per Pull Request",
		source: "Vercel Blog",
		author: "Tomás Oliveira",
		category: "Backend & DevOps",
		relative: "yesterday",
		time: "Jul 23, 2026, 11:05 AM",
		excerpt:
			"Give every reviewer a live URL and the review conversation changes entirely. A look at the infrastructure that makes ephemeral environments cheap enough to spin up on every commit.",
		read: true,
		starred: false,
		group: "Yesterday",
	},
	{
		id: "7",
		iso: "2026-07-23T09:15",
		title: "How We Cut Our Test Suite from 40 Minutes to 6",
		source: "The Pragmatic Engineer",
		author: "Gergely Orosz",
		category: "General Tech",
		relative: "yesterday",
		time: "Jul 23, 2026, 9:15 AM",
		excerpt:
			"Parallelism only got us halfway. The real wins came from deleting tests that asserted nothing and fixing the three that were secretly flaky the whole time.",
		read: true,
		starred: true,
		group: "Yesterday",
	},
	{
		id: "8",
		iso: "2026-07-22T14:40",
		title: "Designing Focus States People Actually Notice",
		source: "Smashing Magazine",
		author: "Elena Vasquez",
		category: "Design",
		relative: "3d ago",
		time: "Jul 22, 2026, 2:40 PM",
		excerpt:
			"The default focus ring is the most-removed accessibility feature on the web. Here is how to design one that fits your brand and still passes contrast requirements.",
		read: true,
		starred: true,
		group: "Earlier this week",
	},
	{
		id: "9",
		iso: "2026-07-22T10:05",
		title: "Structured Output Is the Feature That Made LLMs Useful",
		source: "Simon Willison",
		author: "Simon Willison",
		category: "AI & ML",
		relative: "3d ago",
		time: "Jul 22, 2026, 10:05 AM",
		excerpt:
			"Free-text responses are a parsing nightmare. Schema-constrained output turned a fun demo into something I am willing to put in a production pipeline.",
		read: true,
		starred: false,
		group: "Earlier this week",
	},
	{
		id: "10",
		iso: "2026-07-21T16:30",
		title: "An Interactive Guide to Flexbox Gaps",
		source: "Josh W. Comeau",
		author: "Josh W. Comeau",
		category: "Frontend",
		relative: "4d ago",
		time: "Jul 21, 2026, 4:30 PM",
		excerpt:
			"Gap looks simple until it meets wrapping, margins and nested flex containers. A visual walkthrough of the cases that trip people up.",
		read: true,
		starred: false,
		group: "Earlier this week",
	},
	{
		id: "11",
		iso: "2026-07-21T09:00",
		title: "Rate Limiting at the Edge Without a Central Store",
		source: "Cloudflare Blog",
		author: "Marcus Chen",
		category: "Backend & DevOps",
		relative: "4d ago",
		time: "Jul 21, 2026, 9:00 AM",
		excerpt:
			"Coordinating counters across hundreds of locations is expensive. Approximate counting gets you most of the protection for a fraction of the latency.",
		read: true,
		starred: false,
		group: "Earlier this week",
	},
];

/**
 * A block of article body content. Plain text only — never HTML — so the reader
 * view has no `dangerouslySetInnerHTML` and therefore no XSS surface.
 * Backticks inside `text` render as inline code.
 */
export type Block =
	| { type: "h2" | "h3" | "p" | "quote" | "code" | "image"; text: string }
	| { type: "ul" | "ol"; items: string[] };

// ponytail: one shared body for every mock article — the lead paragraph is the
// item's own excerpt. Replace wholesale with parsed feed content when Core #2 lands.
const SAMPLE_BODY: Block[] = [
	{
		type: "h2",
		text: "Why this keeps coming up",
	},
	{
		type: "p",
		text: "Every team hits this wall at roughly the same point: the prototype works, the demo lands, and then real traffic arrives. What follows is less a rewrite than a slow accumulation of small, boring corrections — the kind nobody writes conference talks about.",
	},
	{
		type: "image",
		text: "Diagram: request path before and after the change",
	},
	{
		type: "p",
		text: "The shape of the fix is usually visible in the first week. Acting on it takes three months, because the hard part is not the change itself but agreeing on which of the four plausible causes is the real one.",
	},
	{
		type: "h3",
		text: "What actually moved the numbers",
	},
	{
		type: "ul",
		items: [
			"Measuring the thing we cared about, rather than the thing that was easy to measure.",
			"Deleting two layers of indirection that existed for a use case we never shipped.",
			"Setting a budget and failing the build when it was exceeded.",
		],
	},
	{
		type: "p",
		text: "In code, the whole intervention came down to a single guard. We reached for `structuredClone` instead of the hand-rolled deep copy, and the allocation profile flattened out immediately.",
	},
	{
		type: "code",
		text: `function withBudget(fn, ms = 250) {\n  const started = performance.now();\n  const result = fn();\n  const spent = performance.now() - started;\n  if (spent > ms) console.warn(\`over budget: \${spent.toFixed(1)}ms\`);\n  return result;\n}`,
	},
	{
		type: "quote",
		text: "The best performance work looks like deletion. If your diff is mostly additions, you are probably treating a symptom.",
	},
	{
		type: "h3",
		text: "The order that worked",
	},
	{
		type: "ol",
		items: [
			"Reproduce it locally, with a script anyone on the team can run.",
			"Write down the number you expect before you change anything.",
			"Change one thing. Measure. Keep or revert — never both.",
		],
	},
	{
		type: "p",
		text: "None of this is novel, and that is rather the point. The teams that get out of this hole fastest are not the ones with the cleverest idea; they are the ones willing to do the unglamorous measurement first.",
	},
];

/** Body for one item: its excerpt as the lead, then the shared sample content. */
export function articleBody(item: FeedItem): Block[] {
	return [{ type: "p", text: item.excerpt }, ...SAMPLE_BODY];
}

export function findItem(id: string): FeedItem | undefined {
	return feedItems.find((item) => item.id === id);
}

/**
 * Further reading for the article footer: other items from the same source,
 * else others in the same category. Empty when the source has no siblings.
 */
export function relatedItems(item: FeedItem) {
	const others = feedItems.filter((other) => other.id !== item.id);
	const sameSource = others.filter((other) => other.source === item.source);
	if (sameSource.length > 0) {
		return { label: `More from ${item.source}`, items: sameSource.slice(0, 3) };
	}
	return {
		label: `Related in ${item.category}`,
		items: others
			.filter((other) => other.category === item.category)
			.slice(0, 3),
	};
}

export const starredCount = feedItems.filter((i) => i.starred).length;
