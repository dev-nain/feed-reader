import { redirect } from "react-router";
import { safeNext } from "~/lib/auth/redirect";
import { getViewer } from "~/lib/viewer/viewer.server";
import type { Route } from "./+types/auth.callback";

/*
 * Where every emailed link lands: signup confirmation and password recovery
 * both come back as a PKCE `?code=`, and both need the same exchange. Two
 * routes would be two copies of it.
 *
 * Resource route — no default export, nothing to render. The session it
 * establishes is written by the root middleware's cookie flush.
 */
export async function loader({ request, context }: Route.LoaderArgs) {
	const url = new URL(request.url);
	const code = url.searchParams.get("code");

	// `next` arrives from a link in an email, so it is untrusted input like any
	// other query parameter.
	const next = safeNext(url.searchParams.get("next")) ?? "/";

	if (!code) throw redirect("/sign-in?error=link-expired");

	const { supabase } = getViewer(context);
	const { error } = await supabase.auth.exchangeCodeForSession(code);

	// Expired, already used, or opened in a browser that never held the PKCE
	// verifier. All of them mean the same thing to the person reading it.
	if (error) throw redirect("/sign-in?error=link-expired");

	throw redirect(next);
}
