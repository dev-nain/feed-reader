import { Mail } from "lucide-react";
import { Form, useNavigation } from "react-router";
import { AuthLayout, BackLink } from "~/components/auth/auth-layout";
import { Field } from "~/components/auth/field";
import { Button } from "~/components/ui/button";
import { EmptyState } from "~/components/ui/empty-state";
import { Spinner } from "~/components/ui/spinner";
import { forgotPasswordSchema, toFieldErrors } from "~/lib/auth/schemas";
import { getViewer } from "~/lib/viewer/viewer.server";
import type { Route } from "./+types/auth.forgot-password";

export function meta(_: Route.MetaArgs) {
	return [
		{ title: "Reset your password — Frontpage" },
		{ name: "description", content: "Request a password reset link." },
	];
}

export async function action({ request, context }: Route.ActionArgs) {
	const form = await request.formData();
	const parsed = forgotPasswordSchema.safeParse({ email: form.get("email") });
	const values = { email: String(form.get("email") ?? "") };

	if (!parsed.success) {
		return { fieldErrors: toFieldErrors(parsed.error), values, sent: false };
	}

	const { supabase } = getViewer(context);
	await supabase.auth.resetPasswordForEmail(parsed.data.email, {
		redirectTo: new URL(
			"/auth/callback?next=%2Freset-password",
			request.url,
		).toString(),
	});

	// Deliberately unconditional. Reporting whether the address had an account —
	// or whether the send failed — would answer "is this person a user?" for
	// anyone who asks. Rate limiting is the Auth server's job, and its refusals
	// are not surfaced here either.
	return { fieldErrors: {}, values, sent: true };
}

export default function ForgotPassword({ actionData }: Route.ComponentProps) {
	const navigation = useNavigation();
	const busy = navigation.state !== "idle";

	if (actionData?.sent) {
		return (
			<AuthLayout title="Check your email" aside={false}>
				<EmptyState
					icon={Mail}
					title="If that address has an account, a link is on its way"
					description="Open it to choose a new password. The link expires in an hour."
				/>
				<div className="mt-2 text-center">
					<BackLink to="/sign-in">Back to sign in</BackLink>
				</div>
			</AuthLayout>
		);
	}

	return (
		<AuthLayout
			title="Reset your password"
			description="We'll email you a link to choose a new one."
			aside={false}
			crossLink={{
				prompt: "Remembered it?",
				to: "/sign-in",
				label: "Back to sign in",
			}}
		>
			<Form method="post" aria-busy={busy} className="flex flex-col gap-4">
				<Field
					id="email"
					label="Email"
					type="email"
					autoComplete="email"
					placeholder="you@example.com"
					defaultValue={actionData?.values.email}
					error={actionData?.fieldErrors.email}
					required
				/>

				<Button type="submit" className="mt-2 w-full" disabled={busy}>
					{busy && <Spinner label="" className="[&_svg]:size-4" />}
					{busy ? "Sending…" : "Send reset link"}
				</Button>
			</Form>
		</AuthLayout>
	);
}
