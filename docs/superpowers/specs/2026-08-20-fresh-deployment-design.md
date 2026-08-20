# Spec: Fresh Render deployment, old links retired

Date: 2026-08-20
Status: Approved (design) — implementation follows

## Purpose

Decommission the current production URLs (old static + API services on Render) and stand up a fresh deployment with brand-new `.onrender.com` URLs. The old links must not work once the new deployment is verified.

## Constraints

- Same repo (`Aqibjadoon1/eminence-life-science`), branch `main`, auto-deploy on push for both new services (identical pipeline to today).
- Same Postgres instance is reused — all products, orders, users, and the admin account carry over unchanged. No data migration.
- Same `JWT_SECRET` so existing user sessions survive the move.
- Same admin credentials (`ADMIN_EMAIL` / `ADMIN_PASSWORD` values carried over).
- Old services are DELETED (permanent) only after the new stack passes verification. No rollback exists after deletion — ordering enforces this.

## Target

| Role | New service name | New URL |
|---|---|---|
| API (web service) | `eminence-api-v2` | `https://eminence-api-v2.onrender.com` (Render-assigned) |
| Frontend (static) | `eminence-frontend-v2` | `https://eminence-frontend-v2.onrender.com` (Render-assigned) |

Exact subdomains are assigned by Render at creation time; the names above are the desired service names.

## Env vars on new API service (values copied from old API)

- `DATABASE_URL` — same Postgres connection string (unchanged; from old service env list)
- `DATABASE_SSL=true`
- `NODE_ENV=production`
- `JWT_SECRET` — same value (existing sessions stay valid)
- `WHATSAPP_ORDER_NUMBER=923105749480`
- `ADMIN_EMAIL=admin@eminence.com`
- `ADMIN_PASSWORD=<carried over>`
- `CLIENT_URL=https://eminence-frontend-v2.onrender.com` (CORS)

Repo change: `frontend/.env.production` becomes:
`VITE_API_URL=https://eminence-api-v2.onrender.com/api`

## Rollout order (zero outage until final step)

1. **Create API v2** via Render API (`POST /v1/services`, `type: web`) — needs owner id from `GET /v1/owners` first.
2. **Set env vars** on API v2 (per-var `PUT …/env-vars/KEY`).
3. **Update + push `.env.production`** with the new API URL — API v2 auto-deploys from the push (old API also rebuilds; harmless — it is being retired).
4. **Create static v2** via Render API (`POST /v1/services`, `type: static`, build `npm run build`, publish `dist`) — first deploy builds the corrected bundle.
5. **Verify new stack** with the prod smoke suite run against the new URLs (7 checks: admin login, storefront data, admin navbar link, `/admin` tabs+rows, normal-user gating + redirect).
6. **Delete old services** (`DELETE /v1/services/<old static id>`, `DELETE /v1/services/<old api id>`) — old URLs now dead (404).
7. **Update docs**: plan execution record + spec this, replace any committed old-URL references.

## Verification / success criteria

- New links serve the app; smoke suite 7/7 against new URLs.
- Old links return dead pages after Step 6.
- Admin login works on new stack (`/admin` reachable, `is_admin` true).
- Storefront data flows (product grid renders) — proves DB + CORS wiring.
- Auto-deploy on push still works (rest of pipeline unchanged).

## Risk notes

- Render API token is already committed in the plan doc (pre-existing issue; rotating is the user's call).
- Deleting services is permanent and releases subdomains — done last, after green verification.
- Shared DB between old and new API briefly during rollout is harmless (same data, read-mostly; rate limiter is per-instance).