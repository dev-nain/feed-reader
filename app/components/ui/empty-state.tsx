import type { LucideIcon } from "lucide-react";
import { cn } from "~/lib/utils";

export interface EmptyStateProps extends React.ComponentProps<"div"> {
	icon?: LucideIcon;
	title: string;
	description?: string;
	/** Optional call-to-action, e.g. an "Add feed" button. */
	action?: React.ReactNode;
}

export function EmptyState({
	icon: Icon,
	title,
	description,
	action,
	className,
	...props
}: EmptyStateProps) {
	return (
		<div
			className={cn(
				"flex flex-col items-center justify-center gap-3 px-6 py-12 text-center",
				className,
			)}
			{...props}
		>
			{Icon && (
				<span className="flex size-12 items-center justify-center rounded-full bg-bg-tertiary text-text-tertiary">
					<Icon className="size-6" aria-hidden />
				</span>
			)}
			<div className="flex flex-col gap-1">
				<h3 className="text-lg font-semibold text-text-primary">{title}</h3>
				{description && (
					<p className="max-w-sm text-sm text-text-secondary">{description}</p>
				)}
			</div>
			{action && <div className="mt-2">{action}</div>}
		</div>
	);
}
