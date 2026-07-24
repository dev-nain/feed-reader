import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Inbox } from "lucide-react";
import { Button } from "~/components/ui/button";
import { EmptyState } from "~/components/ui/empty-state";
import type { Layout } from "~/lib/layout";
import { type FeedItem, feedItems } from "~/lib/mock-feed";
import { listContainer } from "~/lib/motion";
import { FeedItemCard, FeedItemCompact, FeedItemRow } from "./feed-item";

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
	if (feedItems.length === 0) {
		return (
			<div className="mx-auto max-w-feed px-6 py-12">
				<EmptyState
					icon={Inbox}
					title="You're all caught up"
					description="No unread articles. Add a feed or check back later."
					action={<Button>Add feed</Button>}
				/>
			</div>
		);
	}

	const groups = groupByDate(feedItems);
	const ListItem = layout === "compact" ? FeedItemCompact : FeedItemRow;

	return (
		<div className="mx-auto">
			<motion.div
				initial={{ opacity: 0, y: -8 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3, ease: "easeOut" }}
				className="border-b border-border bg-accent-subtle px-4 py-2.5 text-center text-sm font-medium text-accent"
			>
				<span className="inline-flex items-center gap-1.5">
					<ArrowUp className="size-4" aria-hidden />5 new items since your last
					visit
				</span>
			</motion.div>

			{/* Keyed by layout so switching views replays the stagger. */}
			<AnimatePresence mode="wait">
				<motion.div
					key={layout}
					variants={listContainer}
					initial="hidden"
					animate="show"
					exit={{ opacity: 0, transition: { duration: 0.15 } }}
				>
					{groups.map((g) => (
						<section key={g.group}>
							<h2 className="px-4 pt-5 pb-1 text-xs font-semibold uppercase tracking-wide text-text-tertiary sm:px-6">
								{g.group}
							</h2>
							{layout === "grid" ? (
								<div className="grid gap-4 px-4 pb-4 sm:grid-cols-2 sm:px-6 xl:grid-cols-4">
									{g.items.map((item) => (
										<FeedItemCard key={item.id} item={item} />
									))}
								</div>
							) : (
								<div className="divide-y divide-border-subtle">
									{g.items.map((item) => (
										<ListItem key={item.id} item={item} />
									))}
								</div>
							)}
						</section>
					))}
				</motion.div>
			</AnimatePresence>
		</div>
	);
}
