import { motion } from "framer-motion";
import {
	ArrowLeft,
	ChevronLeft,
	ChevronRight,
	ExternalLink,
	ImageIcon,
} from "lucide-react";
import { Link } from "react-router";
import { ItemActions, SourceMark, WithTooltip } from "~/components/shared";
import {
	type adjacentItems,
	articleBody,
	type Block,
	type FeedItem,
} from "~/lib/mock-feed";
import { listItem } from "~/lib/motion";
import { cn } from "~/lib/utils";

type Adjacent = ReturnType<typeof adjacentItems>;

/** Reading measure; page gutters live on the route's column wrapper. */
const COLUMN = "mx-auto w-full max-w-content";

/**
 * Body copy is --text-base: 16px on 1.55. Paragraphs are separated by ~1.2em of
 * space rather than a larger size — the reference reader carries long-form at UI
 * size and buys legibility with leading and rhythm instead.
 */
const BODY = "text-base text-text-primary";

/** Renders `backtick` spans as inline code; everything else stays plain text. */
function withInlineCode(text: string) {
	return text.split(/`([^`]+)`/).map((part, i) =>
		i % 2 === 1 ? (
			<code
				// biome-ignore lint/suspicious/noArrayIndexKey: split output is positional
				key={i}
				className="rounded-[5px] bg-bg-tertiary px-[5px] py-px font-mono text-[0.9em]"
			>
				{part}
			</code>
		) : (
			part
		),
	);
}

/**
 * Block styles are written directly rather than via a prose plugin: the Block
 * union is closed, so every element here is authored anyway, and the plugin's
 * em-cascade pushed headings off the brand scale (h2 landed at 30px, a hair
 * under the 31px title).
 */
function BlockContent({ block }: { block: Block }) {
	switch (block.type) {
		case "h2":
			return (
				<h2 className="mt-8 mb-3 text-xl font-bold leading-snug text-text-primary text-balance">
					{block.text}
				</h2>
			);
		case "h3":
			return (
				<h3 className="mt-6 mb-2 text-lg font-bold leading-normal text-text-primary text-balance">
					{block.text}
				</h3>
			);
		case "p":
			return <p className={cn("my-5", BODY)}>{withInlineCode(block.text)}</p>;
		case "quote":
			return (
				<blockquote className="my-5 border-l-[3px] border-border pl-3">
					<p className="text-base text-text-secondary">{block.text}</p>
				</blockquote>
			);
		case "code":
			return (
				<pre className="my-5 overflow-x-auto rounded-lg bg-bg-tertiary px-3 py-2.5">
					<code className="font-mono text-[0.9em] text-text-primary">
						{block.text}
					</code>
				</pre>
			);
		// ponytail: placeholder tile — real feed images land with the parser.
		case "image":
			return (
				<figure className="my-5">
					<div className="grid h-56 place-items-center rounded-lg border border-border bg-bg-secondary sm:h-72">
						<ImageIcon className="size-8 text-text-tertiary" aria-hidden />
					</div>
					<figcaption className="mt-2 text-sm text-text-tertiary">
						{block.text}
					</figcaption>
				</figure>
			);
		case "ul":
			return (
				<ul className="my-5 list-disc space-y-1 pl-6 marker:text-text-tertiary">
					{block.items.map((li) => (
						<li key={li} className={BODY}>
							{withInlineCode(li)}
						</li>
					))}
				</ul>
			);
		case "ol":
			return (
				<ol className="my-5 list-decimal space-y-1 pl-6 marker:text-text-tertiary">
					{block.items.map((li) => (
						<li key={li} className={BODY}>
							{withInlineCode(li)}
						</li>
					))}
				</ol>
			);
	}
}

/** Toolbar step button. Disabled as a real `<span>` — a dead link is not a link. */
function StepLink({
	to,
	label,
	title,
	icon: Icon,
}: {
	to: string | null;
	label: string;
	title: string | null;
	icon: typeof ArrowLeft;
}) {
	const shape =
		"grid size-8 place-items-center rounded-md outline-none transition-colors";

	if (!to) {
		return (
			<span
				aria-hidden
				className={cn(shape, "cursor-not-allowed text-text-tertiary/40")}
			>
				<Icon className="size-4" />
			</span>
		);
	}

	return (
		// The tooltip names the destination; the aria-label carries it for SR users.
		<WithTooltip label={title ? `${label}: ${title}` : label}>
			<Link
				to={to}
				aria-label={title ? `${label}: ${title}` : label}
				className={cn(
					shape,
					"text-text-secondary hover:bg-bg-tertiary hover:text-text-primary focus-visible:ring-2 focus-visible:ring-accent",
				)}
			>
				<Icon className="size-4" aria-hidden />
			</Link>
		</WithTooltip>
	);
}

/**
 * Pane chrome for the reading column. `h-14` matches the feed toolbar's first
 * row and the sidebar brand block, so both panes start their content on the
 * same line. Sticky rather than a sibling of the scroller: this pane scrolls as
 * a whole, since the toolbar needs the item the route loaded.
 */
export function ArticleToolbar({
	item,
	adjacent,
}: {
	item: FeedItem;
	adjacent: Adjacent;
}) {
	return (
		<div className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-bg-primary px-4 sm:px-6">
			{/* Only route back to the list where the list is not already beside us. */}
			<Link
				to="/"
				className="inline-flex items-center gap-1.5 rounded-md text-sm text-text-secondary outline-none transition-colors hover:text-text-primary focus-visible:ring-2 focus-visible:ring-accent xl:hidden"
			>
				<ArrowLeft className="size-4" aria-hidden />
				Back to list
			</Link>

			<nav
				aria-label="Article navigation"
				className="ml-auto flex items-center gap-1"
			>
				<StepLink
					to={adjacent.prev ? `/article/${adjacent.prev.id}` : null}
					label="Previous article"
					title={adjacent.prev?.title ?? null}
					icon={ChevronLeft}
				/>
				<StepLink
					to={adjacent.next ? `/article/${adjacent.next.id}` : null}
					label="Next article"
					title={adjacent.next?.title ?? null}
					icon={ChevronRight}
				/>
			</nav>

			<div className="h-5 w-px shrink-0 bg-border" aria-hidden />

			<div className="flex items-center gap-1">
				<ItemActions
					title={item.title}
					buttonClassName="size-8 text-text-secondary hover:bg-bg-tertiary hover:text-text-primary [&_svg]:size-4"
				/>
				<WithTooltip label="Open original">
					<a
						href="https://example.com/article"
						target="_blank"
						rel="noreferrer noopener"
						aria-label="Open original article in a new tab"
						className="grid size-8 place-items-center rounded-md text-text-secondary outline-none transition-colors hover:bg-bg-tertiary hover:text-text-primary focus-visible:ring-2 focus-visible:ring-accent"
					>
						<ExternalLink className="size-4" aria-hidden />
					</a>
				</WithTooltip>
			</div>
		</div>
	);
}

export function ArticleHeader({ item }: { item: FeedItem }) {
	return (
		<header className={cn(COLUMN, "border-b border-border-subtle pt-10 pb-8")}>
			{/* ponytail: mock items carry no link yet — swap for item.url with the parser. */}
			{/* 30px/1.3 bold, held flat across breakpoints — the reference title
			    does not scale up on wide screens, it just gets more margin. */}
			<h1 className="text-2xl font-bold leading-snug text-balance text-text-primary">
				<a
					href="https://example.com/article"
					target="_blank"
					rel="noreferrer noopener"
					className="rounded-md outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent"
				>
					{item.title}
					<span className="sr-only"> (opens the original in a new tab)</span>
				</a>
			</h1>

			<div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-2 text-sm text-text-secondary">
				<SourceMark name={item.source} tone="color" />
				<span className="font-semibold text-text-primary">{item.source}</span>
				<span className="text-text-tertiary">·</span>
				<span>{item.author}</span>
				<span className="text-text-tertiary">·</span>
				<time dateTime={item.iso} className="text-text-tertiary">
					{item.time}
				</time>
			</div>
		</header>
	);
}

export function ArticleBody({ item }: { item: FeedItem }) {
	return (
		<motion.div variants={listItem} initial="hidden" animate="show">
			{/* Measure in ch, so it tracks the body size rather than fighting it. */}
			<div className="mx-auto max-w-[68ch] py-10">
				{articleBody(item).map((block, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: static mock body, stable order
					<BlockContent key={i} block={block} />
				))}
			</div>

			<p
				className={cn(
					COLUMN,
					"mt-12 border-t border-border-subtle pt-8 text-sm text-text-secondary",
				)}
			>
				<a
					href="https://example.com/article"
					target="_blank"
					rel="noreferrer noopener"
					className="inline-flex items-center gap-1.5 rounded-sm text-accent underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-accent"
				>
					Read the full article at {item.source}
					<ExternalLink className="size-4" aria-hidden />
					<span className="sr-only">(opens in a new tab)</span>
				</a>
			</p>
		</motion.div>
	);
}

/** One end of the footer pager: direction label over the destination title. */
function PagerCard({
	item,
	direction,
}: {
	item: FeedItem;
	direction: "prev" | "next";
}) {
	const next = direction === "next";
	return (
		<Link
			to={`/article/${item.id}`}
			className={cn(
				"group flex min-w-0 flex-1 items-center gap-3 rounded-lg border border-border p-4 outline-none transition-colors hover:bg-bg-secondary focus-visible:ring-2 focus-visible:ring-accent",
				next && "flex-row-reverse text-right",
			)}
		>
			{next ? (
				<ChevronRight
					className="size-4 shrink-0 text-text-tertiary transition-colors group-hover:text-text-primary"
					aria-hidden
				/>
			) : (
				<ChevronLeft
					className="size-4 shrink-0 text-text-tertiary transition-colors group-hover:text-text-primary"
					aria-hidden
				/>
			)}

			<span className="min-w-0">
				<span className="block text-xs uppercase tracking-wide text-text-tertiary">
					{next ? "Next" : "Previous"}
				</span>
				<span className="mt-0.5 line-clamp-2 block text-sm font-medium text-text-primary">
					{item.title}
				</span>
			</span>
		</Link>
	);
}

/**
 * End-of-article pager. Mirrors the toolbar's steps so finishing a piece leads
 * straight into the next one, without scrolling back up.
 */
export function ArticlePager({ adjacent }: { adjacent: Adjacent }) {
	if (!adjacent.prev && !adjacent.next) return null;
	return (
		// Distinct from the toolbar's nav — two landmarks sharing one name is
		// indistinguishable in a screen reader's landmark list.
		<nav
			aria-label="Continue reading"
			className={cn(
				COLUMN,
				"mt-12 flex flex-col gap-3 border-t border-border-subtle pt-8 sm:flex-row",
			)}
		>
			{adjacent.prev && <PagerCard item={adjacent.prev} direction="prev" />}
			{/* Keeps a lone "next" card on the right where the reader expects it. */}
			{!adjacent.prev && <div className="hidden flex-1 sm:block" />}
			{adjacent.next && <PagerCard item={adjacent.next} direction="next" />}
		</nav>
	);
}
