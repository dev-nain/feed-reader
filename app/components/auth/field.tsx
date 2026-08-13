import { Eye, EyeOff } from "lucide-react";
import { useId, useState } from "react";
import { Input, type InputProps } from "~/components/ui/input";
import { cn } from "~/lib/utils";

/*
 * A labelled input with its error message wired to it.
 *
 * The label is always visible: `guidance/accessibility.md` §Forms rules out
 * placeholder-as-label. The error is tied to the input with `aria-describedby`
 * so a screen reader reaches it from the field rather than by hunting.
 */
export function Field({
	id,
	label,
	error,
	required,
	className,
	children,
	...props
}: InputProps & { id: string; label: string; error?: string }) {
	const errorId = `${id}-error`;

	return (
		<div>
			<label
				htmlFor={id}
				className="mb-1.5 block text-sm font-medium text-text-primary"
			>
				{label}
			</label>

			<div className="relative">
				<Input
					id={id}
					name={id}
					required={required}
					// Stated programmatically as well as enforced, per the checklist.
					aria-required={required ? true : undefined}
					aria-invalid={error ? true : undefined}
					aria-describedby={error ? errorId : undefined}
					className={className}
					{...props}
				/>
				{children}
			</div>

			{error && (
				<p id={errorId} className="mt-1.5 text-sm text-error">
					{error}
				</p>
			)}
		</div>
	);
}

/**
 * A password field with a reveal toggle.
 *
 * Typing a password you cannot see is the main reason people mistype one, and
 * the toggle is a button so it is reachable by keyboard. It reports state
 * through `aria-pressed` rather than by swapping the label out from under a
 * screen reader mid-interaction.
 */
export function PasswordField({
	id,
	label,
	error,
	required,
	autoComplete = "current-password",
	...props
}: Omit<InputProps, "type"> & {
	id: string;
	label: string;
	error?: string;
}) {
	const [revealed, setRevealed] = useState(false);
	const hintId = useId();

	return (
		<Field
			id={id}
			label={label}
			error={error}
			required={required}
			autoComplete={autoComplete}
			type={revealed ? "text" : "password"}
			className="pr-11"
			aria-describedby={error ? undefined : hintId}
			{...props}
		>
			<button
				type="button"
				onClick={() => setRevealed((shown) => !shown)}
				aria-pressed={revealed}
				aria-label="Show password"
				aria-describedby={hintId}
				className={cn(
					"absolute right-1 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-md",
					"text-text-tertiary outline-none transition-colors",
					"hover:bg-bg-tertiary hover:text-text-secondary",
					"focus-visible:ring-2 focus-visible:ring-accent",
				)}
			>
				{revealed ? (
					<EyeOff className="size-4" aria-hidden />
				) : (
					<Eye className="size-4" aria-hidden />
				)}
			</button>
			<span id={hintId} className="sr-only">
				{revealed ? "Password is visible" : "Password is hidden"}
			</span>
		</Field>
	);
}
