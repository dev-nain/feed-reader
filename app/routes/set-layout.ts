import { data } from "react-router";
import { isLayout } from "~/lib/layout";
import { serializeLayout } from "~/lib/layout.server";
import type { Route } from "./+types/set-layout";

/*
 * Resource route (no default export). The feed toolbar posts here via a fetcher;
 * the home loader revalidates afterward and re-renders with the new layout.
 * Single enum field — the isLayout guard is the validation; no Zod needed yet.
 */
export async function action({ request }: Route.ActionArgs) {
	const form = await request.formData();
	const layout = form.get("layout");

	if (!isLayout(layout)) {
		return data({ error: "Invalid layout" }, { status: 400 });
	}

	return data(null, {
		headers: { "Set-Cookie": await serializeLayout(layout) },
	});
}
