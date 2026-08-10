import { Check, Copy, ExternalLink, Link2, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { data } from "react-router";
import { SubHeader } from "~/components/discover/sub-header";
import { Button } from "~/components/ui/button";
import { EmptyState } from "~/components/ui/empty-state";
import { Input } from "~/components/ui/input";
import { findSourceBuilder } from "~/lib/discover-sources";
import type { Route } from "./+types/discover.source";

export async function loader({ params }: Route.LoaderArgs) {
	const builder = findSourceBuilder(params.kind);
	if (!builder)
		throw data(null, { status: 404, statusText: "Source not found" });

	// `build` is a function and cannot cross the loader boundary; the component
	// looks it up again from the same module.
	return {
		source: {
			kind: builder.kind,
			label: builder.label,
			inputLabel: builder.inputLabel,
			placeholder: builder.placeholder,
			hint: builder.hint,
			external: builder.external,
		},
	};
}

export function meta({ loaderData }: Route.MetaArgs) {
	const label = loaderData?.source.label;
	return [
		{
			title: label ? `${label} — Discover — Frontpage` : "Add feed — Frontpage",
		},
		{
			name: "description",
			content: label ? `Build a ${label} feed address.` : "",
		},
	];
}

export default function DiscoverSource({ loaderData }: Route.ComponentProps) {
	const { source } = loaderData;
	const builder = findSourceBuilder(source.kind);

	const [value, setValue] = useState("");
	const [copied, setCopied] = useState(false);
	const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(
		() => () => {
			if (timer.current) clearTimeout(timer.current);
		},
		[],
	);

	// Derived during render — no effect, no memo.
	const entered = value.trim().length > 0;
	const url = builder?.build?.(value) ?? null;

	async function copy() {
		if (!url) return;
		try {
			await navigator.clipboard.writeText(url);
		} catch {
			return;
		}
		setCopied(true);
		if (timer.current) clearTimeout(timer.current);
		timer.current = setTimeout(() => setCopied(false), 2000);
	}

	return (
		<>
			<SubHeader title={source.label} />

			<main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
				{source.external ? (
					<div className="rounded-lg border border-border bg-surface p-5">
						<h2 className="mb-2 text-sm font-semibold text-text-primary">
							{source.label}
						</h2>
						{source.hint && (
							<p className="mb-4 text-sm text-text-secondary">{source.hint}</p>
						)}
						<a
							href={source.external.href}
							target="_blank"
							rel="noreferrer noopener"
							className="inline-flex items-center gap-2 rounded-md text-sm font-semibold text-accent outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent"
						>
							{source.external.cta}
							<ExternalLink className="size-4" aria-hidden />
							<span className="sr-only">(opens in a new tab)</span>
						</a>
					</div>
				) : (
					<>
						<div className="rounded-lg border border-border bg-surface p-5">
							<label
								htmlFor="source-value"
								className="mb-2 block text-sm font-semibold text-text-primary"
							>
								{source.inputLabel}
							</label>

							<Input
								id="source-value"
								value={value}
								onChange={(event) => setValue(event.target.value)}
								placeholder={source.placeholder}
								aria-describedby={source.hint ? "source-hint" : undefined}
								aria-invalid={entered && !url}
								autoComplete="off"
								spellCheck={false}
							/>

							{source.hint && (
								<p id="source-hint" className="mt-2 text-xs text-text-tertiary">
									{source.hint}
								</p>
							)}

							{entered && !url && (
								<p role="status" className="mt-2 text-xs text-error">
									That doesn't look like a {source.inputLabel.toLowerCase()} —
									check the format above.
								</p>
							)}
						</div>

						{url ? (
							<div className="mt-4 rounded-lg border border-border bg-surface p-5">
								<label
									htmlFor="source-url"
									className="mb-2 block text-sm font-semibold text-text-primary"
								>
									Feed address
								</label>

								<div className="flex items-center gap-2">
									<Input
										id="source-url"
										readOnly
										value={url}
										className="min-w-0 flex-1 font-mono text-xs"
									/>
									<Button
										variant="outline"
										onClick={() => void copy()}
										aria-label="Copy feed address"
										className="shrink-0"
									>
										{copied ? <Check /> : <Copy />}
										{copied ? "Copied" : "Copy"}
									</Button>
								</div>

								<p role="status" className="sr-only">
									{copied ? "Feed address copied to clipboard" : ""}
								</p>

								<div className="mt-4 flex flex-wrap items-center gap-3">
									<Button
										aria-disabled
										aria-label={`Follow this ${source.label} feed`}
										className="opacity-60"
									>
										<Plus />
										Follow
									</Button>
									<span className="text-xs text-text-tertiary">
										Following arrives with accounts — copy the address
										meanwhile.
									</span>
								</div>
							</div>
						) : (
							<EmptyState
								icon={Link2}
								title={`Enter ${article(source.inputLabel)} to build its feed address`}
								description="Nothing is fetched — the address is built here in the browser."
							/>
						)}
					</>
				)}
			</main>
		</>
	);
}

/** "a Subreddit" / "an Account" — keeps the empty-state copy grammatical. */
function article(noun: string): string {
	const lower = noun.toLowerCase();
	return `${/^[aeiou]/.test(lower) ? "an" : "a"} ${lower}`;
}
