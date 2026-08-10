import {
	AlignJustify,
	ArrowDownWideNarrow,
	CheckCheck,
	List,
	ListFilter,
	type LucideIcon,
	RefreshCw,
} from "lucide-react";
import type { useFetcher } from "react-router";
import { WithTooltip } from "~/components/shared";
import { Badge } from "~/components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
	type FeedOrder,
	type FeedTimestamp,
	toggleFilter,
	useFeedView,
} from "~/lib/feed-view";
import type { Layout } from "~/lib/layout";
import { unreadTotal } from "~/lib/mock-feed";
import { cn } from "~/lib/utils";

const VIEWS: { value: Layout; label: string; icon: LucideIcon }[] = [
	{ value: "list", label: "List view", icon: List },
	{ value: "compact", label: "Compact view", icon: AlignJustify },
];

/** Naked action button: no chrome at rest, a whisper of it on hover. */
const ICON_ACTION =
	"grid size-8 shrink-0 place-items-center rounded-md text-text-secondary outline-none transition-colors hover:bg-bg-tertiary hover:text-text-primary focus-visible:ring-2 focus-visible:ring-accent";

/** Naked text+icon trigger for the two menus. */
const MENU_TRIGGER =
	"flex items-center gap-1.5 rounded-md px-1.5 py-1 text-sm text-text-secondary outline-none transition-colors hover:text-text-primary focus-visible:ring-2 focus-visible:ring-accent [&_svg]:size-4";

export function ContentToolbar({
	layout,
	fetcher,
}: {
	layout: Layout;
	fetcher: ReturnType<typeof useFetcher>;
}) {
	const [view, setView] = useFeedView();

	return (
		<div className="border-b border-border">
			{/*
			 * Row 1 — what you are looking at, and what you can do to it. `h-14`
			 * is the app's chrome height: the sidebar brand block, the mobile
			 * header and the article toolbar all sit on the same line.
			 */}
			<div className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4">
				<div className="flex min-w-0 items-baseline gap-2">
					<h1 className="truncate text-xl font-semibold text-text-primary">
						All Items
					</h1>
					{/* The feed's total, not the filtered count — it describes the feed. */}
					<span className="shrink-0 text-sm text-text-tertiary">
						{unreadTotal} unread
					</span>
				</div>

				<div className="ml-auto flex items-center gap-1">
					<WithTooltip label="Refresh feeds">
						<button
							type="button"
							aria-label="Refresh feeds"
							className={ICON_ACTION}
						>
							<RefreshCw className="size-4" aria-hidden />
						</button>
					</WithTooltip>

					<WithTooltip label="Mark all as read">
						<button
							type="button"
							aria-label="Mark all as read"
							className={ICON_ACTION}
						>
							<CheckCheck className="size-4" aria-hidden />
						</button>
					</WithTooltip>

					<fetcher.Form
						method="post"
						action="/set-layout"
						className="ml-1 flex items-center rounded-md border border-border p-0.5"
						aria-label="View mode"
					>
						{VIEWS.map(({ value, label, icon: Icon }) => {
							const active = layout === value;
							return (
								<WithTooltip key={value} label={label}>
									<button
										type="submit"
										name="layout"
										value={value}
										aria-label={label}
										aria-pressed={active}
										className={cn(
											"grid size-7 place-items-center rounded outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent",
											active
												? "bg-bg-tertiary text-text-primary"
												: "text-text-tertiary hover:text-text-primary",
										)}
									>
										<Icon className="size-4" aria-hidden />
									</button>
								</WithTooltip>
							);
						})}
					</fetcher.Form>
				</div>
			</div>

			{/* Row 2 — how the list is filtered and displayed. */}
			<div className="flex items-center justify-between px-3 pb-2">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<button type="button" className={MENU_TRIGGER}>
							<ListFilter aria-hidden />
							Filters
							{view.filters.length > 0 && (
								<Badge variant="accent">{view.filters.length}</Badge>
							)}
						</button>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuCheckboxItem
							checked={view.filters.includes("unread")}
							onCheckedChange={() =>
								setView({ filters: toggleFilter(view.filters, "unread") })
							}
						>
							Unread only
						</DropdownMenuCheckboxItem>
						<DropdownMenuCheckboxItem
							checked={view.filters.includes("starred")}
							onCheckedChange={() =>
								setView({ filters: toggleFilter(view.filters, "starred") })
							}
						>
							Starred only
						</DropdownMenuCheckboxItem>
					</DropdownMenuContent>
				</DropdownMenu>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<button type="button" className={MENU_TRIGGER}>
							<ArrowDownWideNarrow aria-hidden />
							Display
						</button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel>Order</DropdownMenuLabel>
						<DropdownMenuRadioGroup
							value={view.order}
							onValueChange={(value) => setView({ order: value as FeedOrder })}
						>
							<DropdownMenuRadioItem value="newest">
								Newest first
							</DropdownMenuRadioItem>
							<DropdownMenuRadioItem value="oldest">
								Oldest first
							</DropdownMenuRadioItem>
						</DropdownMenuRadioGroup>

						<DropdownMenuSeparator />

						<DropdownMenuLabel>Timestamp</DropdownMenuLabel>
						<DropdownMenuRadioGroup
							value={view.timestamp}
							onValueChange={(value) =>
								setView({ timestamp: value as FeedTimestamp })
							}
						>
							<DropdownMenuRadioItem value="relative">
								Relative
							</DropdownMenuRadioItem>
							<DropdownMenuRadioItem value="absolute">
								Absolute
							</DropdownMenuRadioItem>
						</DropdownMenuRadioGroup>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}
