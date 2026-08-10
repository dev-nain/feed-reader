import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";

/** Back arrow + "Add feed" eyebrow + title, shared by the Discover drill-downs. */
export function SubHeader({
	title,
	children,
}: {
	title: string;
	/** Trailing slot, e.g. a "Follow all" button. Wraps below on narrow screens. */
	children?: React.ReactNode;
}) {
	return (
		<div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-4 sm:px-6">
			<Link
				to="/discover"
				aria-label="Back to Discover"
				className="grid size-10 shrink-0 place-items-center rounded-md text-text-secondary outline-none transition-colors hover:bg-bg-tertiary hover:text-text-primary focus-visible:ring-2 focus-visible:ring-accent"
			>
				<ArrowLeft className="size-5" aria-hidden />
			</Link>

			<div className="flex min-w-0 flex-col">
				<span className="text-xs text-text-tertiary">Add feed</span>
				<h1 className="truncate text-xl font-semibold text-text-primary">
					{title}
				</h1>
			</div>

			{children && <div className="ml-auto">{children}</div>}
		</div>
	);
}
