import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";
import { cn } from "~/lib/utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				primary: "bg-accent text-white hover:bg-accent-hover",
				secondary: "bg-bg-tertiary text-text-primary hover:bg-border-subtle",
				outline:
					"border border-border bg-surface text-text-primary hover:bg-bg-tertiary",
				ghost:
					"text-text-secondary hover:bg-bg-tertiary hover:text-text-primary",
				destructive: "bg-error text-white hover:opacity-90",
			},
			size: {
				sm: "h-8 px-3 text-sm [&_svg]:size-4",
				md: "h-10 px-4 text-sm [&_svg]:size-4",
				lg: "h-11 px-6 text-base [&_svg]:size-5",
				icon: "size-10 [&_svg]:size-5",
			},
		},
		defaultVariants: {
			variant: "primary",
			size: "md",
		},
	},
);

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, type = "button", ...props }, ref) => (
		<button
			ref={ref}
			type={type}
			className={cn(buttonVariants({ variant, size }), className)}
			{...props}
		/>
	),
);
Button.displayName = "Button";

export { buttonVariants };
