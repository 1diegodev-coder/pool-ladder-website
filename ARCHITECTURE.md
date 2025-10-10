# Architecture Overview

## Data Flow
1. Public pages fetch `/data/players.json` and `/data/matches.json` (GitHub-backed) with cache-busting query params.
2. Admin edits persist to `localStorage` (`poolLadderAdminData`) as a draft working copy.
3. Publishing sends the normalized draft payload to `/api/publish`, which commits updates to GitHub via Octokit.
4. After publish, the admin UI clears the draft cache and refetches the committed data; the service worker uses a network-first strategy for `/data/*` requests to avoid stale content.

## Authentication
- JWT-based admin auth enforced by `/api/login` and `/api/publish`.
- Login exchanges the admin password for a 24h JWT; tokens and expirations live in `localStorage`.
- Protected endpoint (`/api/publish`) requires a valid admin JWT in the `Authorization` header.

## Environment Variables
- `JWT_SECRET`: HMAC signing key for issued tokens.
- `ADMIN_PASSWORD_HASH`: `salt:hash` pair generated via PBKDF2 (10k iterations, 64-byte key).
- `GITHUB_TOKEN`: Repo-scoped token used by Octokit to commit data changes.
- `GITHUB_OWNER`, `GITHUB_REPO`: Target repository coordinates (optional overrides for Vercel defaults).

## Limitations
- Single-league workflow; no multi-tenancy or league switching.
- No real-time sync between admin browsers; drafts remain per-device until published.
- Local drafts are browser-specific; clearing storage or switching devices drops unpublished changes.
