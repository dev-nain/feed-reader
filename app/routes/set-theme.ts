import { data } from "react-router";
import { isTheme } from "~/lib/theme";
import { serializeTheme } from "~/lib/theme.server";
import type { Route } from "./+types/set-theme";

/*
 * Resource route (no default export). ThemeToggle posts here via a fetcher; the
 * root loader revalidates afterward and re-renders <html> with the new class.
 * Single enum field — the isTheme guard is the validation; no Zod needed yet.
 */
export async function action({ request }: Route.ActionArgs) {
	const form = await request.formData();
	const theme = form.get("theme");

	if (!isTheme(theme)) {
		return data({ error: "Invalid theme" }, { status: 400 });
	}

	return data(null, {
		headers: { "Set-Cookie": await serializeTheme(theme) },
	});
}
