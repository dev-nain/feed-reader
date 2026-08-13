import { Plus, Rss, Search } from "lucide-react";
import { Link } from "react-router";
import {
	AccountMenu,
	type ViewerSummary,
} from "~/components/layout/account-menu";
import { WithTooltip } from "~/components/shared";
import { ThemeToggle } from "~/components/theme-toggle";
import { buttonVariants } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

/**
 * Mobile-only chrome. At `lg` and up the sidebar is visible and carries the
 * brand, search and navigation, so this bar would only duplicate it — below
 * `lg` the sidebar is hidden and this is the only chrome there is.
 */
export function TopHeader({ viewer }: { viewer: ViewerSummary }) {
	return (
		<header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-bg-primary px-4 lg:hidden">
			<Link
				to="/"
				className="flex items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-accent"
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

			<div className="relative ml-auto hidden w-full max-w-xs sm:block">
				<Search
					className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-tertiary"
					aria-hidden
				/>
				<Input
					type="search"
					placeholder="Search articles…"
					aria-label="Search articles"
					className="bg-bg-secondary pl-9"
				/>
			</div>

			<div className="ml-auto flex items-center gap-1 sm:ml-0">
				<ThemeToggle />
				<WithTooltip label="Add feed">
					<Link
						to="/discover"
						aria-label="Add feed"
						className={buttonVariants({ variant: "ghost", size: "icon" })}
					>
						<Plus />
					</Link>
				</WithTooltip>
				<AccountMenu viewer={viewer} />
			</div>
		</header>
	);
}
