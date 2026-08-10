import { Search } from "lucide-react";
import { Link } from "react-router";
import { SubHeader } from "~/components/discover/sub-header";
import { Button } from "~/components/ui/button";
import { EmptyState } from "~/components/ui/empty-state";
import { Input } from "~/components/ui/input";
import type { Route } from "./+types/discover.rss";

export function meta(_: Route.MetaArgs) {
	return [
		{ title: "Add by address — Discover — Frontpage" },
		{
			name: "description",
			content: "Add any RSS or Atom feed by its address.",
		},
	];
}

export default function DiscoverRss() {
	return (
		<>
			<SubHeader title="RSS" />

			<main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
				{/*
				 * Presentational: resolving an address needs server-side fetching and
				 * parsing (Core #1/#2), which do not exist yet. Nothing is submitted.
				 * When they land, validate this input with Zod in a server action.
				 */}
				<div className="rounded-lg border border-border bg-surface p-5">
					<h2 className="mb-3 text-sm font-semibold text-text-primary">
						Enter feed's address
					</h2>

					<div className="flex items-center gap-2">
						<Input
							type="url"
							placeholder="https://example.com/feed"
							aria-label="Feed address"
							className="min-w-0 flex-1"
						/>
						<Button aria-disabled className="shrink-0 opacity-60">
							Search
						</Button>
					</div>
				</div>

				<EmptyState
					icon={Search}
					title="Available feeds will show up here."
					description="Don't know what to follow?"
					action={
						<Link
							to="/discover"
							className="rounded-md text-sm font-semibold text-accent outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent"
						>
							See our catalog.
						</Link>
					}
				/>
			</main>
		</>
	);
}
