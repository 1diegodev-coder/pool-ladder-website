# Handoff Log – Security Fix & Stabilization (Week 1)

## Repository Hardening
- Locked down `/api/login` to require configured `ADMIN_PASSWORD_HASH` and `JWT_SECRET`, removed default password path, and ensured JWT signing is only possible when env vars exist (`api/login.js`).
- Secured `/api/publish` with mandatory admin JWT verification (role check + bearer header) and guarded execution when `JWT_SECRET` is missing (`api/publish.js`).
- Replaced client-side password gates with JWT-driven session handling; login now stores token/expiry, and the admin UI verifies/clears sessions before showing content (`js/login.js`, `pages/admin.html`, `js/admin.js`).

## Admin UI & Data Normalization
- Normalized player/match records across admin, matches, and results scripts to use a single JSON shape (no Supabase fallback fields). Removed all `poolDB`/Supabase references and deleted stale artifacts (`js/admin.js`, `js/matches.js`, `js/results.js`, `data/*.json`, `supabase-schema.sql`, `data/test.json`).
- Added client-side cache busting when fetching `/data/*.json` and ensured post-publish flows clear `localStorage` drafts and reload fresh data (`js/admin.js`, `js/matches.js`, `js/ladder.js`).
- Updated service worker to exclude `/data/*` from the precache and enforce a network-first strategy to prevent stale ladder/match data (`sw.js`).

## Documentation & Checklists
- Added `ARCHITECTURE.md` outlining data flow, authentication model, env vars, and current limitations.
- Created `SECURITY.md` checklist for env setup, API protections, and deployment hygiene.
- Added `TESTING.md` manual test protocol covering auth, publish, data sync, and offline scenarios.

## Outstanding Actions for Next Owner
1. Generate and configure `JWT_SECRET`, `ADMIN_PASSWORD_HASH`, `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO` (and optional `GITHUB_BRANCH`) in Vercel before deploying.
2. Run through the manual test checklist (`TESTING.md`) on a preview/staging environment to validate the hardened flow end to end.
3. Optional: tighten or remove the “Change Password” modal, which still contains demo copy, once a proper reset flow is defined.
