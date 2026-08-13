import { redirect } from "react-router";
import { getViewer } from "~/lib/viewer/viewer.server";
import type { Route } from "./+types/auth.sign-out";

/*
 * Resource route, action only.
 *
 * POST rather than a link: a GET sign-out can be fired by any third-party page
 * that can get the browser to issue a request — an <img src="/sign-out"> is
 * enough — and logging someone out unbidden is a real, if minor, CSRF.
 */
export async function action({ context }: Route.ActionArgs) {
	const viewer = getViewer(context);

	// Signing out a guest is a no-op that still lands them on the dashboard.
	if (viewer.kind === "user") await viewer.supabase.auth.signOut();

	return redirect("/");
}

/** A direct GET is not a sign-out. */
export function loader() {
	throw new Response("Method Not Allowed", {
		status: 405,
		headers: { Allow: "POST" },
	});
}
