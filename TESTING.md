# Manual Test Checklist

## Authentication
- [ ] Log in with the correct admin password → expect success message and redirect to admin dashboard.
- [ ] Log in with an incorrect password → expect error messaging with no token stored.
- [ ] Navigate directly to `/pages/admin.html` without a valid JWT → expect redirect to the login page.
- [ ] Leave the admin tab open for 24h and attempt an action → expect forced re-login when the token expires.

## Publishing
- [ ] Attempt to publish without a JWT (e.g., clear storage) → request should return 401 and prompt for login.
- [ ] Publish with a valid JWT → expect success notification, cleared draft cache, and updated GitHub data.
- [ ] Confirm the resulting GitHub commit reflects the intended player/match changes.
- [ ] Reload public pages and verify new ladder/match data is visible after publish.

## Data Sync
- [ ] Make edits in the admin UI and refresh before publishing → draft should persist from `localStorage`.
- [ ] Publish changes and reload → draft cache should be cleared and data should match GitHub.
- [ ] Open admin in two tabs, edit in one, and ensure the second tab refresh updates via `localStorage` storage events (manual reload may be required).

## Offline & Cache
- [ ] Load the site, go offline, and confirm core pages still render via the service worker cache.
- [ ] While offline, verify data fetching falls back gracefully (scheduled/results sections should show cached copies if available).
- [ ] Come back online and confirm `/data/*.json` requests fetch fresh content (no stale service worker cache).
