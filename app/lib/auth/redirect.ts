/*
 * Open-redirect guard for the `?next=` parameter.
 *
 * `next` is attacker-supplied — it rides in on links we send by email and on
 * anything a user can be persuaded to click. Anything that is not plainly a
 * path on this origin is discarded rather than repaired.
 */

/**
 * Control characters (below 0x20, plus DEL) can smuggle a line break into a
 * Location header. Checked by code point rather than by regex so the source
 * carries no literal control bytes of its own.
 */
function hasControlCharacter(value: string): boolean {
	for (let i = 0; i < value.length; i++) {
		const code = value.charCodeAt(i);
		if (code < 0x20 || code === 0x7f) return true;
	}
	return false;
}

/**
 * A safe same-origin destination, or null.
 *
 * Rejects: absolute URLs (`https://evil.example`), protocol-relative addresses
 * (`//evil.example`), backslash variants that some parsers treat as slashes
 * (`/\evil.example`), and anything not starting with a single `/`.
 */
export function safeNext(value: string | null | undefined): string | null {
	if (!value) return null;
	if (!value.startsWith("/")) return null;
	if (value.startsWith("//") || value.startsWith("/\\")) return null;
	if (hasControlCharacter(value)) return null;
	return value;
}
