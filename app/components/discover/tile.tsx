import type { LucideIcon } from "lucide-react";
import { Link } from "react-router";
import { cn } from "~/lib/utils";

export interface TileProps {
	icon: LucideIcon;
	label: string;
	/** Secondary line, e.g. "6 feeds". Carries meaning colour alone can't. */
	meta?: string;
	/** Colour classes for the icon square, e.g. `bg-accent-subtle text-accent`. */
	iconClassName?: string;
	/** Omitted when `disabled` — a dead tile must not be a link. */
	to?: string;
	disabled?: boolean;
	/** Sits under the label, e.g. a "Soon" badge. */
	badge?: React.ReactNode;
}

const SHELL =
	"flex min-h-18 items-center gap-3 rounded-lg border border-border bg-surface px-4 py-4 text-left outline-none transition-colors";

export function Tile({
	icon: Icon,
	label,
	meta,
	iconClassName,
	to,
	disabled,
	badge,
}: TileProps) {
	const body = (
		<>
			<span
				aria-hidden
				className={cn(
					"grid size-10 shrink-0 place-items-center rounded-md",
					iconClassName ?? "bg-bg-tertiary text-text-secondary",
				)}
			>
				<Icon className="size-5" />
			</span>

			<span className="flex min-w-0 flex-col gap-0.5">
				<span className="line-clamp-2 text-sm font-medium text-text-primary">
					{label}
				</span>
				{meta && <span className="text-xs text-text-tertiary">{meta}</span>}
				{badge && <span className="mt-0.5">{badge}</span>}
			</span>
		</>
	);

	if (disabled || !to) {
		return (
			<div aria-disabled className={cn(SHELL, "opacity-50")}>
				{body}
			</div>
		);
	}

	return (
		<Link
			to={to}
			className={cn(
				SHELL,
				"hover:bg-bg-tertiary focus-visible:ring-2 focus-visible:ring-accent",
			)}
		>
			{body}
		</Link>
	);
}
