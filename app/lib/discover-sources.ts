import {
	AtSign,
	Bell,
	Download,
	type LucideIcon,
	Mail,
	MessageCircle,
	Newspaper,
	Play,
	Rss,
	Send,
} from "lucide-react";

/*
 * The Discover hub's tile sections, and the URL builders behind the social and
 * web-monitoring ones.
 *
 * Reddit, YouTube, Mastodon and Google News all publish RSS — these are not a
 * second source type, just addresses the user would otherwise have to know how
 * to construct. Telegram publishes none, so it stays a signpost.
 */

export interface SourceTile {
	id: string;
	label: string;
	icon: LucideIcon;
	/** Icon-square classes. Literal strings so Tailwind scans them. */
	iconClassName: string;
	/** Omitted when the tile is a signpost. */
	to?: string;
	soon?: boolean;
}

export const feedTiles: SourceTile[] = [
	{
		id: "rss",
		label: "Web and RSS",
		icon: Rss,
		iconClassName: "bg-accent-subtle text-accent",
		to: "/discover/rss",
	},
	{
		// Differentiator #3 (Newsletter Email Integration) — not selected.
		id: "newsletters",
		label: "Newsletters",
		icon: Mail,
		iconClassName: "bg-emerald-500/10 text-emerald-500",
		soon: true,
	},
	{
		// Stretch #15 (OPML) — its real home is Library › Import & Export.
		id: "import",
		label: "Import from file",
		icon: Download,
		iconClassName: "bg-amber-500/10 text-amber-500",
		soon: true,
	},
];

export const socialTiles: SourceTile[] = [
	{
		id: "mastodon",
		label: "Mastodon",
		icon: AtSign,
		iconClassName: "bg-violet-500/10 text-violet-500",
		to: "/discover/source/mastodon",
	},
	{
		id: "reddit",
		label: "Reddit",
		icon: MessageCircle,
		iconClassName: "bg-orange-500/10 text-orange-500",
		to: "/discover/source/reddit",
	},
	{
		// lucide v1 dropped brand glyphs — `Play` stands in for the YouTube mark.
		id: "youtube",
		label: "YouTube",
		icon: Play,
		iconClassName: "bg-red-500/10 text-red-500",
		to: "/discover/source/youtube",
	},
	{
		// Telegram publishes no RSS, so there is nothing to build.
		id: "telegram",
		label: "Telegram",
		icon: Send,
		iconClassName: "bg-sky-500/10 text-sky-500",
		soon: true,
	},
];

export const monitoringTiles: SourceTile[] = [
	{
		id: "google-alerts",
		label: "Google Alerts",
		icon: Bell,
		iconClassName: "bg-amber-500/10 text-amber-500",
		to: "/discover/source/google-alerts",
	},
	{
		id: "google-news",
		label: "Google News",
		icon: Newspaper,
		iconClassName: "bg-emerald-500/10 text-emerald-500",
		to: "/discover/source/google-news",
	},
];

export interface SourceBuilder {
	kind: string;
	label: string;
	inputLabel: string;
	placeholder: string;
	hint?: string;
	/** The feed URL, or null when the value is empty or unusable. */
	build?: (value: string) => string | null;
	/** Set instead of `build` for sources with no template. */
	external?: { href: string; cta: string };
}

/** A usable path segment: no separators, no whitespace. */
const INVALID_SEGMENT = /[\s/\\?#]/;
const LEADING_AT = /^@/;
/** YouTube channel IDs are always `UC` + an opaque token — handles are not. */
const CHANNEL_ID = /^UC[\w-]+$/;

export const sourceBuilders: SourceBuilder[] = [
	{
		kind: "mastodon",
		label: "Mastodon",
		inputLabel: "Account",
		placeholder: "simon@fedi.example",
		hint: "The full handle — username and instance — without the leading @.",
		build(value) {
			const parts = value.trim().replace(LEADING_AT, "").split("@");
			if (parts.length !== 2) return null;
			const [user, instance] = parts;
			if (!user || !instance) return null;
			if (INVALID_SEGMENT.test(user) || INVALID_SEGMENT.test(instance))
				return null;
			return `https://${encodeURIComponent(instance)}/@${encodeURIComponent(user)}.rss`;
		},
	},
	{
		kind: "reddit",
		label: "Reddit",
		inputLabel: "Subreddit",
		placeholder: "webdev",
		hint: "Just the name — no r/ prefix, no full URL.",
		build(value) {
			const name = value.trim();
			if (!name || INVALID_SEGMENT.test(name)) return null;
			return `https://www.reddit.com/r/${encodeURIComponent(name)}/.rss`;
		},
	},
	{
		kind: "youtube",
		label: "YouTube",
		inputLabel: "Channel ID",
		placeholder: "UCsBjURrPoezykLs9EqgamOA",
		hint: "The channel ID starts with UC — find it in the channel page's source. Handles like @name will not work.",
		build(value) {
			const id = value.trim();
			// Refuse handles outright rather than building an address that 404s.
			if (!CHANNEL_ID.test(id)) return null;
			return `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(id)}`;
		},
	},
	{
		kind: "google-news",
		label: "Google News",
		inputLabel: "Search terms",
		placeholder: "react performance",
		hint: "Any query you would type into Google News.",
		build(value) {
			const query = value.trim();
			if (!query) return null;
			return `https://news.google.com/rss/search?q=${encodeURIComponent(query)}`;
		},
	},
	{
		kind: "google-alerts",
		label: "Google Alerts",
		inputLabel: "Alert",
		placeholder: "",
		hint: 'Create the alert, set "Deliver to" to RSS feed, then paste the address into Web and RSS.',
		external: {
			href: "https://www.google.com/alerts",
			cta: "Create an alert on Google",
		},
	},
];

const BY_KIND = new Map(
	sourceBuilders.map((builder) => [builder.kind, builder]),
);

export function findSourceBuilder(
	kind: string | undefined,
): SourceBuilder | undefined {
	return kind ? BY_KIND.get(kind) : undefined;
}
