import { index, type RouteConfig, route } from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),
	route("set-theme", "routes/set-theme.ts"),
] satisfies RouteConfig;
