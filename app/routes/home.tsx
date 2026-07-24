import { useFetcher } from "react-router";
import { FeedList } from "~/components/home/feed-list";
import { ContentToolbar } from "~/components/home/toolbar";
import { isLayout, type Layout } from "~/lib/layout";
import { getLayout } from "~/lib/layout.server";
import type { Route } from "./+types/home";

export async function loader({ request }: Route.LoaderArgs) {
	return { layout: await getLayout(request) };
}

export function meta(_: Route.MetaArgs) {
	return [
		{ title: "All Items — Frontpage" },
		{
			name: "description",
			content: "Your personalized front page for tech content.",
		},
	];
}

export default function Home({ loaderData }: Route.ComponentProps) {
	const fetcher = useFetcher();
	// Optimistic: switch the moment a toggle is clicked, before the cookie round-trip.
	const pending = fetcher.formData?.get("layout");
	const layout: Layout = isLayout(pending) ? pending : loaderData.layout;

	return (
		<>
			<ContentToolbar layout={layout} fetcher={fetcher} />

			<main className="flex-1">
				<FeedList layout={layout} />
			</main>
		</>
	);
}
