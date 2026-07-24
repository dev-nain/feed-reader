/** Explicit theme preference. `null` means "follow the OS" (no class forced). */
export type Theme = "light" | "dark";

export const THEMES: Theme[] = ["light", "dark"];

export function isTheme(value: unknown): value is Theme {
	return value === "light" || value === "dark";
}
