import { redirect } from "react-router";
import { AFTER_SIGN_IN } from "~/lib/auth/destinations";
import { safeNext } from "~/lib/auth/redirect";
import { getViewer } from "~/lib/viewer/viewer.server";
import type { Route } from "./+types/auth.oauth";

/*
 * Starts the GitHub OAuth handshake. Resource route, action only.
 *
 * `skipBrowserRedirect` keeps the redirect ours: the SDK hands back the
 * authorize URL instead of navigating, which matters because generating it also
 * mints a PKCE code verifier that the SDK writes as a cookie. That cookie only
 * reaches the browser through the root middleware's flush, so the response has
 * to be one we return.
 *
 * The far end of the handshake is `/auth/callback`, unchanged: GitHub sends the
 * user back with a `?code=` exactly as the email links do.
 */

const PROVIDERS = ["github"] as const;
type Provider = (typeof PROVIDERS)[number];

function isProvider(value: unknown): value is Provider {
	return typeof value === "string" && PROVIDERS.includes(value as Provider);
}

export async function action({ request, context }: Route.ActionArgs) {
	const form = await request.formData();
	const provider = form.get("provider");

	if (!isProvider(provider)) {
		throw new Response("Unsupported provider", { status: 400 });
	}

	// Re-validated here rather than trusted from the hidden field.
	const next = safeNext(String(form.get("next") ?? "")) ?? AFTER_SIGN_IN;

	const { supabase } = getViewer(context);
	const { data, error } = await supabase.auth.signInWithOAuth({
		provider,
		options: {
			redirectTo: new URL(
				`/auth/callback?next=${encodeURIComponent(next)}`,
				request.url,
			).toString(),
			skipBrowserRedirect: true,
		},
	});

	// Provider not configured, or the Auth server refused. The message stays
	// generic; the specifics are ours, not the visitor's problem.
	if (error || !data?.url) throw redirect("/sign-in?error=oauth");

	throw redirect(data.url);
}

/** Nothing to render, and a GET must not start a handshake. */
export function loader() {
	throw new Response("Method Not Allowed", {
		status: 405,
		headers: { Allow: "POST" },
	});
}
