import { Loader2 } from "lucide-react";
import { cn } from "~/lib/utils";

export interface SpinnerProps extends React.ComponentProps<"span"> {
	/** Accessible label announced to screen readers. */
	label?: string;
}

export function Spinner({
	className,
	label = "Loading",
	...props
}: SpinnerProps) {
	return (
		<span role="status" className={cn("inline-flex", className)} {...props}>
			<Loader2 className="size-5 animate-spin text-text-tertiary" aria-hidden />
			<span className="sr-only">{label}</span>
		</span>
	);
}
