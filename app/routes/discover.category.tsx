import { data } from "react-router";
import { FeedRow } from "~/components/discover/feed-row";
import { SubHeader } from "~/components/discover/sub-header";
import { Button } from "~/components/ui/button";
import { findCatalogCategory } from "~/lib/discover-catalog";
import type { Route } from "./+types/discover.category";

export async function loader({ params }: Route.LoaderArgs) {
	const category = findCatalogCategory(params.slug);
	if (!category)
		throw data(null, { status: 404, statusText: "Category not found" });
	return { category };
}

export function meta({ loaderData }: Route.MetaArgs) {
	const name = loaderData?.category.name;
	return [
		{ title: name ? `${name} — Discover — Frontpage` : "Discover — Frontpage" },
		{
			name: "description",
			content: name ? `Curated ${name} sources on Frontpage.` : "",
		},
	];
}

export default function DiscoverCategory({ loaderData }: Route.ComponentProps) {
	const { category } = loaderData;
	const count = category.feeds.length;

	return (
		<>
			<SubHeader title={category.name}>
				<Button
					variant="outline"
					size="sm"
					aria-disabled
					aria-label={`Follow all ${count} feeds in ${category.name}`}
					className="opacity-60"
				>
					Follow all {count}
				</Button>
			</SubHeader>

			<main className="mx-auto w-full max-w-page px-4 py-6 sm:px-6">
				<p className="mb-4 text-xs text-text-tertiary">
					Following arrives with accounts — browse the catalogue meanwhile.
				</p>

				<ul className="grid gap-2 md:grid-cols-2">
					{category.feeds.map((feed) => (
						<FeedRow key={feed.id} feed={feed} />
					))}
				</ul>
			</main>
		</>
	);
}
