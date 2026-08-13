import { createRequestHandler, RouterContextProvider } from "react-router";
import { cloudflareContext } from "../app/context";

const requestHandler = createRequestHandler(
	() => import("virtual:react-router/server-build"),
	import.meta.env.MODE,
);

export default {
	async fetch(request, env, ctx) {
		// Seed the request context before React Router sees it. This is the only
		// route by which `env` (and therefore every secret) and `ctx.waitUntil`
		// reach a loader or action — configuration read through `import.meta.env`
		// would be inlined into the build instead (AGENTS.md §7).
		const context = new RouterContextProvider();
		context.set(cloudflareContext, { env, ctx });

		return requestHandler(request, context);
	},
} satisfies ExportedHandler<Env>;
