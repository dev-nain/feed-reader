/*
 * Where the auth flows land.
 *
 * Named rather than inlined because onboarding is already decided
 * (`prompts/feed-pipeline-architecture.md` §17 D4/D5) but cannot be built until
 * subscriptions exist. When step 4b lands, `AFTER_SIGN_UP` points at the
 * interest picker and the sign-up action does not change at all.
 */

/** A newly created account. Step 4b repoints this at the onboarding route. */
export const AFTER_SIGN_UP = "/";

/** A returning user, when no `?next=` said otherwise. */
export const AFTER_SIGN_IN = "/";
