import {
	type CookieOptions,
	createServerClient,
	parseCookieHeader,
	serializeCookieHeader,
} from "@supabase/ssr";

/*
 * The Supabase client for a single request, bound to that request's cookies.
 *
 * Reads and writes run as whoever the cookies say — `authenticated` under RLS
 * when signed in, `anon` when not. There is no second client here: the
 * service-role client arrives in step 3 with its first caller.
 *
 * Cookies written by the SDK are *collected*, not applied. The library reports
 * them through `setAll` at whatever moment it refreshes a token, which is
 * usually deep inside a loader with no response in hand. `commit()` puts them on
 * the response, and the root middleware is the single place that calls it —
 * see the middleware in `app/root.tsx`.
 */

interface PendingCookie {
	name: string;
	value: string;
	options: CookieOptions;
}

export interface SessionClient {
	supabase: ReturnType<typeof createServerClient>;
	/** Applies collected auth cookies and their cache headers to a response. */
	commit(response: Response): void;
}

export function createSessionClient(request: Request, env: Env): SessionClient {
	const pending: PendingCookie[] = [];
	// Supabase sends `Cache-Control: private, no-store`-style headers alongside
	// any response that sets auth cookies. Dropping them would let a CDN serve
	// one visitor's session to the next — worth more here than most places,
	// since this app is served from Cloudflare's edge.
	const cacheHeaders: Record<string, string> = {};

	const supabase = createServerClient(
		env.VITE_SUPABASE_URL,
		env.VITE_SUPABASE_PUBLISHABLE_KEY,
		{
			cookieOptions: {
				// The SDK leaves httpOnly unset, because a browser-side Supabase
				// client has to be able to read these. This app has none — all auth
				// runs in actions — so the token can be closed to scripts entirely,
				// which takes the session out of reach of any XSS.
				httpOnly: true,
				sameSite: "lax",
				path: "/",
				// Keyed off the app's own origin, not Supabase's: `secure` cookies
				// are dropped over plain http, which is what the dev server speaks.
				secure: new URL(request.url).protocol === "https:",
			},
			cookies: {
				getAll: () => parseCookieHeader(request.headers.get("Cookie") ?? ""),
				setAll: (cookiesToSet, headers) => {
					pending.push(...cookiesToSet);
					Object.assign(cacheHeaders, headers);
				},
			},
		},
	);

	function commit(response: Response) {
		for (const { name, value, options } of pending) {
			// `append`, never `set`: an auth session spans several chunked cookies
			// (`...auth-token.0`, `.1`, …) and each needs its own Set-Cookie line.
			response.headers.append(
				"Set-Cookie",
				serializeCookieHeader(name, value, options),
			);
		}

		for (const [name, value] of Object.entries(cacheHeaders)) {
			response.headers.set(name, value);
		}
	}

	return { supabase, commit };
}
