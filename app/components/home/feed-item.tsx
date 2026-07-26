import { motion } from "framer-motion";
import { Link } from "react-router";
import {
	ItemActions,
	REVEAL,
	SourceMark,
	Thumbnail,
	UnreadDot,
} from "~/components/shared";
import { categoryStyles, type FeedItem } from "~/lib/mock-feed";
import { listItem } from "~/lib/motion";
import { cn } from "~/lib/utils";

/** Full row with excerpt — the default reading layout. */
export function FeedItemRow({ item }: { item: FeedItem }) {
	const badge = categoryStyles[item.category]?.badge;
	return (
		<motion.article variants={listItem} className="group relative">
			<Link
				to={`/article/${item.id}`}
				className="flex items-start gap-3 rounded-lg px-4 py-4 pr-28 outline-none transition-colors hover:bg-bg-secondary focus-visible:ring-2 focus-visible:ring-accent sm:px-6"
			>
				<UnreadDot read={item.read} className="mt-1.5" />
				<div
					className={cn(
						"flex min-w-0 flex-1 flex-col gap-1",
						item.read && "opacity-60",
					)}
				>
					<div className="flex items-center gap-2 text-sm text-text-secondary">
						<SourceMark name={item.source} />
						<span className="font-medium text-text-primary">{item.source}</span>
						<span className="text-text-tertiary">·</span>
						<time className="text-text-tertiary" title={item.time}>
							{item.relative}
						</time>
						{!item.read && <span className="sr-only">unread</span>}
					</div>

					<h3
						className={cn(
							"text-lg text-text-primary",
							item.read ? "font-medium" : "font-semibold",
						)}
					>
						{item.title}
					</h3>

					<p className="line-clamp-2 text-sm text-text-secondary">
						{item.excerpt}
					</p>

					<span
						className={cn(
							"mt-1 inline-flex w-fit items-center rounded-sm px-2 py-0.5 text-xs font-medium",
							badge,
						)}
					>
						{item.category}
					</span>
				</div>
			</Link>

			<ItemActions
				title={item.title}
				className={cn("absolute right-4 top-4", REVEAL)}
			/>
		</motion.article>
	);
}

/** Bordered card for the grid layout. */
export function FeedItemCard({ item }: { item: FeedItem }) {
	const badge = categoryStyles[item.category]?.badge;
	return (
		<motion.article
			variants={listItem}
			whileHover={{ scale: 1.015 }}
			whileTap={{ scale: 0.99 }}
			className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-sm transition-colors hover:border-border-subtle hover:shadow-md"
		>
			<Link
				to={`/article/${item.id}`}
				className={cn(
					"flex flex-1 flex-col rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-accent",
					item.read && "opacity-70",
				)}
			>
				<div className="flex flex-1 flex-col gap-2 p-4">
					<div className="flex items-center gap-2 text-sm">
						<UnreadDot read={item.read} />
						<SourceMark name={item.source} className="size-4 text-[0.5rem]" />
						<span className="truncate font-medium text-text-primary">
							{item.source}
						</span>
						<time
							className="ml-auto shrink-0 text-xs text-text-tertiary"
							title={item.time}
						>
							{item.relative}
						</time>
						{!item.read && <span className="sr-only">unread</span>}
					</div>

					<h3
						className={cn(
							"text-base text-text-primary",
							item.read ? "font-medium" : "font-semibold",
						)}
					>
						{item.title}
					</h3>

					<p className="line-clamp-2 text-sm text-text-secondary">
						{item.excerpt}
					</p>

					<span
						className={cn(
							"mt-auto inline-flex w-fit items-center rounded-sm px-2 py-0.5 text-xs font-medium",
							badge,
						)}
					>
						{item.category}
					</span>
				</div>
			</Link>

			<ItemActions
				title={item.title}
				className={cn("absolute bottom-2 right-2", REVEAL)}
				buttonClassName="size-8 [&_svg]:size-4"
			/>
		</motion.article>
	);
}

/** Dense single-line row for the compact layout. */
export function FeedItemCompact({ item }: { item: FeedItem }) {
	return (
		<motion.article variants={listItem} className="group relative">
			<Link
				to={`/article/${item.id}`}
				className="flex items-center gap-3 rounded-md px-4 py-2 pr-20 outline-none transition-colors hover:bg-bg-secondary focus-visible:ring-2 focus-visible:ring-accent sm:px-6"
			>
				<UnreadDot read={item.read} />
				<SourceMark name={item.source} className="size-4 text-[0.5rem]" />
				<h3
					className={cn(
						"min-w-0 flex-1 truncate text-sm",
						item.read
							? "font-normal text-text-secondary"
							: "font-medium text-text-primary",
					)}
				>
					{item.title}
					{!item.read && <span className="sr-only"> (unread)</span>}
				</h3>
				<span className="ml-auto hidden shrink-0 items-center gap-2 text-xs text-text-tertiary transition-opacity group-hover:opacity-0 group-focus-within:opacity-0 sm:flex">
					<span className="max-w-[12rem] truncate">{item.source}</span>
					<time title={item.time}>{item.relative}</time>
				</span>
			</Link>

			<ItemActions
				title={item.title}
				className={cn("absolute right-3 top-1/2 -translate-y-1/2", REVEAL)}
				buttonClassName="size-7 [&_svg]:size-4"
			/>
		</motion.article>
	);
}
