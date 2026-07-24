import { forwardRef } from "react";
import { cn } from "~/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
	({ className, type = "text", ...props }, ref) => (
		<input
			ref={ref}
			type={type}
			className={cn(
				"h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-text-primary outline-none transition-colors",
				"placeholder:text-text-tertiary",
				"focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary",
				"disabled:cursor-not-allowed disabled:opacity-50",
				// Style the invalid state from aria-invalid so callers drive it explicitly.
				"aria-[invalid=true]:border-error aria-[invalid=true]:focus-visible:ring-error",
				className,
			)}
			{...props}
		/>
	),
);
Input.displayName = "Input";
