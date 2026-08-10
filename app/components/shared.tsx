import { Share2, Star } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "~/components/ui/tooltip";
import { sourceColor } from "~/lib/mock-feed";
import { cn } from "~/lib/utils";

/** Shown on hover or keyboard focus (always visible on touch, which lacks hover). */
export const REVEAL =
	"opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 max-sm:opacity-100";

/** Wraps a single ref-forwarding trigger (Button / <button>) with a Radix tooltip. */
export function WithTooltip({
	label,
	children,
}: {
	label: string;
	children: React.ReactElement;
}) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>{children}</TooltipTrigger>
			<TooltipContent>{label}</TooltipContent>
		</Tooltip>
	);
}

/**
 * Letter tile standing in for a source favicon (no network in mock UI).
 *
 * Neutral by default: a per-source hue carries no information, and a dozen of
 * them in a list drown out the unread dot, which does. `tone="color"` is for
 * places showing a single source, where the hue reads as identity not noise.
 */
export function SourceMark({
	name,
	className,
	tone = "neutral",
}: {
	name: string;
	className?: string;
	/** `bare` drops the tile entirely — just the initial, for dense lists. */
	tone?: "neutral" | "color" | "bare";
}) {
	return (
		<span
			aria-hidden
			className={cn(
				"grid size-5 shrink-0 place-items-center rounded-[0.3rem] text-[0.6rem] font-semibold",
				tone === "color" && cn("text-white", sourceColor(name)),
				tone === "neutral" && "bg-bg-tertiary text-text-secondary",
				tone === "bare" && "text-text-tertiary",
				className,
			)}
		>
			{name.charAt(0)}
		</span>
	);
}

// ponytail: star/share are presentational — wire actions when starring lands.
export function ItemActions({
	title,
	className,
	buttonClassName,
}: {
	title: string;
	className?: string;
	buttonClassName?: string;
}) {
	return (
		<div className={cn("flex gap-1", className)}>
			<WithTooltip label="Star">
				<Button
					variant="ghost"
					size="icon"
					className={buttonClassName}
					aria-label={`Star "${title}"`}
				>
					<Star />
				</Button>
			</WithTooltip>
			<WithTooltip label="Share">
				<Button
					variant="ghost"
					size="icon"
					className={buttonClassName}
					aria-label={`Share "${title}"`}
				>
					<Share2 />
				</Button>
			</WithTooltip>
		</div>
	);
}

export function UnreadDot({
	read,
	className,
}: {
	read: boolean;
	className?: string;
}) {
	return (
		<span
			aria-hidden
			className={cn(
				"size-2 shrink-0 rounded-full",
				read ? "bg-transparent" : "bg-unread",
				className,
			)}
		/>
	);
}
