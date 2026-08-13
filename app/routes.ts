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
	// Auth pages sit outside the shell: full-page, no sidebar, no top bar.
	route("sign-in", "routes/auth.sign-in.tsx"),
	route("sign-up", "routes/auth.sign-up.tsx"),
	route("forgot-password", "routes/auth.forgot-password.tsx"),
	route("reset-password", "routes/auth.reset-password.tsx"),
	route("auth/callback", "routes/auth.callback.ts"),
	route("auth/oauth", "routes/auth.oauth.ts"),
	route("sign-out", "routes/auth.sign-out.ts"),

	route("style-guide", "routes/style-guide.tsx"),
	route("set-theme", "routes/set-theme.ts"),
	route("set-layout", "routes/set-layout.ts"),
] satisfies RouteConfig;
