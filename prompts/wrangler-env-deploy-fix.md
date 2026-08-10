# Prompt: Fix staging deploys landing on the production Worker

## Goal

`npx wrangler deploy --env staging` currently deploys to the **base** Worker
(`frontpage-feed-reader-main`) with `APP_ENV="development"`, instead of a separate
staging Worker. Make the staging CI job deploy to a dedicated staging Worker with
`APP_ENV="staging"`, and correct the same defect on the production path without
changing the live production Worker name/URL.

## Skills read

- Not applicable — this is build/deploy configuration, not route/loader/action,
  Supabase, or AI work. No `.agents/skills/*` skill covers Wrangler environments.
- Verified behaviour directly against the installed toolchain instead
  (`wrangler@4.114.0`, `@cloudflare/vite-plugin@1.47.0`).

## Existing code inspected

- `wrangler.jsonc` — top-level `name`/`vars`, plus `env.staging` and `env.production`
  blocks that set only `workers_dev` and `vars`. Neither sets `name`.
- `package.json` — `"deploy": "npm run build && wrangler deploy"`,
  `"build": "react-router build"`.
- `.github/workflows/ci.yml` — `deploy-staging` runs `npm run build` then
  `npx wrangler deploy --env staging`; `deploy-production` runs `npm run deploy`;
  `deploy-preview` runs `npx wrangler versions upload`.
- `vite.config.ts` — `@cloudflare/vite-plugin` is active.
- `.wrangler/deploy/config.json` → `{"configPath":"../../build/server/wrangler.json"}`
- `build/server/wrangler.json` — plugin-generated **redirected config**.

## Root cause (verified, not assumed)

The Cloudflare Vite plugin resolves the Wrangler environment at **build time**, not
at deploy time.

1. The build writes `.wrangler/deploy/config.json`, which redirects Wrangler to the
   generated `build/server/wrangler.json`.
2. `wrangler deploy` (from the repo root) therefore reads the **generated** config,
   not the root `wrangler.jsonc`. The generated config is already flattened — it has
   no `env` block left to select from.
3. In `wrangler-dist/cli.js`, for a redirected config the `--env` flag is only used
   as a *consistency check* against the generated `targetEnvironment` field:

   ```js
   const envName = args.env ?? getCloudflareEnv();
   let activeEnv = topLevelEnv;
   if (envName) if (isRedirectedConfig) {
     if (rawConfig.targetEnvironment && rawConfig.targetEnvironment !== envName) { throw ... }
   } else { /* select rawConfig.env[envName] */ }
   ```

   Because the build ran **without** `CLOUDFLARE_ENV`, the generated config has no
   `targetEnvironment`, so the guard is skipped, `activeEnv` stays `topLevelEnv`, and
   `--env staging` is silently ignored. Observed generated config from a plain build:
   `{"name":"frontpage-feed-reader-main","vars":{"APP_ENV":"development"}}` — no
   `targetEnvironment`.
4. Building with the env var selected produces the correct config. Confirmed by
   running `CLOUDFLARE_ENV=staging npx vite build`:
   `{"name":"frontpage-feed-reader-main-staging","targetEnvironment":"staging",
   "vars":{"APP_ENV":"staging"},"workers_dev":true}`

So the fix is **`CLOUDFLARE_ENV` at build time**; `--env` on `wrangler deploy` is
kept purely as a fail-loud guard.

## Decisions / assumptions

- **Production keeps the base Worker name.** User-confirmed: `env.production` pins
  `"name": "frontpage-feed-reader-main"` so the already-live Worker, its
  `workers.dev` URL, and any routes are untouched. Only `APP_ENV` is corrected from
  `"development"` to `"production"`.
- **Staging gets `frontpage-feed-reader-main-staging`.** Written explicitly rather
  than relying on Wrangler's implicit `<name>-<env>` suffix, so both Worker names are
  readable straight from the config.
- Keep `--env <name>` on the deploy commands. Now that builds emit
  `targetEnvironment`, a mismatch throws — so forgetting `CLOUDFLARE_ENV` fails the
  job loudly instead of silently shipping to the wrong Worker.
- Top-level config stays the local-dev default (`APP_ENV: "development"`), which is
  what `npm run dev` and `deploy-preview`'s `wrangler versions upload` consume.
  `deploy-preview` is left alone — PR previews are versions on the base Worker.
- `npm run deploy` becomes production-specific; that matches its only caller
  (the `deploy-production` job).
- Fix the mixed tab/space indentation inside the `env` blocks.

## Files likely to change

- `wrangler.jsonc`
- `package.json` (`deploy` script)
- `.github/workflows/ci.yml` (`deploy-staging` build step)

## Implementation requirements

1. `wrangler.jsonc`
   - `env.staging.name` = `"frontpage-feed-reader-main-staging"`.
   - `env.production.name` = `"frontpage-feed-reader-main"`.
   - Keep `workers_dev: true` and the existing `vars.APP_ENV` per env.
   - Normalise indentation to the file's existing 2-space style.
2. `package.json`
   - `"deploy": "CLOUDFLARE_ENV=production npm run build && wrangler deploy --env production"`.
3. `.github/workflows/ci.yml`
   - `deploy-staging`: replace `- run: npm run build` with
     `- run: CLOUDFLARE_ENV=staging npm run build`. Leave the existing
     `npx wrangler deploy --env staging` line as-is.

## Security requirements

- No secrets are added to `wrangler.jsonc`; `vars` holds only the non-sensitive
  `APP_ENV` string, which is safe to expose.
- `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` stay in GitHub Actions job `env`
  sourced from repository secrets — unchanged.
- Staging and production remain distinct Workers, so a staging deploy cannot
  overwrite production code or vars.

## Acceptance criteria

- `CLOUDFLARE_ENV=staging npm run build` produces `build/server/wrangler.json` with
  `name: "frontpage-feed-reader-main-staging"`, `targetEnvironment: "staging"`,
  `vars.APP_ENV: "staging"`.
- `CLOUDFLARE_ENV=production npm run build` produces
  `name: "frontpage-feed-reader-main"`, `targetEnvironment: "production"`,
  `vars.APP_ENV: "production"`.
- A plain `npm run build` still produces `APP_ENV: "development"` and no
  `targetEnvironment` (unchanged local-dev/preview behaviour).
- Building for one env and deploying with the other `--env` fails with Wrangler's
  target-environment mismatch error rather than deploying.
- A push to `develop` deploys only to the staging Worker; `main` only to the
  production Worker.

## Checks to run

- `npm run lint`
- `npm run typecheck`
- `npm run build` (routes/config touched)
- `CLOUDFLARE_ENV=staging npm run build` + inspect `build/server/wrangler.json`
- `CLOUDFLARE_ENV=production npm run build` + inspect `build/server/wrangler.json`
- Restore a plain `npm run build` afterwards so the local tree isn't left holding an
  env-targeted build.

## Manual test steps

1. `CLOUDFLARE_ENV=staging npm run build`
2. `node -e "const c=require('./build/server/wrangler.json'); console.log(c.name, c.targetEnvironment, JSON.stringify(c.vars))"`
   → expect `frontpage-feed-reader-main-staging staging {"APP_ENV":"staging"}`
3. `npx wrangler deploy --env staging --dry-run` → succeeds, no mismatch error.
4. `npx wrangler deploy --env production --dry-run` → fails with the
   target-environment mismatch error (proves the guard works).
5. Repeat 1–3 with `CLOUDFLARE_ENV=production` / `--env production`.
6. `npm run build` to restore the default local build.
7. Push to `develop`; confirm the Actions log shows the deploy targeting
   `frontpage-feed-reader-main-staging`, and that the production Worker's
   last-deployed timestamp is unchanged.
