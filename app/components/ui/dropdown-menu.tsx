import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check } from "lucide-react";
import { forwardRef } from "react";
import { cn } from "~/lib/utils";

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

/** Shared row shape for every selectable item. */
const ITEM =
	"relative flex cursor-default select-none items-center gap-2 rounded-md py-1.5 pl-8 pr-2 text-sm text-text-primary outline-none transition-colors focus:bg-bg-tertiary data-disabled:pointer-events-none data-disabled:opacity-50";

export const DropdownMenuContent = forwardRef<
	React.ComponentRef<typeof DropdownMenuPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 6, align = "start", ...props }, ref) => (
	<DropdownMenuPrimitive.Portal>
		<DropdownMenuPrimitive.Content
			ref={ref}
			sideOffset={sideOffset}
			align={align}
			className={cn(
				"z-50 min-w-48 rounded-lg border border-border bg-surface p-1 shadow-lg",
				className,
			)}
			{...props}
		/>
	</DropdownMenuPrimitive.Portal>
));
DropdownMenuContent.displayName = "DropdownMenuContent";

export const DropdownMenuLabel = forwardRef<
	React.ComponentRef<typeof DropdownMenuPrimitive.Label>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label>
>(({ className, ...props }, ref) => (
	<DropdownMenuPrimitive.Label
		ref={ref}
		className={cn(
			"px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-text-tertiary",
			className,
		)}
		{...props}
	/>
));
DropdownMenuLabel.displayName = "DropdownMenuLabel";

/**
 * A plain action row. Unlike the checkbox and radio items it has no indicator,
 * so it drops the left padding they reserve for one.
 */
export const DropdownMenuItem = forwardRef<
	React.ComponentRef<typeof DropdownMenuPrimitive.Item>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>
>(({ className, ...props }, ref) => (
	<DropdownMenuPrimitive.Item
		ref={ref}
		className={cn(ITEM, "pl-2", className)}
		{...props}
	/>
));
DropdownMenuItem.displayName = "DropdownMenuItem";

export const DropdownMenuSeparator = forwardRef<
	React.ComponentRef<typeof DropdownMenuPrimitive.Separator>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
	<DropdownMenuPrimitive.Separator
		ref={ref}
		className={cn("my-1 h-px bg-border", className)}
		{...props}
	/>
));
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

export const DropdownMenuCheckboxItem = forwardRef<
	React.ComponentRef<typeof DropdownMenuPrimitive.CheckboxItem>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, ...props }, ref) => (
	<DropdownMenuPrimitive.CheckboxItem
		ref={ref}
		className={cn(ITEM, className)}
		{...props}
	>
		<span className="absolute left-2 grid size-4 place-items-center">
			<DropdownMenuPrimitive.ItemIndicator>
				<Check className="size-4 text-accent" aria-hidden />
			</DropdownMenuPrimitive.ItemIndicator>
		</span>
		{children}
	</DropdownMenuPrimitive.CheckboxItem>
));
DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem";

export const DropdownMenuRadioItem = forwardRef<
	React.ComponentRef<typeof DropdownMenuPrimitive.RadioItem>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
	<DropdownMenuPrimitive.RadioItem
		ref={ref}
		className={cn(ITEM, className)}
		{...props}
	>
		<span className="absolute left-2 grid size-4 place-items-center">
			<DropdownMenuPrimitive.ItemIndicator>
				<span className="size-2 rounded-full bg-accent" aria-hidden />
			</DropdownMenuPrimitive.ItemIndicator>
		</span>
		{children}
	</DropdownMenuPrimitive.RadioItem>
));
DropdownMenuRadioItem.displayName = "DropdownMenuRadioItem";
