import { Inbox, Rss, Search } from "lucide-react";
import { ThemeToggle } from "~/components/theme-toggle";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { EmptyState } from "~/components/ui/empty-state";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import { Spinner } from "~/components/ui/spinner";
import type { Route } from "./+types/style-guide";

export function meta(_: Route.MetaArgs) {
	return [
		{ title: "Frontpage — Style Guide" },
		{
			name: "description",
			content: "Base components and theme for Frontpage.",
		},
	];
}

function Section({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<section className="flex flex-col gap-4">
			<h2 className="text-sm font-semibold text-text-tertiary uppercase tracking-wide">
				{title}
			</h2>
			<div className="flex flex-wrap items-center gap-3">{children}</div>
		</section>
	);
}

export default function StyleGuide() {
	return (
		<main className="mx-auto flex max-w-feed flex-col gap-10 px-6 py-12">
			<header className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Rss className="size-6 text-accent" aria-hidden />
					<h1 className="text-2xl font-bold text-text-primary">Frontpage</h1>
				</div>
				<ThemeToggle />
			</header>

			<Section title="Buttons">
				<Button>Primary</Button>
				<Button variant="secondary">Secondary</Button>
				<Button variant="outline">Outline</Button>
				<Button variant="ghost">Ghost</Button>
				<Button variant="destructive">Destructive</Button>
				<Button size="sm">Small</Button>
				<Button size="lg">Large</Button>
				<Button size="icon" aria-label="Search">
					<Search />
				</Button>
			</Section>

			<Section title="Input">
				<Input placeholder="Add a feed URL…" className="max-w-sm" />
				<Input aria-invalid placeholder="Invalid state" className="max-w-sm" />
			</Section>

			<Section title="Badges">
				<Badge>Default</Badge>
				<Badge variant="accent">12 unread</Badge>
				<Badge variant="success">Healthy</Badge>
				<Badge variant="warning">Stale</Badge>
				<Badge variant="error">Error</Badge>
			</Section>

			<Section title="Feedback">
				<Spinner />
				<div className="flex w-full max-w-sm flex-col gap-2">
					<Skeleton className="h-4 w-3/4" />
					<Skeleton className="h-4 w-1/2" />
				</div>
			</Section>

			<Section title="Card">
				<Card className="w-full max-w-sm">
					<CardHeader>
						<CardTitle>Hacker News</CardTitle>
						<CardDescription>news.ycombinator.com</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-text-secondary">
							Top stories from the tech community, refreshed hourly.
						</p>
					</CardContent>
					<CardFooter>
						<Badge variant="success">Healthy</Badge>
						<Button size="sm" variant="outline">
							Open
						</Button>
					</CardFooter>
				</Card>
			</Section>

			<Section title="Empty state">
				<Card className="w-full">
					<EmptyState
						icon={Inbox}
						title="No feeds yet"
						description="Add your first RSS or Atom feed to start building your front page."
						action={<Button>Add feed</Button>}
					/>
				</Card>
			</Section>
		</main>
	);
}
