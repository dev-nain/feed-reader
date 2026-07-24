import { createCookie } from "react-router";
import { isTheme, type Theme } from "./theme";

/*
 * Session cookie for the theme preference — no maxAge, so it clears when the
 * browser closes. ponytail: add `maxAge: 60 * 60 * 24 * 365` here to persist
 * the choice across restarts if that's wanted.
 */
const themeCookie = createCookie("fp_theme", {
	path: "/",
	sameSite: "lax",
	httpOnly: false,
});

/** Read the theme preference from the request, or null to follow the OS. */
export async function getTheme(request: Request): Promise<Theme | null> {
	const value = await themeCookie.parse(request.headers.get("Cookie"));
	return isTheme(value) ? value : null;
}

/** Serialize a Set-Cookie header for the given theme. */
export function serializeTheme(theme: Theme): Promise<string> {
	return themeCookie.serialize(theme);
}
