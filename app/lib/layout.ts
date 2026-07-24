/** Feed layout preference. */
export type Layout = "list" | "grid" | "compact";

export const LAYOUTS: Layout[] = ["list", "grid", "compact"];
export const DEFAULT_LAYOUT: Layout = "list";

export function isLayout(value: unknown): value is Layout {
	return value === "list" || value === "grid" || value === "compact";
}
