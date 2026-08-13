import { Form, Link, redirect, useNavigation } from "react-router";
import {
	AUTH_LINK,
	AuthLayout,
	FormError,
} from "~/components/auth/auth-layout";
import { Field, PasswordField } from "~/components/auth/field";
import { OAuthButtons, OrDivider } from "~/components/auth/oauth";
import { Button } from "~/components/ui/button";
import { Spinner } from "~/components/ui/spinner";
import { AFTER_SIGN_IN } from "~/lib/auth/destinations";
import { safeNext } from "~/lib/auth/redirect";
import {
	type FieldErrors,
	signInSchema,
	toFieldErrors,
} from "~/lib/auth/schemas";
import { getViewer } from "~/lib/viewer/viewer.server";
import type { Route } from "./+types/auth.sign-in";

export function meta(_: Route.MetaArgs) {
	return [
		{ title: "Sign in — Frontpage" },
		{ name: "description", content: "Sign in to your Frontpage account." },
	];
}

/** Query-parameter failures that happen before any form is submitted. */
const ENTRY_ERRORS: Record<string, string> = {
	"link-expired":
		"That link has expired or was already used. Request a new one below.",
	oauth:
		"We couldn't complete that GitHub sign-in. Try again, or use your email.",
};

export function loader({ request, context }: Route.LoaderArgs) {
	const url = new URL(request.url);
	const next = safeNext(url.searchParams.get("next"));

	if (getViewer(context).kind === "user") {
		throw redirect(next ?? AFTER_SIGN_IN);
	}

	return {
		next,
		entryError: ENTRY_ERRORS[url.searchParams.get("error") ?? ""] ?? null,
	};
}

export async function action({ request, context }: Route.ActionArgs) {
	const form = await request.formData();
	const parsed = signInSchema.safeParse({
		email: form.get("email"),
		password: form.get("password"),
	});

	// The email is echoed back so a failed submit does not clear the form; the
	// password never is.
	const values = { email: String(form.get("email") ?? "") };

	if (!parsed.success) {
		return {
			fieldErrors: toFieldErrors(parsed.error),
			formError: null,
			values,
		};
	}

	const { supabase } = getViewer(context);
	const { error } = await supabase.auth.signInWithPassword(parsed.data);

	if (error) {
		return {
			fieldErrors: {} as FieldErrors,
			// One message for a wrong password and for an address with no account.
			// Distinguishing them would turn this page into an oracle for which
			// addresses are registered.
			formError: "That email and password don't match an account.",
			values,
		};
	}

	const next = safeNext(new URL(request.url).searchParams.get("next"));
	return redirect(next ?? AFTER_SIGN_IN);
}

export default function SignIn({
	loaderData,
	actionData,
}: Route.ComponentProps) {
	const navigation = useNavigation();
	const busy =
		navigation.state !== "idle" && !navigation.formAction?.includes("oauth");
	const errors = actionData?.fieldErrors ?? {};

	return (
		<AuthLayout
			title="Welcome back"
			description="Pick up where you left off."
			crossLink={{
				prompt: "New to Frontpage?",
				to: "/sign-up",
				label: "Create an account",
			}}
		>
			{loaderData.entryError && <FormError>{loaderData.entryError}</FormError>}
			{actionData?.formError && <FormError>{actionData.formError}</FormError>}

			<OAuthButtons label="Sign in with GitHub" next={loaderData.next} />
			<OrDivider />

			<Form method="post" aria-busy={busy} className="flex flex-col gap-4">
				<Field
					id="email"
					label="Email"
					type="email"
					autoComplete="email"
					placeholder="you@example.com"
					defaultValue={actionData?.values.email}
					error={errors.email}
					required
				/>

				<div>
					<PasswordField
						id="password"
						label="Password"
						autoComplete="current-password"
						error={errors.password}
						required
					/>
					<p className="mt-1.5 text-right text-sm">
						<Link to="/forgot-password" className={AUTH_LINK}>
							Forgot your password?
						</Link>
					</p>
				</div>

				<Button type="submit" className="mt-2 w-full" disabled={busy}>
					{busy && <Spinner label="" className="[&_svg]:size-4" />}
					{busy ? "Signing in…" : "Sign in"}
				</Button>
			</Form>
		</AuthLayout>
	);
}
