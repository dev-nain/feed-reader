import { ArrowLeft, ExternalLink } from "lucide-react";
import { Link } from "react-router";
import { ItemActions, SourceMark, WithTooltip } from "~/components/shared";
import { buttonVariants } from "~/components/ui/button";
import type { FeedItem } from "~/lib/mock-feed";

/** Detail-page toolbar: back out, act on the item, or leave for the source. */
export function ArticleToolbar({ item }: { item: FeedItem }) {
	return (
		<div className="flex items-center gap-3 border-b border-border px-4 py-4 sm:px-6">
			<WithTooltip label="Back to all items">
				<Link
					to="/"
					aria-label="Back to all items"
					className={buttonVariants({ variant: "ghost", size: "icon" })}
				>
					<ArrowLeft />
				</Link>
			</WithTooltip>

			<div className="flex min-w-0 items-center gap-2">
				<SourceMark name={item.source} />
				<span className="hidden truncate text-sm font-medium text-text-primary sm:block">
					{item.source}
				</span>
			</div>

			<div className="ml-auto flex items-center gap-2">
				<ItemActions title={item.title} />
				{/* ponytail: mock items carry no link yet — swap for item.url with the parser. */}
				<a
					href="https://example.com/article"
					target="_blank"
					rel="noreferrer noopener"
					className={buttonVariants({ variant: "outline", size: "sm" })}
				>
					<ExternalLink />
					<span className="hidden sm:inline">Open original</span>
					<span className="sr-only">Open original article in a new tab</span>
				</a>
			</div>
		</div>
	);
}
