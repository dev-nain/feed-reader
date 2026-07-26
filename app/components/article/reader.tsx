import { motion } from "framer-motion";
import { ExternalLink, ImageIcon, Sparkles } from "lucide-react";
import { Link } from "react-router";
import { SourceMark } from "~/components/shared";
import { Badge } from "~/components/ui/badge";
import {
	aiSummary,
	articleBody,
	type Block,
	categoryStyles,
	type FeedItem,
	type relatedItems,
} from "~/lib/mock-feed";
import { listItem } from "~/lib/motion";
import { cn } from "~/lib/utils";

/** Reading measure; page gutters live on the route's grid wrapper. */
const COLUMN = "mx-auto w-full max-w-content";

/** Renders `backtick` spans as inline code; everything else stays plain text. */
function withInlineCode(text: string) {
	return text.split(/`([^`]+)`/).map((part, i) =>
		i % 2 === 1 ? (
			// biome-ignore lint/suspicious/noArrayIndexKey: split output is positional
			<code key={i}>{part}</code>
		) : (
			part
		),
	);
}

function BlockContent({ block }: { block: Block }) {
	switch (block.type) {
		case "h2":
			return <h2>{block.text}</h2>;
		case "h3":
			return <h3>{block.text}</h3>;
		case "p":
			return <p>{withInlineCode(block.text)}</p>;
		case "quote":
			return (
				<blockquote>
					<p>{block.text}</p>
				</blockquote>
			);
		case "code":
			return (
				<pre>
					<code>{block.text}</code>
				</pre>
			);
		// ponytail: placeholder tile — real feed images land with the parser.
		case "image":
			return (
				<figure>
					<div className="grid h-56 place-items-center rounded-lg border border-border bg-bg-secondary sm:h-72">
						<ImageIcon className="size-8 text-text-tertiary" aria-hidden />
					</div>
					<figcaption>{block.text}</figcaption>
				</figure>
			);
		case "ul":
			return (
				<ul>
					{block.items.map((li) => (
						<li key={li}>{withInlineCode(li)}</li>
					))}
				</ul>
			);
		case "ol":
			return (
				<ol>
					{block.items.map((li) => (
						<li key={li}>{withInlineCode(li)}</li>
					))}
				</ol>
			);
	}
}

export function ArticleHeader({ item }: { item: FeedItem }) {
	const badge = categoryStyles[item.category]?.badge;
	return (
		<header className={cn(COLUMN, "border-b border-border-subtle pb-6 pt-10")}>
			<span
				className={cn(
					"inline-flex w-fit items-center rounded-sm px-2 py-0.5 text-xs font-medium",
					badge,
				)}
			>
				{item.category}
			</span>

			<h1 className="mt-3 text-2xl font-bold tracking-tight text-balance text-text-primary sm:text-3xl">
				{item.title}
			</h1>

			<div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-text-secondary">
				<SourceMark name={item.source} />
				<span className="font-medium text-text-primary">{item.source}</span>
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
		<motion.div
			variants={listItem}
			initial="hidden"
			animate="show"
			className={cn(COLUMN, "py-8")}
		>
			<div
				className={cn(
					"prose prose-lg dark:prose-invert max-w-none",
					"prose-headings:font-sans prose-headings:text-text-primary",
					"prose-p:font-serif prose-p:text-text-secondary prose-li:font-serif prose-li:text-text-secondary",
					"prose-a:text-accent prose-strong:text-text-primary",
					"prose-code:font-mono prose-code:text-text-primary",
					"prose-pre:border prose-pre:border-border prose-pre:bg-bg-secondary prose-pre:text-text-primary",
					"prose-blockquote:border-l-accent prose-blockquote:font-serif prose-blockquote:text-text-primary",
					"prose-figcaption:text-text-tertiary prose-img:rounded-lg",
				)}
			>
				{articleBody(item).map((block, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: static mock body, stable order
					<BlockContent key={i} block={block} />
				))}
			</div>

			<p className="mt-10 border-t border-border-subtle pt-6 text-sm text-text-secondary">
				<a
					href="https://example.com/article"
					target="_blank"
					rel="noreferrer noopener"
					className="inline-flex items-center gap-1.5 rounded-sm text-accent underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent"
				>
					Read the full article at {item.source}
					<ExternalLink className="size-4" aria-hidden />
					<span className="sr-only">(opens in a new tab)</span>
				</a>
			</p>
		</motion.div>
	);
}

const PANEL = "rounded-lg border border-border bg-bg-secondary p-4";

/** Context rail: AI summary + source facts. Sticks beside the article on wide screens. */
export function ArticleAside({ item }: { item: FeedItem }) {
	return (
		<aside
			aria-label="Article context"
			className="mt-8 space-y-4 self-start xl:sticky xl:top-6 xl:mt-10"
		>
			<section className={PANEL} aria-labelledby="ai-summary-heading">
				<div className="flex items-center gap-2">
					<Sparkles className="size-4 text-accent" aria-hidden />
					<h2
						id="ai-summary-heading"
						className="text-sm font-semibold text-text-primary"
					>
						AI Summary
					</h2>
					<Badge variant="accent" className="ml-auto">
						Beta
					</Badge>
				</div>

				<div className="mt-3 space-y-2 text-sm text-text-secondary">
					{aiSummary(item).map((paragraph) => (
						<p key={paragraph}>{paragraph}</p>
					))}
				</div>

				<p className="mt-3 border-t border-border-subtle pt-3 text-xs text-text-tertiary">
					Generated summary — may contain errors. Read the article for detail.
				</p>
			</section>

			<section className={PANEL} aria-labelledby="source-details-heading">
				<h2
					id="source-details-heading"
					className="text-sm font-semibold text-text-primary"
				>
					Source Details
				</h2>

				<div className="mt-3 flex items-center gap-2">
					<SourceMark name={item.source} />
					<span className="truncate text-sm font-medium text-text-primary">
						{item.source}
					</span>
				</div>

				<dl className="mt-3 space-y-2.5">
					{[
						{ term: "Author", value: item.author },
						{ term: "Published", value: item.time },
						{ term: "Category", value: item.category },
					].map(({ term, value }) => (
						<div key={term}>
							<dt className="text-xs uppercase tracking-wide text-text-tertiary">
								{term}
							</dt>
							<dd className="text-sm text-text-primary">{value}</dd>
						</div>
					))}
				</dl>

				<a
					href="https://example.com"
					target="_blank"
					rel="noreferrer noopener"
					className="mt-4 inline-flex items-center gap-1.5 rounded-sm text-sm text-accent underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent"
				>
					Visit {item.source}
					<ExternalLink className="size-4" aria-hidden />
					<span className="sr-only">(opens in a new tab)</span>
				</a>
			</section>
		</aside>
	);
}

/** Further reading — same source where possible, otherwise same category. */
export function MoreFromSource({
	related,
}: {
	related: ReturnType<typeof relatedItems>;
}) {
	if (related.items.length === 0) return null;
	return (
		<section
			aria-labelledby="related-heading"
			className={cn(COLUMN, "border-t border-border-subtle pt-6")}
		>
			<h2
				id="related-heading"
				className="text-lg font-semibold text-text-primary"
			>
				{related.label}
			</h2>

			<div className="mt-2">
				{related.items.map((item) => (
					<Link
						key={item.id}
						to={`/article/${item.id}`}
						className="flex items-center gap-3 rounded-lg p-3 outline-none transition-colors hover:bg-bg-secondary focus-visible:ring-2 focus-visible:ring-accent"
					>
						<SourceMark name={item.source} />
						<span className="line-clamp-2 min-w-0 flex-1 text-sm font-medium text-text-primary">
							{item.title}
						</span>
						<time
							dateTime={item.iso}
							className="shrink-0 text-xs text-text-tertiary"
						>
							{item.relative}
						</time>
					</Link>
				))}
			</div>
		</section>
	);
}
