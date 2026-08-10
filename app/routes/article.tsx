import { useEffect, useRef } from "react";
import { data } from "react-router";
import {
	ArticleBody,
	ArticleHeader,
	ArticleToolbar,
	MoreFromSource,
} from "~/components/article/reader";
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
	const heading = useRef<HTMLDivElement>(null);

	// Selecting from the list swaps this pane's content without moving focus;
	// send it to the article so keyboard users are not left back up the list.
	useEffect(() => {
		heading.current?.focus();
	}, []);

	return (
		<main className="relative">
			<ArticleToolbar item={item} />

			{/*
			 * One centred reading column at every width — the pane is far narrower
			 * than the window in split view, so nothing useful fits beside the text.
			 */}
			<div className="mx-auto w-full max-w-content px-5 pb-20 sm:px-8">
				<article className="min-w-0" ref={heading} tabIndex={-1}>
					<ArticleHeader item={item} />
					<ArticleBody item={item} />
				</article>

				<MoreFromSource related={related} />
			</div>
		</main>
	);
}
