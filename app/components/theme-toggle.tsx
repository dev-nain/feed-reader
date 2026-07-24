import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useFetcher, useRouteLoaderData } from "react-router";
import { Button } from "~/components/ui/button";
import type { Theme } from "~/lib/theme";
import type { loader as rootLoader } from "~/root";

/**
 * Toggles the theme cookie. The root loader revalidates after the fetcher
 * completes, so <html>'s class updates without a full navigation.
 */
export function ThemeToggle({ className }: { className?: string }) {
	const fetcher = useFetcher();
	const rootData = useRouteLoaderData<typeof rootLoader>("root");

	// OS preference, resolved on the client, used only when no cookie is set.
	const [systemTheme, setSystemTheme] = useState<Theme | null>(null);
	useEffect(() => {
		const mq = window.matchMedia("(prefers-color-scheme: dark)");
		const update = () => setSystemTheme(mq.matches ? "dark" : "light");
		update();
		mq.addEventListener("change", update);
		return () => mq.removeEventListener("change", update);
	}, []);

	// Optimistic value while the fetcher is in flight.
	const pending = fetcher.formData?.get("theme");
	const resolved: Theme =
		(pending === "light" || pending === "dark" ? pending : null) ??
		rootData?.theme ??
		systemTheme ??
		"light";

	const next: Theme = resolved === "dark" ? "light" : "dark";

	return (
		<fetcher.Form method="post" action="/set-theme">
			<input type="hidden" name="theme" value={next} />
			<Button
				type="submit"
				variant="ghost"
				size="icon"
				className={className}
				aria-label={`Switch to ${next} theme`}
			>
				{resolved === "dark" ? <Sun /> : <Moon />}
			</Button>
		</fetcher.Form>
	);
}
