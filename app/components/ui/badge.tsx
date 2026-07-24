import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";

const badgeVariants = cva(
	"inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs font-medium [&_svg]:size-3",
	{
		variants: {
			variant: {
				default: "bg-bg-tertiary text-text-secondary",
				accent: "bg-accent-subtle text-accent",
				success: "bg-success/10 text-success",
				warning: "bg-warning/10 text-warning",
				error: "bg-error/10 text-error",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

export interface BadgeProps
	extends React.ComponentProps<"span">,
		VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
	return (
		<span className={cn(badgeVariants({ variant }), className)} {...props} />
	);
}

export { badgeVariants };
