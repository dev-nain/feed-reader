import { type RouterContextProvider, redirect } from "react-router";
import { cloudflareContext, viewerContext } from "~/context";
import {
	createSessionClient,
	type SessionClient,
} from "~/lib/supabase/session.server";

/*
 * Who is asking. Resolved once per request by the root middleware, then read
 * everywhere with `getViewer(context)` — no route re-derives identity.
 *
 * Two branches, because the app has two kinds of reader from day one. A guest
 * is not a degraded user: they hold the same client with no session, which is
 * the `anon` role, which has no write policy on any table. Guest mode is
 * unwritable by construction rather than by an `if` somewhere.
 *
 * Step 1 adds the guest's cookie-backed state to the `guest` branch. Nothing
 * else about this shape moves.
 */

interface ViewerBase extends Pick<SessionClient, "supabase" | "commit"> {}

export interface UserViewer extends ViewerBase {
	kind: "user";
	userId: string;
	email: string | null;
}

export interface GuestViewer extends ViewerBase {
	kind: "guest";
}

export type Viewer = UserViewer | GuestViewer;

/**
 * Build the request's viewer.
 *
 * Identity comes from `getClaims()`, which verifies the JWT signature — against
 * the project's published keys, locally and without a network call, when the
 * project uses asymmetric signing keys. `getSession()` would parse the same
 * cookie without verifying it, and is never trustworthy on the server.
 *
 * A malformed or expired token makes a guest, not a 500: a bad cookie should
 * land someone on the public dashboard, not an error page.
 */
export async function resolveViewer(
	request: Request,
	context: Readonly<RouterContextProvider>,
): Promise<Viewer> {
	const { env } = context.get(cloudflareContext);
	const { supabase, commit } = createSessionClient(request, env);

	const { data, error } = await supabase.auth.getClaims();

	if (error || !data?.claims?.sub) {
		return { kind: "guest", supabase, commit };
	}

	return {
		kind: "user",
		// `sub` off the *verified* claims. Nothing here reads user_metadata,
		// which is user-editable and therefore never an authorization input.
		userId: data.claims.sub,
		email: typeof data.claims.email === "string" ? data.claims.email : null,
		supabase,
		commit,
	};
}

/** The accessor every loader and action uses. */
export function getViewer(context: Readonly<RouterContextProvider>): Viewer {
	return context.get(viewerContext);
}

/**
 * Narrow to a signed-in viewer or bounce to sign-in, remembering where they
 * were headed. Steps 4-6 are the real customers; today only `/reset-password`
 * calls it.
 */
export function requireUser(viewer: Viewer, request: Request): UserViewer {
	if (viewer.kind === "user") return viewer;

	const { pathname, search } = new URL(request.url);
	throw redirect(`/sign-in?next=${encodeURIComponent(pathname + search)}`);
}
