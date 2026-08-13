import { ArrowLeft, Check, Rss } from "lucide-react";
import { Link } from "react-router";

/*
 * Shell for the four auth pages: a form card, and beside it a panel saying what
 * an account is for.
 *
 * The panel's copy is all load-bearing and all true — the value propositions
 * from `spec/product-definition.md` and the actual size of the curated corpus
 * in `data/`. No user counts, ratings or testimonials: this is a portfolio
 * build, and invented social proof would be a lie printed on the product.
 */

export interface CrossLink {
	prompt: string;
	to: string;
	label: string;
}

const REASONS = [
	"Blogs, newsletters and changelogs in one calm, reverse-chronological feed",
	"Categories keep frontend, design, backend and AI from drowning each other out",
	"Save what you can't read now, and pick it up on any device",
];

/** The card alone. Also the width below `lg`, where the panel is not rendered. */
const CARD_COLUMN = "mx-auto w-full max-w-[25rem]";

/**
 * Card plus panel: 25rem + 1.25rem gap + 19rem. Applied only when there is a
 * panel to fill the second track — a lone card in a 45.25rem column sits in the
 * first one, left of centre, which is not centred at all.
 */
const WIDE_COLUMN = `${CARD_COLUMN} lg:max-w-[45.25rem]`;

/** The top bar rides wider than the content, so the brand is not boxed in. */
const HEADER_COLUMN = "mx-auto w-full max-w-6xl";

export function AuthLayout({
	title,
	description,
	children,
	crossLink,
	aside = true,
}: {
	title: string;
	description?: string;
	children: React.ReactNode;
	/** Route to the opposite flow. Rendered in the header and under the card. */
	crossLink?: CrossLink;
	/** The value panel. Off for the single-purpose password pages. */
	aside?: boolean;
}) {
	return (
		<div className="relative flex min-h-dvh flex-col overflow-hidden bg-bg-primary">
			<AmbientBackdrop />

			{/*
			 * Brand only. The cross-link used to sit up here as well, which put the
			 * one bit of navigation someone might actually want as far from the form
			 * as the viewport allows — and duplicated it once the card grew its own.
			 */}
			<header className="relative shrink-0 px-4 py-5 sm:px-6">
				<div className={HEADER_COLUMN}>
					<Link
						to="/"
						viewTransition
						className="inline-flex items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-accent"
					>
						<span
							aria-hidden
							className="grid size-7 place-items-center rounded-md bg-accent text-white"
						>
							<Rss className="size-4" />
						</span>
						<span className="text-lg font-semibold text-text-primary">
							Frontpage
						</span>
					</Link>
				</div>
			</header>

			<main className="relative flex flex-1 items-center px-4 py-8 sm:px-6">
				<div className={aside ? WIDE_COLUMN : CARD_COLUMN}>
					{/*
					 * The two-track template only exists when there is a panel. Left
					 * declared unconditionally it still applies at `lg`, and both
					 * tracks compress into the narrower column — the card collapses to
					 * about 190px and the heading wraps mid-phrase.
					 */}
					<div
						className={
							aside
								? "grid items-stretch gap-5 lg:grid-cols-[minmax(0,25rem)_minmax(0,19rem)]"
								: "grid gap-5"
						}
					>
						<div className="fp-enter flex flex-col">
							<section className="rounded-xl border border-border bg-surface p-6 shadow-lg sm:p-8">
								<div className="text-center">
									<h1 className="text-xl font-semibold text-text-primary">
										{title}
									</h1>
									{description && (
										<p className="mt-1 text-sm text-text-secondary">
											{description}
										</p>
									)}
								</div>

								<div className="mt-6">{children}</div>
							</section>

							{/*
							 * Repeated here, not only in the header: on a wide screen the
							 * header copy is most of a metre away from the form someone
							 * is actually looking at, which is what made it read as
							 * unrelated chrome.
							 */}
							{crossLink && (
								<p className="mt-5 text-center text-sm text-text-secondary">
									{crossLink.prompt}{" "}
									<Link to={crossLink.to} viewTransition className={AUTH_LINK}>
										{crossLink.label}
									</Link>
								</p>
							)}
						</div>

						{aside && <ValuePanel />}
					</div>
				</div>
			</main>
		</div>
	);
}

/**
 * Back link for the pages that are a detour rather than a destination.
 * An arrow because this is navigation, not a suggestion.
 */
export function BackLink({ to, children }: { to: string; children: string }) {
	return (
		<Link
			to={to}
			viewTransition
			className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-text-secondary outline-none transition-colors hover:text-text-primary focus-visible:ring-2 focus-visible:ring-accent"
		>
			<ArrowLeft className="size-4" aria-hidden />
			{children}
		</Link>
	);
}

/**
 * The panel beside the form.
 *
 * Fixed brand colours rather than `bg-accent`: the accent token lightens to
 * #58A6FF in dark mode, where white body text on it fails contrast. These two
 * stops carry white at 8:1 or better in either theme.
 */
function ValuePanel() {
	return (
		<aside className="fp-enter-2 hidden flex-col rounded-xl bg-linear-to-br from-[#2563eb] to-[#4f46e5] p-6 text-white lg:flex">
			<p className="text-xs font-semibold uppercase tracking-wide text-white/70">
				Why Frontpage
			</p>

			<p className="mt-3 text-sm font-medium leading-relaxed">
				Keeping up with tech is scattered across bookmarks, inboxes and
				half-remembered links. This is one place for all of it.
			</p>

			<ul className="mt-6 flex flex-col gap-4">
				{REASONS.map((reason) => (
					<li key={reason} className="flex gap-2.5">
						<Check
							className="mt-0.5 size-4 shrink-0 text-white/80"
							aria-hidden
						/>
						<span className="text-sm leading-normal text-white/90">
							{reason}
						</span>
					</li>
				))}
			</ul>

			{/*
			 * Where a marketing page would put a testimonial. Guest mode is the
			 * genuinely persuasive thing we have, and it is true (Core #11).
			 */}
			<div className="mt-auto pt-8">
				<p className="text-sm leading-normal text-white/80">
					Not ready to sign up? Browse{" "}
					<Link
						to="/"
						viewTransition
						className="rounded-sm font-semibold text-white underline underline-offset-2 outline-none focus-visible:ring-2 focus-visible:ring-white"
					>
						19 curated feeds
					</Link>{" "}
					across 5 categories as a guest — no account needed.
				</p>
			</div>
		</aside>
	);
}

/** Soft colour wash behind the page. Decorative, and never in the a11y tree. */
function AmbientBackdrop() {
	return (
		<div
			aria-hidden
			className="fp-ambient pointer-events-none absolute inset-0 -z-0"
		/>
	);
}

/** Inline link styling shared by the footers and the "forgot password" link. */
export const AUTH_LINK =
	"rounded-sm font-medium text-accent outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent";

/** Form-level failure. Announced, and never field-specific. */
export function FormError({ children }: { children: React.ReactNode }) {
	return (
		<p
			role="alert"
			className="mb-4 rounded-md bg-error/10 px-3 py-2 text-sm text-error"
		>
			{children}
		</p>
	);
}
