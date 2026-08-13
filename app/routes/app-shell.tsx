import { MotionConfig } from "framer-motion";
import { Outlet, useRouteLoaderData } from "react-router";
import { TopHeader } from "~/components/layout/header";
import { Sidebar } from "~/components/layout/sidebar";
import type { loader as rootLoader } from "~/root";

/*
 * Common chrome (top bar + sidebar) shared by all app pages via <Outlet />.
 *
 * The shell owns the viewport height and each pane scrolls inside it, rather
 * than the document scrolling — that is what lets the feed list keep its scroll
 * position while an article scrolls beside it. `dvh` so mobile browser chrome
 * does not clip the last row.
 */
export default function AppShell() {
	// From the root loader rather than its own: identity is resolved once per
	// request, and the chrome only needs the summary the root already returns.
	const data = useRouteLoaderData<typeof rootLoader>("root");
	const viewer = data?.viewer ?? { kind: "guest" as const };

	return (
		<MotionConfig reducedMotion="user">
			<div className="flex h-dvh flex-col overflow-hidden bg-bg-primary">
				<TopHeader viewer={viewer} />

				<div className="flex min-h-0 flex-1">
					<Sidebar viewer={viewer} />

					<div className="flex min-h-0 min-w-0 flex-1 flex-col">
						<Outlet />
					</div>
				</div>
			</div>
		</MotionConfig>
	);
}
