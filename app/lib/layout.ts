/** Feed column density. The reading pane beside it is structural, not a view. */
export type Layout = "list" | "compact";

export const LAYOUTS: Layout[] = ["list", "compact"];
export const DEFAULT_LAYOUT: Layout = "list";

export function isLayout(value: unknown): value is Layout {
	return value === "list" || value === "compact";
}
