import { ArrowRight, Folder, SearchX } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { FeedRow } from "~/components/discover/feed-row";
import { Tile } from "~/components/discover/tile";
import { Badge } from "~/components/ui/badge";
import { buttonVariants } from "~/components/ui/button";
import { EmptyState } from "~/components/ui/empty-state";
import { Input } from "~/components/ui/input";
import {
	catalogCategories,
	catalogTotal,
	looksLikeAddress,
	searchCatalog,
} from "~/lib/discover-catalog";
import {
	feedTiles,
	monitoringTiles,
	type SourceTile,
	socialTiles,
} from "~/lib/discover-sources";
import { categoryStyles } from "~/lib/mock-feed";
import type { Route } from "./+types/discover";

/** One grid for every section, so ragged final rows still share a rhythm. */
const GRID = "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4";

function SourceSection({
	title,
	tiles,
}: {
	title: string;
	tiles: SourceTile[];
}) {
	return (
		<section>
			<h2 className="mb-3 text-sm font-semibold text-text-primary">{title}</h2>
			<ul className={GRID}>
				{tiles.map((tile) => (
					<li key={tile.id}>
						<Tile
							icon={tile.icon}
							label={tile.label}
							to={tile.to}
							disabled={tile.soon}
							iconClassName={tile.iconClassName}
							badge={tile.soon ? <Badge>Soon</Badge> : undefined}
						/>
					</li>
				))}
			</ul>
		</section>
	);
}

export async function loader() {
	return {
		categories: catalogCategories.map(({ name, slug, feeds }) => ({
			name,
			slug,
			count: feeds.length,
		})),
		total: catalogTotal,
	};
}

export function meta(_: Route.MetaArgs) {
	return [
		{ title: "Discover — Frontpage" },
		{
			name: "description",
			content: "Browse curated sources, or add any RSS or Atom feed.",
		},
	];
}

export default function Discover({ loaderData }: Route.ComponentProps) {
	const { categories, total } = loaderData;
	// Derived during render — 19 items, no effect and no round-trip needed.
	const [query, setQuery] = useState("");
	const searching = query.trim().length > 0;
	const results = searchCatalog(query);

	return (
		<>
			<div className="border-b border-border bg-bg-secondary px-4 py-10 sm:px-6">
				<div className="mx-auto flex max-w-2xl flex-col gap-4">
					<h1 className="text-center text-xl font-semibold text-text-primary">
						Search for feeds
					</h1>

					<form
						className="flex items-center gap-2"
						onSubmit={(event) => event.preventDefault()}
					>
						<Input
							type="search"
							value={query}
							onChange={(event) => setQuery(event.target.value)}
							placeholder="Search for keywords, or enter any website address…"
							aria-label="Search for feeds"
							className="min-w-0 flex-1"
						/>
						{/* Filtering is live; the button is here for the expected affordance. */}
						<button
							type="submit"
							className={buttonVariants({ variant: "primary", size: "md" })}
						>
							Search
						</button>
					</form>
				</div>
			</div>

			<main className="mx-auto flex w-full max-w-page flex-col gap-10 px-4 py-8 sm:px-6">
				{searching ? (
					<section>
						<div className="mb-3 flex flex-wrap items-baseline gap-2">
							<h2 className="text-sm font-semibold text-text-primary">
								Results
							</h2>
							<span className="text-xs text-text-tertiary">
								{results.length} of {total} sources
							</span>
						</div>

						{looksLikeAddress(query) && (
							<Link
								to="/discover/rss"
								className="mb-3 inline-flex items-center gap-1.5 rounded-md text-sm text-accent outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent"
							>
								Add this address directly
								<ArrowRight className="size-4" aria-hidden />
							</Link>
						)}

						{results.length > 0 ? (
							<ul className="grid gap-2 md:grid-cols-2">
								{results.map((feed) => (
									<FeedRow key={feed.id} feed={feed} />
								))}
							</ul>
						) : (
							<EmptyState
								icon={SearchX}
								title={`No sources match “${query.trim()}”`}
								description="Try a different term, or add the feed's address directly."
								action={
									<Link
										to="/discover/rss"
										className={buttonVariants({
											variant: "outline",
											size: "sm",
										})}
									>
										Add by address
									</Link>
								}
							/>
						)}
					</section>
				) : (
					<>
						<SourceSection title="Feeds" tiles={feedTiles} />

						<section>
							<h2 className="mb-3 text-sm font-semibold text-text-primary">
								Inspiration
							</h2>
							<ul className={GRID}>
								{categories.map((category) => (
									<li key={category.slug}>
										<Tile
											icon={Folder}
											label={category.name}
											meta={`${category.count} feeds`}
											to={`/discover/${category.slug}`}
											iconClassName={categoryStyles[category.name]?.badge}
										/>
									</li>
								))}
							</ul>
						</section>

						<SourceSection title="Social media" tiles={socialTiles} />
						<SourceSection title="Web monitoring" tiles={monitoringTiles} />
					</>
				)}
			</main>
		</>
	);
}
