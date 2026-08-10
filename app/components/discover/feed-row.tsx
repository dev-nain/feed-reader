import { Plus } from "lucide-react";
import { SourceMark } from "~/components/shared";
import { Button } from "~/components/ui/button";
import type { CatalogFeed } from "~/lib/discover-catalog";

/**
 * One catalogue source: mark, title, domain, Follow.
 *
 * Deliberately dense — title and domain only, no description — so a category
 * fits on one screen. The row itself is not a link; Follow is the only control.
 */
export function FeedRow({ feed }: { feed: CatalogFeed }) {
	return (
		<li className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2.5 transition-colors hover:bg-bg-tertiary">
			{/* ponytail: swap for the real favicon once feeds carry icon URLs. */}
			<SourceMark name={feed.title} className="size-8 rounded-md text-xs" />

			<div className="flex min-w-0 flex-1 flex-col">
				<span className="truncate text-sm font-medium text-text-primary">
					{feed.title}
				</span>
				<span className="truncate text-xs text-text-tertiary">
					{feed.domain}
				</span>
			</div>

			{/* Inert until accounts land: aria-disabled rather than `disabled`, so
			    the control stays focusable and its state is announced. */}
			<Button
				variant="outline"
				size="sm"
				aria-disabled
				aria-label={`Follow ${feed.title}`}
				className="shrink-0 opacity-60"
			>
				<Plus />
				Follow
			</Button>
		</li>
	);
}
