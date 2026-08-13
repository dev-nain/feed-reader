/*
 * Configuration carried on the Worker's `env`, merged into the `Env` interface
 * that `npm run cf-typegen` generates from `wrangler.jsonc`.
 *
 * Declared here rather than as `vars` in `wrangler.jsonc` so no project URL or
 * key is committed. In development the Cloudflare Vite plugin loads them from
 * `.env`; in production they are Worker vars and secrets. `.env.example` lists
 * them and says where each one comes from.
 */
interface Env {
	/** Public: the Supabase project URL. */
	VITE_SUPABASE_URL: string;
	/** Public: the publishable (not secret) API key. */
	VITE_SUPABASE_PUBLISHABLE_KEY: string;
	/**
	 * Secret: the service-role key. Server-only, and unread until step 3 needs
	 * the ingest pipeline to write the global catalog.
	 */
	SUPABASE_SECRET_KEY: string;
}
