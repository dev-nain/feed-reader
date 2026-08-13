import { createContext } from "react-router";
import type { Viewer } from "~/lib/viewer/viewer.server";

/*
 * Request-scoped values seeded once and read everywhere.
 *
 * `cloudflareContext` is set by the Worker's fetch handler (workers/app.ts).
 * It is the only path to `env` — reading configuration through
 * `import.meta.env` would inline secrets into the build (AGENTS.md §7).
 *
 * `viewerContext` is set by the root middleware. Loaders read it with
 * `getViewer(context)` rather than re-deriving identity per route.
 */

export const cloudflareContext = createContext<{
	env: Env;
	ctx: ExecutionContext;
}>();

export const viewerContext = createContext<Viewer>();
