import {
	Bookmark,
	CircleCheck,
	Folder,
	FolderOpen,
	Inbox,
	Plus,
} from "lucide-react";
import { SourceMark } from "~/components/shared";
import {
	type Category,
	categories,
	categoryStyles,
	savedCount,
	unreadTotal,
} from "~/lib/mock-feed";
import { cn } from "~/lib/utils";
import { Button } from "../ui/button";

function CategoryGroup({ category }: { category: Category }) {
	const style = categoryStyles[category.name];
	return (
		<div className="flex flex-col gap-0.5">
			<button
				type="button"
				aria-expanded={category.expanded}
				className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-text-primary outline-none transition-colors hover:bg-bg-tertiary focus-visible:ring-2 focus-visible:ring-accent"
			>
				{category.expanded ? (
					<FolderOpen
						className={cn("size-4", style?.text)}
						aria-hidden
					/>
				) : (
					<Folder
						className={cn("size-4", style?.text)}
						fill="currentColor"
						aria-hidden
					/>
				)}
				<span className="flex-1 text-left font-medium">{category.name}</span>
				<span className="text-xs text-text-tertiary">{category.unread}</span>
			</button>

			{category.expanded && (
				<ul className="flex flex-col gap-0.5 pl-6">
					{category.feeds.map((feed) => (
						<li key={feed.id}>
							<a
								href={`/feed/${feed.id}`}
								className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-text-secondary outline-none transition-colors hover:bg-bg-tertiary hover:text-text-primary focus-visible:ring-2 focus-visible:ring-accent"
							>
								<SourceMark
									name={feed.title}
									className="size-4 text-[0.5rem]"
								/>
								<span className="flex-1 truncate">{feed.title}</span>
								{feed.unread > 0 && (
									<span className="text-xs text-text-tertiary">
										{feed.unread}
									</span>
								)}
							</a>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}

export function Sidebar() {
	return (
		<nav
			aria-label="Feeds"
			className="hidden w-sidebar shrink-0 flex-col border-r border-border bg-bg-secondary lg:sticky lg:top-14 lg:flex lg:h-[calc(100vh-3.5rem)]"
		>
			<div className="flex flex-1 flex-col gap-4 overflow-y-auto p-3">
				<ul className="flex flex-col gap-0.5">
					<li>
						<a
							href="/"
							aria-current="page"
							className="flex items-center gap-2 rounded-md bg-accent-subtle px-3 py-2 text-sm font-medium text-accent outline-none focus-visible:ring-2 focus-visible:ring-accent"
						>
							<Inbox className="size-4" aria-hidden />
							<span className="flex-1">All Items</span>
							<span className="text-xs font-semibold">{unreadTotal}</span>
						</a>
					</li>
					<li>
						<a
							href="/saved"
							className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-text-secondary outline-none transition-colors hover:bg-bg-tertiary hover:text-text-primary focus-visible:ring-2 focus-visible:ring-accent"
						>
							<Bookmark className="size-4" aria-hidden />
							<span className="flex-1">Saved</span>
							<span className="text-xs text-text-tertiary">{savedCount}</span>
						</a>
					</li>
				</ul>

				<div className="flex flex-col gap-1">
					<h2 className="px-2 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
						Categories
					</h2>
					{categories.map((category) => (
						<CategoryGroup key={category.name} category={category} />
					))}
					<Button
						variant="ghost"
						size="sm"
						className="mt-1 justify-start gap-2 text-text-secondary"
					>
						<Plus className="size-4" aria-hidden />
						Add category
					</Button>
				</div>
			</div>

			<div className="flex items-center gap-2 border-t border-border px-4 py-3 text-sm text-success">
				<CircleCheck className="size-4" aria-hidden />
				<span>All feeds healthy</span>
			</div>
		</nav>
	);
}
