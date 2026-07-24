import { cn } from "~/lib/utils";

/** Pulsing placeholder for content that is still loading. */
export function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			aria-hidden
			className={cn("animate-pulse rounded-md bg-bg-tertiary", className)}
			{...props}
		/>
	);
}
