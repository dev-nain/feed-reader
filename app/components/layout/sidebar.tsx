import {
	CircleCheck,
	Compass,
	Folder,
	FolderOpen,
	Inbox,
	Library,
	Plus,
	Rss,
	Sparkles,
	Star,
} from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router";
import {
	AccountMenu,
	GuestPanel,
	type ViewerSummary,
} from "~/components/layout/account-menu";
import { SourceMark } from "~/components/shared";
import { ThemeToggle } from "~/components/theme-toggle";
import {
	type Category,
	categories,
	categoryStyles,
	type Feed,
	starredCount,
	uncategorized,
	unreadTotal,
} from "~/lib/mock-feed";
import { cn } from "~/lib/utils";

const NAV_ITEM =
	"flex items-center gap-2 rounded-md px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent";
const NAV_ACTIVE = "bg-accent-subtle font-medium text-accent";
const NAV_IDLE =
	"text-text-secondary hover:bg-bg-tertiary hover:text-text-primary";

function navClass({ isActive }: { isActive: boolean }) {
	return cn(NAV_ITEM, isActive ? NAV_ACTIVE : NAV_IDLE);
}

/** A feed row — nested under a category, or flat when it has none. */
function FeedLink({ feed }: { feed: Feed }) {
	return (
		<a
			href={`/feed/${feed.id}`}
			className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-text-secondary outline-none transition-colors hover:bg-bg-tertiary hover:text-text-primary focus-visible:ring-2 focus-visible:ring-accent"
		>
			<SourceMark name={feed.title} className="size-4 text-[0.5rem]" />
			{/* No per-feed count: the category total already answers "anything new?" */}
			<span className="flex-1 truncate">{feed.title}</span>
		</a>
	);
}

function CategoryGroup({ category }: { category: Category }) {
	// `expanded` on the mock data is the seed; the toggle owns it from here.
	const [expanded, setExpanded] = useState(category.expanded);
	const style = categoryStyles[category.name];
	const listId = `category-${category.name.replace(/\W+/g, "-").toLowerCase()}`;

	return (
		<div className="flex flex-col gap-0.5">
			<button
				type="button"
				aria-expanded={expanded}
				aria-controls={listId}
				onClick={() => setExpanded((open) => !open)}
				className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-text-primary outline-none transition-colors hover:bg-bg-tertiary focus-visible:ring-2 focus-visible:ring-accent"
			>
				{expanded ? (
					<FolderOpen
						className={cn("size-4", style?.text ?? "text-text-tertiary")}
						aria-hidden
					/>
				) : (
					<Folder
						className={cn("size-4", style?.text ?? "text-text-tertiary")}
						fill="currentColor"
						aria-hidden
					/>
				)}
				<span className="flex-1 text-left font-medium">{category.name}</span>
				<span className="text-xs text-text-tertiary">{category.unread}</span>
			</button>

			{expanded && (
				<ul id={listId} className="flex flex-col gap-0.5 pl-6">
					{category.feeds.map((feed) => (
						<li key={feed.id}>
							<FeedLink feed={feed} />
						</li>
					))}
				</ul>
			)}
		</div>
	);
}

/**
 * Full-height chrome at `lg` and up: brand, primary navigation and the category
 * tree in one column, so the app needs no separate top bar.
 */
export function Sidebar({ viewer }: { viewer: ViewerSummary }) {
	return (
		<div className="hidden w-sidebar shrink-0 flex-col border-r border-border bg-bg-secondary lg:flex">
			<Link
				to="/"
				className="flex h-14 shrink-0 items-center gap-2 px-4 outline-none focus-visible:ring-2 focus-visible:ring-accent"
			>
				<span
					aria-hidden
					className="grid size-7 place-items-center rounded-md bg-accent text-white"
				>
					<Rss className="size-4" />
				</span>
				<span className="text-lg font-semibold text-text-primary">
					Frontpage
				</span>
			</Link>

			<nav
				aria-label="Main"
				className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-3 pt-2 pb-3"
			>
				<ul className="flex flex-col gap-0.5">
					<li>
						<NavLink to="/" end className={navClass}>
							<Inbox className="size-4" aria-hidden />
							<span className="flex-1">All Items</span>
							<span className="text-xs font-semibold">{unreadTotal}</span>
						</NavLink>
					</li>
					<li>
						<NavLink to="/starred" className={navClass}>
							<Star className="size-4" aria-hidden />
							<span className="flex-1">Starred</span>
							<span className="text-xs text-text-tertiary">{starredCount}</span>
						</NavLink>
					</li>
					<li>
						<NavLink to="/library" className={navClass}>
							<Library className="size-4" aria-hidden />
							<span className="flex-1">Library</span>
						</NavLink>
					</li>
					<li>
						{/* ponytail: presentational — the Digest route is not built yet. */}
						<a href="/digest" className={cn(NAV_ITEM, NAV_IDLE)}>
							<Sparkles className="size-4" aria-hidden />
							<span className="flex-1">Digest</span>
						</a>
					</li>
					<li>
						<NavLink to="/discover" className={navClass}>
							<Compass className="size-4" aria-hidden />
							<span className="flex-1">Discover</span>
						</NavLink>
					</li>
				</ul>

				<hr className="border-t border-border" />

				<div className="flex flex-col gap-1">
					{categories.map((category) => (
						<CategoryGroup key={category.name} category={category} />
					))}

					{/* Feeds in no category sit flat, at the same level as the folders. */}
					<ul className="flex flex-col gap-0.5">
						{uncategorized.map((feed) => (
							<li key={feed.id}>
								<FeedLink feed={feed} />
							</li>
						))}
					</ul>

					<Link
						to="/discover"
						className="mt-1 flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-text-secondary outline-none transition-colors hover:bg-bg-tertiary hover:text-text-primary focus-visible:ring-2 focus-visible:ring-accent"
					>
						<Plus className="size-4" aria-hidden />
						Add feed
					</Link>
				</div>
			</nav>

			<div className="shrink-0 border-t border-border">
				{viewer.kind === "guest" && (
					<div className="px-3 pt-3">
						<GuestPanel />
					</div>
				)}

				<div className="flex items-center gap-2 py-2 pl-4 pr-2">
					<CircleCheck className="size-4 shrink-0 text-success" aria-hidden />
					<span className="flex-1 truncate text-sm text-success">
						All feeds healthy
					</span>
					<ThemeToggle className="size-8 [&_svg]:size-4" />
					{/*
					 * Guests get their call to action from the panel above, so the
					 * status row keeps only the avatar it had before.
					 */}
					{viewer.kind === "user" && (
						<AccountMenu viewer={viewer} className="size-7" />
					)}
				</div>
			</div>
		</div>
	);
}
