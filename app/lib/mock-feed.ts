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
	category: string;
	/** Relative label shown in the row; `time` is the full date for the tooltip. */
	relative: string;
	time: string;
	excerpt: string;
	read: boolean;
	/** Date-group heading the item sits under. */
	group: string;
}

/** Per-category accent: sidebar dot + item badge. Literal strings so Tailwind scans them. */
export const categoryStyles: Record<string, { dot: string; badge: string }> = {
	Frontend: {
		dot: "bg-blue-500",
		badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
	},
	Design: {
		dot: "bg-rose-500",
		badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
	},
	"Backend & DevOps": {
		dot: "bg-amber-500",
		badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
	},
	"General Tech": {
		dot: "bg-violet-500",
		badge: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
	},
	"AI & ML": {
		dot: "bg-purple-500",
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

export function sourceColor(name: string): string {
	let hash = 0;
	for (let i = 0; i < name.length; i++)
		hash = (hash + name.charCodeAt(i)) % 997;
	return SOURCE_COLORS[hash % SOURCE_COLORS.length];
}

export const categories: Category[] = [
	{
		name: "Frontend",
		unread: 14,
		expanded: true,
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
		expanded: true,
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

export const unreadTotal = categories.reduce((sum, c) => sum + c.unread, 0);
export const savedCount = 12;

export const feedItems: FeedItem[] = [
	{
		id: "1",
		title: "Practical Guide To Designing For Colorblind Users",
		source: "Smashing Magazine",
		category: "Design",
		relative: "2h ago",
		time: "Jul 24, 2026, 9:14 AM",
		excerpt:
			"Color blindness affects roughly 8% of men and 0.5% of women worldwide. Yet most interfaces rely heavily on color to convey meaning, status, and hierarchy. Here's how to design interfaces that work for everyone without sacrificing visual richness.",
		read: false,
		group: "Today",
	},
	{
		id: "2",
		title: "How We Reduced P99 Latency by 60% with Edge-First Caching",
		source: "Cloudflare Blog",
		category: "Backend & DevOps",
		relative: "3h ago",
		time: "Jul 24, 2026, 8:02 AM",
		excerpt:
			"Our engineering team spent the last quarter rethinking how we cache at the edge. The result: dramatically lower tail latency for our most demanding customers, and lessons applicable to any distributed system.",
		read: false,
		group: "Today",
	},
	{
		id: "3",
		title: "Building Effective RAG Systems: What Actually Works in Production",
		source: "Simon Willison",
		category: "AI & ML",
		relative: "4h ago",
		time: "Jul 24, 2026, 7:20 AM",
		excerpt:
			"After months of experimenting with retrieval-augmented generation in real applications, here's what I've learned about chunking strategies, embedding models, and the surprising importance of metadata filtering.",
		read: false,
		group: "Today",
	},
	{
		id: "4",
		title: "The Surprising Truth About CSS Container Queries",
		source: "Josh W. Comeau",
		category: "Frontend",
		relative: "5h ago",
		time: "Jul 24, 2026, 6:05 AM",
		excerpt:
			"Container queries have been available for a while now, but most developers are still using them like media queries with a different syntax. There's a much more powerful mental model that unlocks truly reusable components.",
		read: false,
		group: "Today",
	},
	{
		id: "5",
		title: "Introducing Variables 2.0: Design Tokens Meet Real Logic",
		source: "Figma Blog",
		category: "Design",
		relative: "6h ago",
		time: "Jul 24, 2026, 5:11 AM",
		excerpt:
			"Variables in Figma now support conditional logic, mathematical expressions, and cross-file references. This unlocks design system workflows that were previously only possible in code.",
		read: false,
		group: "Today",
	},
	{
		id: "6",
		title: "Shipping Faster with Preview Deployments per Pull Request",
		source: "Vercel Blog",
		category: "Backend & DevOps",
		relative: "yesterday",
		time: "Jul 23, 2026, 11:05 AM",
		excerpt:
			"Give every reviewer a live URL and the review conversation changes entirely. A look at the infrastructure that makes ephemeral environments cheap enough to spin up on every commit.",
		read: true,
		group: "Yesterday",
	},
	{
		id: "7",
		title: "How We Cut Our Test Suite from 40 Minutes to 6",
		source: "The Pragmatic Engineer",
		category: "General Tech",
		relative: "yesterday",
		time: "Jul 23, 2026, 9:15 AM",
		excerpt:
			"Parallelism only got us halfway. The real wins came from deleting tests that asserted nothing and fixing the three that were secretly flaky the whole time.",
		read: true,
		group: "Yesterday",
	},
];
