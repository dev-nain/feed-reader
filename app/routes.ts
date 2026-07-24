import {
	index,
	layout,
	type RouteConfig,
	route,
} from "@react-router/dev/routes";

export default [
	layout("routes/app-shell.tsx", [index("routes/home.tsx")]),
	route("style-guide", "routes/style-guide.tsx"),
	route("set-theme", "routes/set-theme.ts"),
	route("set-layout", "routes/set-layout.ts"),
] satisfies RouteConfig;
