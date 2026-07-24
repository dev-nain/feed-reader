import { MotionConfig } from "framer-motion";
import { Outlet } from "react-router";
import { TopHeader } from "~/components/layout/header";
import { Sidebar } from "~/components/layout/sidebar";

/** Common chrome (top bar + sidebar) shared by all app pages via <Outlet />. */
export default function AppShell() {
	return (
		<MotionConfig reducedMotion="user">
			<div className="flex min-h-screen flex-col bg-bg-primary">
				<TopHeader />

				<div className="flex flex-1">
					<Sidebar />

					<div className="flex min-w-0 flex-1 flex-col">
						<Outlet />
					</div>
				</div>
			</div>
		</MotionConfig>
	);
}
