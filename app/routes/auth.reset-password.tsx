import { Form, redirect, useNavigation } from "react-router";
import { AuthLayout, BackLink, FormError } from "~/components/auth/auth-layout";
import { PasswordField } from "~/components/auth/field";
import { Button } from "~/components/ui/button";
import { Spinner } from "~/components/ui/spinner";
import { AFTER_SIGN_IN } from "~/lib/auth/destinations";
import {
	type FieldErrors,
	MIN_PASSWORD_LENGTH,
	resetPasswordSchema,
	toFieldErrors,
} from "~/lib/auth/schemas";
import { getViewer, requireUser } from "~/lib/viewer/viewer.server";
import type { Route } from "./+types/auth.reset-password";

export function meta(_: Route.MetaArgs) {
	return [
		{ title: "Choose a new password — Frontpage" },
		{ name: "description", content: "Set a new password for your account." },
	];
}

/*
 * Reachable only with a session — which the recovery link creates by way of
 * /auth/callback. Arriving here without one means the link was never opened (or
 * has expired), so `requireUser` bounces to sign-in rather than showing a form
 * that could not possibly work.
 */
export function loader({ request, context }: Route.LoaderArgs) {
	requireUser(getViewer(context), request);
	return null;
}

export async function action({ request, context }: Route.ActionArgs) {
	const viewer = requireUser(getViewer(context), request);

	const form = await request.formData();
	const parsed = resetPasswordSchema.safeParse({
		password: form.get("password"),
		confirmPassword: form.get("confirmPassword"),
	});

	if (!parsed.success) {
		return { fieldErrors: toFieldErrors(parsed.error), formError: null };
	}

	const { error } = await viewer.supabase.auth.updateUser({
		password: parsed.data.password,
	});

	if (error) {
		return { fieldErrors: {} as FieldErrors, formError: error.message };
	}

	return redirect(AFTER_SIGN_IN);
}

export default function ResetPassword({ actionData }: Route.ComponentProps) {
	const navigation = useNavigation();
	const busy = navigation.state !== "idle";
	const errors = actionData?.fieldErrors ?? {};

	return (
		<AuthLayout
			title="Choose a new password"
			description={`At least ${MIN_PASSWORD_LENGTH} characters.`}
			aside={false}
		>
			{actionData?.formError && <FormError>{actionData.formError}</FormError>}

			<Form method="post" aria-busy={busy} className="flex flex-col gap-4">
				<PasswordField
					id="password"
					label="New password"
					autoComplete="new-password"
					error={errors.password}
					required
					minLength={MIN_PASSWORD_LENGTH}
				/>

				<PasswordField
					id="confirmPassword"
					label="Confirm new password"
					autoComplete="new-password"
					error={errors.confirmPassword}
					required
				/>

				<Button type="submit" className="mt-2 w-full" disabled={busy}>
					{busy && <Spinner label="" className="[&_svg]:size-4" />}
					{busy ? "Saving…" : "Save new password"}
				</Button>
			</Form>

			<div className="mt-6 text-center">
				<BackLink to="/">Back to Frontpage</BackLink>
			</div>
		</AuthLayout>
	);
}
