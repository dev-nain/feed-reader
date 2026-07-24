import { Plus, Rss, Search } from "lucide-react";
import { WithTooltip } from "~/components/shared";
import { ThemeToggle } from "~/components/theme-toggle";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

export function TopHeader() {
	return (
		<header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b border-border bg-bg-primary px-4">
			<div className="flex items-center gap-2">
				<span
					aria-hidden
					className="grid size-7 place-items-center rounded-md bg-accent text-white"
				>
					<Rss className="size-4" />
				</span>
				<span className="text-lg font-semibold text-text-primary">
					Frontpage
				</span>
			</div>

			{/* ponytail: tabs are presentational — Digest/Discover routes not built yet. */}
			<nav aria-label="Sections" className="hidden items-center gap-1 sm:flex">
				<a
					href="/"
					aria-current="page"
					className="rounded-md bg-bg-tertiary px-3 py-1.5 text-sm font-medium text-text-primary"
				>
					Feed
				</a>
				<a
					href="/digest"
					className="rounded-md px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary"
				>
					Digest
				</a>
				<a
					href="/discover"
					className="rounded-md px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary"
				>
					Discover
				</a>
			</nav>

			<div className="relative mx-auto hidden w-full max-w-md md:block">
				<Search
					className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-tertiary"
					aria-hidden
				/>
				<Input
					type="search"
					placeholder="Search articles…"
					aria-label="Search articles"
					className="bg-bg-secondary pl-9 pr-9"
				/>
				<kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-border bg-bg-primary px-1.5 py-0.5 text-xs text-text-tertiary">
					/
				</kbd>
			</div>

			<div className="ml-auto flex items-center gap-1 md:ml-0">
				<ThemeToggle />
				<WithTooltip label="Add feed">
					<Button variant="ghost" size="icon" aria-label="Add feed">
						<Plus />
					</Button>
				</WithTooltip>
				<span
					aria-hidden
					className="grid size-8 place-items-center rounded-full bg-accent text-xs font-semibold text-white"
				>
					MS
				</span>
			</div>
		</header>
	);
}
