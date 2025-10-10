# Security Checklist

## Authentication
- [ ] `JWT_SECRET` is a random value at least 64 characters long.
- [ ] `ADMIN_PASSWORD_HASH` is derived from a strong password using the documented PBKDF2 script.
- [ ] No credentials or secrets are hardcoded in the repository.
- [ ] JWT expirations are set to 24 hours or less and validated on the client.

## API Endpoints
- [ ] `/api/publish` rejects requests without a valid admin JWT.
- [ ] `/api/login` has rate limiting configured at the platform (e.g., Vercel Edge middleware) to deter brute force attempts.
- [ ] API error responses avoid leaking sensitive server configuration.

## Data Protection
- [ ] GitHub token has the minimum required permissions (repo write only).
- [ ] JSON payloads under `/data/*.json` contain no sensitive personal data.
- [ ] Admin panel only renders after verifying the stored JWT and expiry.

## Deployment
- [ ] Required environment variables are set in Vercel (production and preview).
- [ ] No `.env` or secret files are committed to Git.
- [ ] Service worker excludes `/data/*` from pre-cache and fetches those resources with a network-first strategy.
