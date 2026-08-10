import { motion } from "framer-motion";
import { Link } from "react-router";
import {
	ItemActions,
	REVEAL,
	SourceMark,
	UnreadDot,
} from "~/components/shared";
import type { FeedTimestamp } from "~/lib/feed-view";
import { categoryStyles, type FeedItem } from "~/lib/mock-feed";
import { listItem } from "~/lib/motion";
import { cn } from "~/lib/utils";

/*
 * Rows size themselves off the feed column's own width (`@container` on the pane),
 * not the viewport: the same component sits in a ~24rem split pane and in a
 * full-width column below xl. Under 28rem it sheds the action gutter, the badge
 * and a line of excerpt — acting on an item happens in the reader pane instead.
 */

/** Full row with excerpt — the default reading density. */
export function FeedItemRow({
	item,
	current,
	timestamp,
}: {
	item: FeedItem;
	current?: boolean;
	timestamp: FeedTimestamp;
}) {
	const badge = categoryStyles[item.category]?.badge;
	return (
		<motion.article variants={listItem} className="group relative">
			<Link
				to={`/article/${item.id}`}
				aria-current={current ? "page" : undefined}
				className={cn(
					"flex items-start gap-3 rounded-lg py-4 pl-4 pr-3 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent",
					"@min-[28rem]:pl-6 @min-[28rem]:pr-28",
					current ? "bg-accent-subtle" : "hover:bg-bg-secondary",
				)}
			>
				<UnreadDot read={item.read} className="mt-1.5" />
				<div
					className={cn(
						"flex min-w-0 flex-1 flex-col gap-1",
						item.read && "opacity-60",
					)}
				>
					<div className="flex items-center gap-2 text-sm text-text-secondary">
						<SourceMark
							name={item.source}
							tone="bare"
							className="size-4 text-[0.65rem]"
						/>
						<span className="truncate font-medium text-text-primary">
							{item.source}
						</span>
						<span className="text-text-tertiary">·</span>
						<time
							className="shrink-0 text-text-tertiary"
							dateTime={item.iso}
							title={timestamp === "absolute" ? item.relative : item.time}
						>
							{timestamp === "absolute" ? item.time : item.relative}
						</time>
						{!item.read && <span className="sr-only">unread</span>}
					</div>

					<h3
						className={cn(
							"text-base text-text-primary @min-[28rem]:text-lg",
							item.read ? "font-medium" : "font-semibold",
						)}
					>
						{item.title}
					</h3>

					<p className="line-clamp-1 text-sm text-text-secondary @min-[28rem]:line-clamp-2">
						{item.excerpt}
					</p>

					<span
						className={cn(
							"mt-1 hidden w-fit items-center rounded-sm px-2 py-0.5 text-xs font-medium @min-[28rem]:inline-flex",
							badge,
						)}
					>
						{item.category}
					</span>
				</div>
			</Link>

			<ItemActions
				title={item.title}
				className={cn(
					"absolute right-4 top-4 hidden @min-[28rem]:flex",
					REVEAL,
				)}
			/>
		</motion.article>
	);
}

/** Dense single-line row for the compact density. */
export function FeedItemCompact({
	item,
	current,
	timestamp,
}: {
	item: FeedItem;
	current?: boolean;
	timestamp: FeedTimestamp;
}) {
	return (
		<motion.article variants={listItem} className="group relative">
			<Link
				to={`/article/${item.id}`}
				aria-current={current ? "page" : undefined}
				className={cn(
					"flex items-center gap-3 rounded-md py-2 pl-4 pr-3 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent",
					"@min-[28rem]:pl-6 @min-[28rem]:pr-20",
					current ? "bg-accent-subtle" : "hover:bg-bg-secondary",
				)}
			>
				<UnreadDot read={item.read} />
				<SourceMark
					name={item.source}
					tone="bare"
					className="size-4 text-[0.65rem]"
				/>
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
				<span className="ml-auto hidden shrink-0 items-center gap-2 text-xs text-text-tertiary transition-opacity group-hover:opacity-0 group-focus-within:opacity-0 @min-[28rem]:flex">
					<span className="max-w-[12rem] truncate">{item.source}</span>
					<time
						dateTime={item.iso}
						title={timestamp === "absolute" ? item.relative : item.time}
					>
						{timestamp === "absolute" ? item.time : item.relative}
					</time>
				</span>
			</Link>

			<ItemActions
				title={item.title}
				className={cn(
					"absolute right-3 top-1/2 hidden -translate-y-1/2 @min-[28rem]:flex",
					REVEAL,
				)}
				buttonClassName="size-7 [&_svg]:size-4"
			/>
		</motion.article>
	);
}
