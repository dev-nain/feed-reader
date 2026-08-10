import {
	index,
	layout,
	type RouteConfig,
	route,
} from "@react-router/dev/routes";

export default [
	layout("routes/app-shell.tsx", [
		// Pathless: the feed list stays mounted while an article fills the pane.
		layout("routes/home.tsx", [
			index("routes/home.index.tsx"),
			route("article/:id", "routes/article.tsx"),
		]),
		route("discover", "routes/discover.tsx"),
		// Static `discover/rss` outranks the dynamic `discover/:slug` below.
		route("discover/rss", "routes/discover.rss.tsx"),
		route("discover/source/:kind", "routes/discover.source.tsx"),
		route("discover/:slug", "routes/discover.category.tsx"),
	]),
	route("style-guide", "routes/style-guide.tsx"),
	route("set-theme", "routes/set-theme.ts"),
	route("set-layout", "routes/set-layout.ts"),
] satisfies RouteConfig;
