import { Outlet, useFetcher, useMatch } from "react-router";
import { FeedList } from "~/components/home/feed-list";
import { ContentToolbar } from "~/components/home/toolbar";
import { isLayout, type Layout } from "~/lib/layout";
import { getLayout } from "~/lib/layout.server";
import { cn } from "~/lib/utils";
import type { Route } from "./+types/home";

export async function loader({ request }: Route.LoaderArgs) {
	return { layout: await getLayout(request) };
}

/**
 * Pathless layout: renders for `/` and `/article/:id` alike, so selecting an
 * item fills the reading pane instead of navigating away from the list.
 */
export default function Home({ loaderData }: Route.ComponentProps) {
	const fetcher = useFetcher();
	// Optimistic: switch the moment a toggle is clicked, before the cookie round-trip.
	const pending = fetcher.formData?.get("layout");
	const layout: Layout = isLayout(pending) ? pending : loaderData.layout;

	// Derived from the matched route — never stored, so there is nothing to sync.
	const detailOpen = useMatch("/article/:id") !== null;

	return (
		<div className="flex min-h-0 flex-1">
			<section
				aria-label="Feed"
				className={cn(
					"@container min-h-0 min-w-0 flex-col border-border xl:w-96 xl:flex-none xl:border-r 2xl:w-[26rem]",
					// Below xl there is only room for one pane at a time.
					detailOpen ? "hidden xl:flex" : "flex flex-1",
				)}
			>
				<ContentToolbar layout={layout} fetcher={fetcher} />

				<div className="min-h-0 min-w-0 flex-1 overflow-y-auto">
					<FeedList layout={layout} />
				</div>
			</section>

			<div
				className={cn(
					"@container min-h-0 min-w-0 flex-1 overflow-y-auto",
					detailOpen ? "block" : "hidden xl:block",
				)}
			>
				<Outlet />
			</div>
		</div>
	);
}
