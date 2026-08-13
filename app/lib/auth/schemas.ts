import { z } from "zod";

/*
 * Validation for the four auth forms — the trust boundary between a browser and
 * Supabase (AGENTS.md §5).
 *
 * Messages are the ones users read, so they say what to do rather than which
 * rule failed ("Enter a password of at least 8 characters", not "too_small").
 */

/** Must match `minimum_password_length` in supabase/config.toml. */
export const MIN_PASSWORD_LENGTH = 8;

// Trim first, then check the format: `z.email()` applies its format check
// before any `.trim()` chained onto it, so " you@example.com " would fail.
// Piping makes the order explicit. (`.email()` on a string is deprecated in
// Zod 4 in favour of the top-level `z.email()`.)
const email = z
	.string()
	.trim()
	.min(1, "Enter your email address.")
	.max(320, "That email address is too long.")
	.pipe(z.email("Enter a valid email address, like you@example.com."));

const password = z
	.string()
	.min(
		MIN_PASSWORD_LENGTH,
		`Enter a password of at least ${MIN_PASSWORD_LENGTH} characters.`,
	)
	// Supabase rejects anything longer; catching it here gives a better message.
	.max(72, "Passwords can be at most 72 characters.");

export const signInSchema = z.object({
	email,
	// Not `password` — an old account may predate the current rule, and telling
	// someone their existing password is "too short" at sign-in is nonsense.
	password: z.string().min(1, "Enter your password."),
});

export const signUpSchema = z.object({ email, password });

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z
	.object({ password, confirmPassword: z.string() })
	.refine((values) => values.password === values.confirmPassword, {
		message: "Both passwords must match.",
		path: ["confirmPassword"],
	});

/** Field errors keyed by input name, as the forms render them. */
export type FieldErrors = Record<string, string | undefined>;

/**
 * First error per field. Zod reports every failure; a form shows one per input,
 * and the first is the one the user should fix first.
 */
export function toFieldErrors(error: z.ZodError): FieldErrors {
	const errors: FieldErrors = {};

	for (const issue of error.issues) {
		const key = issue.path[0];
		if (typeof key === "string" && !errors[key]) {
			errors[key] = issue.message;
		}
	}

	return errors;
}
