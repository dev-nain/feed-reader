import {
	AlignJustify,
	ArrowDownWideNarrow,
	ChevronDown,
	LayoutGrid,
	List,
	type LucideIcon,
	RefreshCw,
} from "lucide-react";
import type { useFetcher } from "react-router";
import { WithTooltip } from "~/components/shared";
import { Button } from "~/components/ui/button";
import type { Layout } from "~/lib/layout";
import { unreadTotal } from "~/lib/mock-feed";
import { cn } from "~/lib/utils";

const VIEWS: { value: Layout; label: string; icon: LucideIcon }[] = [
	{ value: "list", label: "List view", icon: List },
	{ value: "grid", label: "Grid view", icon: LayoutGrid },
	{ value: "compact", label: "Compact view", icon: AlignJustify },
];

export function ContentToolbar({
	layout,
	fetcher,
}: {
	layout: Layout;
	fetcher: ReturnType<typeof useFetcher>;
}) {
	return (
		<div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-4 sm:px-6">
			<div className="flex items-baseline gap-2">
				<h1 className="text-xl font-semibold text-text-primary">All Items</h1>
				<span className="text-sm text-text-tertiary">{unreadTotal} unread</span>
			</div>

			<div className="ml-auto flex items-center gap-2">
				<fetcher.Form
					method="post"
					action="/set-layout"
					className="flex items-center rounded-md border border-border p-0.5"
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
										"grid size-7 place-items-center rounded outline-none focus-visible:ring-2 focus-visible:ring-accent",
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

				<Button variant="outline" size="sm">
					<ArrowDownWideNarrow />
					Newest
					<ChevronDown />
				</Button>
				<Button variant="outline" size="sm">
					<RefreshCw />
					Refresh
				</Button>
				<Button variant="outline" size="sm" className="hidden sm:inline-flex">
					Mark all read
				</Button>
			</div>
		</div>
	);
}
