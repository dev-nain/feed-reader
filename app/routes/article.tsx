import { data } from "react-router";
import {
	ArticleAside,
	ArticleBody,
	ArticleHeader,
	MoreFromSource,
} from "~/components/article/reader";
import { ArticleToolbar } from "~/components/article/toolbar";
import { findItem, relatedItems } from "~/lib/mock-feed";
import type { Route } from "./+types/article";

export async function loader({ params }: Route.LoaderArgs) {
	const item = findItem(params.id);
	if (!item) throw data(null, { status: 404, statusText: "Article not found" });
	return { item, related: relatedItems(item) };
}

export function meta({ loaderData }: Route.MetaArgs) {
	const title = loaderData?.item.title;
	return [
		{ title: title ? `${title} — Frontpage` : "Article — Frontpage" },
		{ name: "description", content: loaderData?.item.excerpt ?? "" },
	];
}

export default function Article({ loaderData }: Route.ComponentProps) {
	const { item, related } = loaderData;

	return (
		<>
			<ArticleToolbar item={item} />

			{/* `relative`: sr-only text is absolutely positioned — without a positioned
			    ancestor it escapes this scroll container and stretches the document. */}
			<main className="relative min-h-0 flex-1 overflow-y-auto">
				{/* Article column + context rail; the rail wraps below the article under xl. */}
				<div className="mx-auto grid max-w-page px-5 pb-16 sm:px-8 xl:grid-cols-[minmax(0,45rem)_18rem] xl:justify-center xl:gap-10">
					<article className="min-w-0">
						<ArticleHeader item={item} />
						<ArticleBody item={item} />
					</article>

					<ArticleAside item={item} />

					<MoreFromSource related={related} />
				</div>
			</main>
		</>
	);
}
