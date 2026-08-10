import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Inbox, SearchX, X } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router";
import { Button, buttonVariants } from "~/components/ui/button";
import { EmptyState } from "~/components/ui/empty-state";
import { applyFeedView, useFeedView } from "~/lib/feed-view";
import type { Layout } from "~/lib/layout";
import { type FeedItem, feedItems } from "~/lib/mock-feed";
import { listContainer } from "~/lib/motion";
import { FeedItemCompact, FeedItemRow } from "./feed-item";

/** Buckets items by their date group, preserving order. */
function groupByDate(items: FeedItem[]) {
	const groups: { group: string; items: FeedItem[] }[] = [];
	for (const item of items) {
		const last = groups.at(-1);
		if (last && last.group === item.group) last.items.push(item);
		else groups.push({ group: item.group, items: [item] });
	}
	return groups;
}

export function FeedList({ layout }: { layout: Layout }) {
	// The open article, so its row can mark itself current.
	const { id } = useParams();
	const [view, setView] = useFeedView();
	const [showNew, setShowNew] = useState(true);

	if (feedItems.length === 0) {
		return (
			<div className="mx-auto max-w-feed px-6 py-12">
				<EmptyState
					icon={Inbox}
					title="You're all caught up"
					description="No unread articles. Add a feed or check back later."
					action={
						<Link
							to="/discover"
							className={buttonVariants({ variant: "primary", size: "md" })}
						>
							Add feed
						</Link>
					}
				/>
			</div>
		);
	}

	// Derived during render — no effect, and `feedItems` is never mutated.
	const items = applyFeedView(feedItems, view);

	if (items.length === 0) {
		return (
			<div className="mx-auto max-w-feed px-6 py-12">
				<EmptyState
					icon={SearchX}
					title="No items match your filters"
					description="Nothing here fits the filters you've applied."
					action={
						<Button
							variant="outline"
							size="sm"
							onClick={() => setView({ filters: [] })}
						>
							Clear filters
						</Button>
					}
				/>
			</div>
		);
	}

	const groups = groupByDate(items);
	const ListItem = layout === "compact" ? FeedItemCompact : FeedItemRow;

	return (
		<div className="mx-auto">
			{/* A quiet notice, not a band — it should be noticeable, not loud. */}
			{showNew && (
				<motion.div
					initial={{ opacity: 0, y: -8 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, ease: "easeOut" }}
					className="flex items-center justify-center gap-1.5 px-4 py-2 text-sm text-accent"
				>
					<ArrowUp className="size-4 shrink-0" aria-hidden />
					<span>5 new items since your last visit</span>
					<button
						type="button"
						onClick={() => setShowNew(false)}
						aria-label="Dismiss new items notice"
						className="ml-1 grid size-8 shrink-0 place-items-center rounded-md text-text-tertiary outline-none transition-colors hover:bg-bg-tertiary hover:text-text-primary focus-visible:ring-2 focus-visible:ring-accent"
					>
						<X className="size-4" aria-hidden />
					</button>
				</motion.div>
			)}

			{/* Keyed by layout so switching views replays the stagger. */}
			<AnimatePresence mode="wait">
				<motion.div
					key={`${layout}-${view.order}`}
					variants={listContainer}
					initial="hidden"
					animate="show"
					exit={{ opacity: 0, transition: { duration: 0.15 } }}
				>
					{groups.map((g) => (
						<section key={g.group}>
							<h2 className="px-4 pt-5 pb-1 text-xs font-semibold uppercase tracking-wide text-text-tertiary @min-[28rem]:px-6">
								{g.group}
							</h2>
							<div className="divide-y divide-border-subtle">
								{g.items.map((item) => (
									<ListItem
										key={item.id}
										item={item}
										current={item.id === id}
										timestamp={view.timestamp}
									/>
								))}
							</div>
						</section>
					))}
				</motion.div>
			</AnimatePresence>
		</div>
	);
}
