import { MailCheck } from "lucide-react";
import { Form, redirect, useNavigation } from "react-router";
import { AuthLayout, FormError } from "~/components/auth/auth-layout";
import { Field, PasswordField } from "~/components/auth/field";
import { OAuthButtons, OrDivider } from "~/components/auth/oauth";
import { Button } from "~/components/ui/button";
import { EmptyState } from "~/components/ui/empty-state";
import { Spinner } from "~/components/ui/spinner";
import { AFTER_SIGN_UP } from "~/lib/auth/destinations";
import {
	type FieldErrors,
	MIN_PASSWORD_LENGTH,
	signUpSchema,
	toFieldErrors,
} from "~/lib/auth/schemas";
import { getViewer } from "~/lib/viewer/viewer.server";
import type { Route } from "./+types/auth.sign-up";

export function meta(_: Route.MetaArgs) {
	return [
		{ title: "Sign up — Frontpage" },
		{ name: "description", content: "Create your Frontpage account." },
	];
}

export function loader({ context }: Route.LoaderArgs) {
	if (getViewer(context).kind === "user") throw redirect(AFTER_SIGN_UP);
	return null;
}

export async function action({ request, context }: Route.ActionArgs) {
	const form = await request.formData();
	const parsed = signUpSchema.safeParse({
		email: form.get("email"),
		password: form.get("password"),
	});

	const values = { email: String(form.get("email") ?? "") };

	if (!parsed.success) {
		return {
			fieldErrors: toFieldErrors(parsed.error),
			formError: null,
			values,
			confirmEmail: null,
		};
	}

	const { supabase } = getViewer(context);
	const { data, error } = await supabase.auth.signUp({
		...parsed.data,
		options: {
			// Where the confirmation link lands when confirmations are enabled.
			emailRedirectTo: new URL(
				`/auth/callback?next=${encodeURIComponent(AFTER_SIGN_UP)}`,
				request.url,
			).toString(),
		},
	});

	if (error) {
		return {
			fieldErrors: {} as FieldErrors,
			formError: error.message,
			values,
			confirmEmail: null,
		};
	}

	// Two legitimate outcomes, decided by the project's email settings rather
	// than by us: confirmations off returns a session and the account is live;
	// confirmations on returns a user with no session and the link does the rest.
	if (data.session) throw redirect(AFTER_SIGN_UP);

	return {
		fieldErrors: {} as FieldErrors,
		formError: null,
		values,
		confirmEmail: parsed.data.email,
	};
}

export default function SignUp({ actionData }: Route.ComponentProps) {
	const navigation = useNavigation();
	const busy =
		navigation.state !== "idle" && !navigation.formAction?.includes("oauth");
	const errors = actionData?.fieldErrors ?? {};

	if (actionData?.confirmEmail) {
		return (
			<AuthLayout title="Check your email" aside={false}>
				<EmptyState
					icon={MailCheck}
					title="Confirm your address"
					description={`We sent a confirmation link to ${actionData.confirmEmail}. Open it to finish setting up your account.`}
				/>
			</AuthLayout>
		);
	}

	return (
		<AuthLayout
			title="Create your account"
			description="Your personalized front page for tech content."
			crossLink={{
				prompt: "Already have an account?",
				to: "/sign-in",
				label: "Sign in",
			}}
		>
			{actionData?.formError && <FormError>{actionData.formError}</FormError>}

			<OAuthButtons label="Sign up with GitHub" />
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

				<PasswordField
					id="password"
					label="Password"
					autoComplete="new-password"
					error={errors.password}
					required
					minLength={MIN_PASSWORD_LENGTH}
				/>

				<Button type="submit" className="mt-2 w-full" disabled={busy}>
					{busy && <Spinner label="" className="[&_svg]:size-4" />}
					{busy ? "Creating account…" : "Create free account"}
				</Button>
			</Form>

			<p className="mt-4 text-center text-xs text-text-tertiary">
				Free, and no credit card — this is a portfolio build.
			</p>
		</AuthLayout>
	);
}
