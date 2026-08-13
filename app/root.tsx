import {
	isRouteErrorResponse,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useRouteLoaderData,
} from "react-router";
import type { Route } from "./+types/root";
import { TooltipProvider } from "./components/ui/tooltip";
import { viewerContext } from "./context";
import { getTheme } from "./lib/theme.server";
import { getViewer, resolveViewer } from "./lib/viewer/viewer.server";
import "./app.css";

/*
 * Identity is resolved once here, and the response is where Supabase's cookies
 * finally land.
 *
 * The flush is the load-bearing half. The SDK refreshes an expiring access
 * token during whichever call first touches auth — typically deep inside some
 * loader with no response in hand — and reports the new cookies through
 * `setAll`. Nothing else copies them onto the response, so without this the
 * browser keeps the stale token and the user is silently signed out about an
 * hour after signing in.
 *
 * Doing it after `await next()` also covers responses produced by a thrown
 * `redirect`, which is exactly the sign-in path.
 */
export const middleware: Route.MiddlewareFunction[] = [
	async ({ request, context }, next) => {
		const viewer = await resolveViewer(request, context);
		context.set(viewerContext, viewer);

		const response = await next();
		viewer.commit(response);
		return response;
	},
];

export async function loader({ request, context }: Route.LoaderArgs) {
	const viewer = getViewer(context);

	return {
		theme: await getTheme(request),
		// Only what the chrome renders. Never the client, never the claims.
		viewer:
			viewer.kind === "user"
				? { kind: "user" as const, email: viewer.email }
				: { kind: "guest" as const },
	};
}

export const links: Route.LinksFunction = () => [
	{ rel: "preconnect", href: "https://fonts.googleapis.com" },
	{
		rel: "preconnect",
		href: "https://fonts.gstatic.com",
		crossOrigin: "anonymous",
	},
	{
		rel: "stylesheet",
		href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
	},
];

export function Layout({ children }: { children: React.ReactNode }) {
	// Root loader data is absent when an error boundary renders; fall back to
	// no class so tokens follow the OS preference.
	const data = useRouteLoaderData<typeof loader>("root");
	return (
		<html lang="en" className={data?.theme ?? undefined}>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body>
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	return (
		<TooltipProvider delayDuration={300}>
			<Outlet />
		</TooltipProvider>
	);
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	let message = "Oops!";
	let details = "An unexpected error occurred.";
	let stack: string | undefined;

	if (isRouteErrorResponse(error)) {
		message = error.status === 404 ? "404" : "Error";
		details =
			error.status === 404
				? "The requested page could not be found."
				: error.statusText || details;
	} else if (import.meta.env.DEV && error && error instanceof Error) {
		details = error.message;
		stack = error.stack;
	}

	return (
		<main className="pt-16 p-4 container mx-auto">
			<h1>{message}</h1>
			<p>{details}</p>
			{stack && (
				<pre className="w-full p-4 overflow-x-auto">
					<code>{stack}</code>
				</pre>
			)}
		</main>
	);
}
