import { LogOut, UserPlus } from "lucide-react";
import { useRef } from "react";
import { Form, Link } from "react-router";
import { buttonVariants } from "~/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { cn } from "~/lib/utils";

export interface ViewerSummary {
	kind: "user" | "guest";
	email?: string | null;
}

/** Up to two letters from the email's local part: `ada.love@x.com` → `AL`. */
function initials(email: string | null | undefined): string {
	const local = email?.split("@")[0] ?? "";
	const parts = local.split(/[._-]+/).filter(Boolean);

	if (parts.length === 0) return "?";
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return (parts[0][0] + parts[1][0]).toUpperCase();
}

/**
 * The account control in the header and the sidebar.
 *
 * Signed in: an avatar opening a menu with the address and a sign-out. Signing
 * out is a POST — see `routes/auth.sign-out.ts` for why that matters.
 *
 * Guest: a real pair of calls to action rather than one ghost-styled link.
 * Below `lg` the sidebar — and with it `GuestPanel` — is not rendered at all,
 * so this is the *only* place a guest on a phone is offered an account. "Sign
 * in" folds away on the narrowest screens; the sign-up page links back to it.
 */
export function AccountMenu({
	viewer,
	className,
}: {
	viewer: ViewerSummary;
	className?: string;
}) {
	const signOut = useRef<HTMLFormElement>(null);

	if (viewer.kind === "guest") {
		return (
			<div className="flex items-center gap-1">
				<Link
					to="/sign-in"
					className={cn(
						buttonVariants({ variant: "ghost", size: "sm" }),
						// Below `sm` the header is brand + two icon buttons + this
						// pair; dropping the secondary action keeps it off one line.
						"hidden sm:inline-flex",
					)}
				>
					Sign in
				</Link>
				<Link
					to="/sign-up"
					className={cn(buttonVariants({ variant: "primary", size: "sm" }))}
				>
					Sign up
				</Link>
			</div>
		);
	}

	const label = viewer.email ?? "your account";

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger
					aria-label={`Account: ${label}`}
					className={cn(
						"grid size-8 shrink-0 place-items-center rounded-full bg-accent text-xs font-semibold text-white outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary",
						className,
					)}
				>
					{initials(viewer.email)}
				</DropdownMenuTrigger>

				<DropdownMenuContent align="end">
					<DropdownMenuLabel className="normal-case tracking-normal">
						<span className="block truncate text-sm font-medium text-text-primary">
							{label}
						</span>
					</DropdownMenuLabel>

					<DropdownMenuSeparator />

					<DropdownMenuItem onSelect={() => signOut.current?.requestSubmit()}>
						<LogOut className="size-4" aria-hidden />
						Sign out
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{/*
			 * The menu item submits this rather than being a link: sign-out must be
			 * a POST. Kept outside the dropdown because Radix unmounts the menu's
			 * contents on select, which would remove the form mid-submit.
			 */}
			<Form ref={signOut} method="post" action="/sign-out" className="hidden" />
		</>
	);
}

/**
 * The sidebar's sign-up prompt.
 *
 * Core #11 asks for a gentle prompt rather than gating, which is a statement
 * about *frequency and interruption*, not about visibility — it earns a panel
 * with a real button, but only one, and never a modal or an interstitial. It
 * names what an account keeps, because "sign up" alone answers nothing.
 */
export function GuestPanel() {
	return (
		<div className="rounded-lg border border-accent/20 bg-accent-subtle p-3">
			<p className="flex items-center gap-1.5 text-sm font-semibold text-text-primary">
				<UserPlus className="size-4 text-accent" aria-hidden />
				Browsing as a guest
			</p>

			<p className="mt-1 text-xs leading-normal text-text-secondary">
				Sign up to keep your feeds, saved articles and read history across
				devices.
			</p>

			<Link
				to="/sign-up"
				className={cn(
					buttonVariants({ variant: "primary", size: "sm" }),
					"mt-3 w-full",
				)}
			>
				Create free account
			</Link>

			<p className="mt-2 text-center text-xs text-text-secondary">
				Already have one?{" "}
				<Link
					to="/sign-in"
					className="rounded-sm font-medium text-accent outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent"
				>
					Sign in
				</Link>
			</p>
		</div>
	);
}
