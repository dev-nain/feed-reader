import { MousePointerClick } from "lucide-react";
import { EmptyState } from "~/components/ui/empty-state";
import type { Route } from "./+types/home.index";

export function meta(_: Route.MetaArgs) {
	return [
		{ title: "All Items — Frontpage" },
		{
			name: "description",
			content: "Your personalized front page for tech content.",
		},
	];
}

/** Placeholder for the reading pane while no article is selected. */
export default function HomeIndex() {
	return (
		<main className="flex h-full items-center justify-center">
			<EmptyState
				icon={MousePointerClick}
				title="Select an article"
				description="Choose something from the list to read it here."
			/>
		</main>
	);
}
