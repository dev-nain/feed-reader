import { createCookie } from "react-router";
import { DEFAULT_LAYOUT, isLayout, type Layout } from "./layout";

/*
 * Session cookie for the feed layout preference — no maxAge, so it clears when
 * the browser closes. ponytail: add `maxAge` here to persist across restarts.
 */
const layoutCookie = createCookie("fp_layout", {
	path: "/",
	sameSite: "lax",
	httpOnly: false,
});

/** Read the layout preference from the request, falling back to the default. */
export async function getLayout(request: Request): Promise<Layout> {
	const value = await layoutCookie.parse(request.headers.get("Cookie"));
	return isLayout(value) ? value : DEFAULT_LAYOUT;
}

/** Serialize a Set-Cookie header for the given layout. */
export function serializeLayout(layout: Layout): Promise<string> {
	return layoutCookie.serialize(layout);
}
