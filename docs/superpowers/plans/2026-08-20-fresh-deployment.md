# Fresh Render Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up new Render services (frontend + API) with brand-new URLs, repoint the frontend config, verify, then delete the old services so the old links stop working — all while reusing the existing Postgres.

**Architecture:** Two new Render services (web API + static frontend) created via the Render REST API, wired to the existing Postgres and env vars. `frontend/.env.production` is repointed at the new API URL so the static build bakes the correct origin on first deploy. Old services are deleted last, after a green smoke run against the new URLs.

**Tech Stack:** Render REST API (`api.render.com/v1`), curl.exe / PowerShell, Node.js CDP smoke harness (existing pattern), git + main branch auto-deploy, Vite.

**Reference data (do not commit secrets beyond what is already committed):**
- Render owner lookup: `GET https://api.render.com/v1/owners` with `Authorization: Bearer rnd_JOVDgKdvz6PUSiTTcMzKLfEf8aNb`
- Old API service id: `srv-da05vq67bikc73efbr2g`, old static service id: `srv-da0601u7bikc73efc9r0`
- Existing Postgres URL + JWT_SECRET + WHATSAPP_ORDER_NUMBER + ADMIN creds: read from old API service's env vars (`GET /v1/services/srv-da05vq67bikc73efbr2g/env-vars`) — copy values verbatim.
- Desired service names: `eminence-api-v2`, `eminence-frontend-v2`.

---

### Task 1: Create the new API service

**Files:**
- (none in repo — infra only; temp scripts in `C:\Users\jadoo\AppData\Local\Temp\opencode\` when needed)

- [ ] **Step 1: Look up the Render owner id**

Run:
```powershell
curl.exe -s "https://api.render.com/v1/owners" -H "Accept: application/json" -H "Authorization: Bearer rnd_JOVDgKdvz6PUSiTTcMzKLfEf8aNb"
```
Expected: JSON array; note `owner.id` (personal owner id, e.g. `usr-…`).

- [ ] **Step 2: Create the API v2 web service**

Write `C:\Users\jadoo\AppData\Local\Temp\opencode\create_api_v2.json`:
```json
{
  "type": "web",
  "name": "eminence-api-v2",
  "ownerId": "<owner.id from Step 1>",
  "repo": "https://github.com/Aqibjadoon1/eminence-life-science",
  "branch": "main",
  "rootDir": "backend",
  "autoDeploy": true,
  "runtime": "node",
  "envVars": [],
  "serviceDetails": {
    "env": "node",
    "buildCommand": "npm install",
    "startCommand": "npm start",
    "healthCheckPath": "/api/health",
    "plan": "free"
  }
}
```
Run:
```powershell
curl.exe -s -X POST "https://api.render.com/v1/services" -H "Accept: application/json" -H "Content-Type: application/json" -H "Authorization: Bearer rnd_JOVDgKdvz6PUSiTTcMzKLfEf8aNb" -d "@C:\Users\jadoo\AppData\Local\Temp\opencode\create_api_v2.json"
```
Expected: 201 with `service.id`, `service.url` (e.g. `https://eminence-api-v2.onrender.com`) and first deploy `build_in_progress`. Note the **new service id** and **new API URL** — used in every later task. If the old service's actual config differs (e.g. it uses a Dockerfile or different root), read the old service config first:
```powershell
curl.exe -s "https://api.render.com/v1/services/srv-da05vq67bikc73efbr2g" -H "Accept: application/json" -H "Authorization: Bearer rnd_JOVDgKdvz6PUSiTTcMzKLfEf8aNb"
```
and mirror `serviceDetails` + `rootDir` exactly.

- [ ] **Step 3: Verify the new API URL resolves (when deploy goes live)**

Poll until live (repeat up to ~5 min):
```powershell
curl.exe -s "https://api.render.com/v1/services/<new-api-id>/deploys?limit=1" -H "Accept: application/json" -H "Authorization: Bearer rnd_JOVDgKdvz6PUSiTTcMzKLfEf8aNb"
```
Expected: `status: "live"`, then:
```powershell
curl.exe -s "https://eminence-api-v2.onrender.com/api/health"
```
Expected: `{"status":"ok",...}` — note: env vars do NOT exist yet, so the DB connection will be missing and `/api/health` currently returns 500. That is expected; Task 2 fixes it.

---

### Task 2: Set env vars on API v2

**Files:**
- (none in repo)

- [ ] **Step 1: Copy old env var values**

Run and capture the full list (values verbatim; mask in logs):
```powershell
curl.exe -s "https://api.render.com/v1/services/srv-da05vq67bikc73efbr2g/env-vars" -H "Accept: application/json" -H "Authorization: Bearer rnd_JOVDgKdvz6PUSiTTcMzKLfEf8aNb"
```
Needed keys: `DATABASE_URL`, `DATABASE_SSL`, `JWT_SECRET`, `WHATSAPP_ORDER_NUMBER`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `NODE_ENV`, `CLIENT_URL` (old value will be REPLACED in Step 3).

- [ ] **Step 2: Set each non-URL env var on API v2**

For each key in the list above (except `CLIENT_URL`), write a temp JSON body and PUT:
```powershell
Set-Content -Path "C:\Users\jadoo\AppData\Local\Temp\opencode\ev.json" -Value '{"value":"<copied value>"}'
curl.exe -s -X PUT "https://api.render.com/v1/services/<new-api-id>/env-vars/<KEY>" -H "Accept: application/json" -H "Content-Type: application/json" -H "Authorization: Bearer rnd_JOVDgKdvz6PUSiTTcMzKLfEf8aNb" -d "@C:\Users\jadoo\AppData\Local\Temp\opencode\ev.json"
```
Expected: 200 per key. (`NODE_ENV` value: `production`.)

- [ ] **Step 3: Set CLIENT_URL to the NEW frontend URL**

```powershell
Set-Content -Path "C:\Users\jadoo\AppData\Local\Temp\opencode\ev.json" -Value '{"value":"https://eminence-frontend-v2.onrender.com"}'
curl.exe -s -X PUT "https://api.render.com/v1/services/<new-api-id>/env-vars/CLIENT_URL" -H "Accept: application/json" -H "Content-Type: application/json" -H "Authorization: Bearer rnd_JOVDgKdvz6PUSiTTcMzKLfEf8aNb" -d "@C:\Users\jadoo\AppData\Local\Temp\opencode\ev.json"
```
Expected: 200.

- [ ] **Step 4: Redeploy API v2 and verify health + admin seed**

Trigger deploy (env changes don't auto-deploy):
```powershell
curl.exe -s -X POST "https://api.render.com/v1/services/<new-api-id>/deploys" -H "Accept: application/json" -H "Content-Type: application/json" -H "Authorization: Bearer rnd_JOVDgKdvz6PUSiTTcMzKLfEf8aNb" -d "{}"
```
Poll until `live`, then:
```powershell
curl.exe -s "https://eminence-api-v2.onrender.com/api/health"
```
Expected: 200 `{"status":"ok"}`. Then verify admin login works on the new URL:
```powershell
Set-Content -Path "C:\Users\jadoo\AppData\Local\Temp\opencode\lg.json" -Value '{"email":"admin@eminence.com","password":"<ADMIN_PASSWORD copied in Step 1>"}'
curl.exe -s -o "C:\Users\jadoo\AppData\Local\Temp\opencode\lg_resp.json" -X POST "https://eminence-api-v2.onrender.com/api/auth/login" -H "Content-Type: application/json" -d "@C:\Users\jadoo\AppData\Local\Temp\opencode\lg.json"
```
Expected: HTTP 200; response body contains `"is_admin":true` (same DB, admin row already exists — boot seed also re-upserts).

- [ ] **Step 5: Commit the record of new service ids/URLs** (docs task comes later; nothing to commit here — proceed)

---

### Task 3: Repoint frontend config + push

**Files:**
- Modify: `frontend/.env.production`

- [ ] **Step 1: Update `.env.production`**

Replace the single line (currently `VITE_API_URL=https://eminence-api.onrender.com/api`) with:
```
VITE_API_URL=https://eminence-api-v2.onrender.com/api
```
The `/api` suffix is REQUIRED (config.js joins `${BASE_URL}/categories` etc.).

- [ ] **Step 2: Rebuild locally to confirm the origin bakes in**

Run (frontend workdir):
```powershell
npm run build
```
Expected: build succeeds, `dist/` contains `index-*.js`. Verify the new origin is in the bundle:
```powershell
node -e "const fs=require('fs');const f=fs.readdirSync('C:/Users/jadoo/Desktop/eminence in life sciences/frontend/dist/assets').find(x=>x.startsWith('index-')&&x.endsWith('.js'));const b=fs.readFileSync('C:/Users/jadoo/Desktop/eminence in life sciences/frontend/dist/assets/'+f,'utf8');console.log(b.includes('eminence-api-v2.onrender.com/api')?'OK baked':'MISSING')"
```
Expected: `OK baked`.

- [ ] **Step 3: Commit and push**

```bash
git add frontend/.env.production
git commit -m "chore(deploy): repoint VITE_API_URL to eminence-api-v2"
git push origin main
```
Expected: push succeeds (`old commit..new commit main -> main`). API v2 auto-deploys from this push; old API also rebuilds (harmless — being retired).

---

### Task 4: Create the new static service

**Files:**
- (none in repo)

- [ ] **Step 1: Verify API v2 deploy from Task 3 is live** (skip if already live)

```powershell
curl.exe -s "https://api.render.com/v1/services/<new-api-id>/deploys?limit=1" -H "Accept: application/json" -H "Authorization: Bearer rnd_JOVDgKdvz6PUSiTTcMzKLfEf8aNb"
```
Expected: `live`.

- [ ] **Step 2: Create static v2**

Write `C:\Users\jadoo\AppData\Local\Temp\opencode\create_static_v2.json`:
```json
{
  "type": "static",
  "name": "eminence-frontend-v2",
  "ownerId": "<owner.id>",
  "repo": "https://github.com/Aqibjadoon1/eminence-life-science",
  "branch": "main",
  "rootDir": "frontend",
  "autoDeploy": true,
  "envVars": [],
  "serviceDetails": {
    "buildCommand": "npm run build",
    "publishPath": "dist"
  }
}
```
Run:
```powershell
curl.exe -s -X POST "https://api.render.com/v1/services" -H "Accept: application/json" -H "Content-Type: application/json" -H "Authorization: Bearer rnd_JOVDgKdvz6PUSiTTcMzKLfEf8aNb" -d "@C:\Users\jadoo\AppData\Local\Temp\opencode\create_static_v2.json"
```
Expected: 201 with `service.id` and `service.url` (`https://eminence-frontend-v2.onrender.com`). If the old static service's config differs, mirror `serviceDetails` from `GET /v1/services/srv-da0601u7bikc73efc9r0` instead.

- [ ] **Step 3: Poll to live and confirm the corrected bundle is served**

Poll `deploys?limit=1` until `live`, then:
```powershell
curl.exe -s "https://eminence-frontend-v2.onrender.com/" | Select-String -Pattern "index-[A-Za-z0-9_-]+\.js" -AllMatches | ForEach-Object { $_.Matches.Value } | Select-Object -Unique
```
Expected: the new bundle hash. Confirm the bundle contains the v2 origin:
```powershell
curl.exe -s "https://eminence-frontend-v2.onrender.com/assets/<hash>.js" | Select-String -Pattern "eminence-api-v2" -SimpleMatch
```
Expected: a match.

---

### Task 5: Verify new stack with prod smoke suite

**Files:**
- Test: `C:\Users\jadoo\AppData\Local\Temp\opencode\verify_admin_prod_smoke.cjs` (copy to `verify_v2_smoke.cjs` and repoint constants)

- [ ] **Step 1: Copy and repoint the smoke harness**

Copy `verify_admin_prod_smoke.cjs` → `verify_v2_smoke.cjs` and change the constants:
```js
const ORIGIN  = 'https://eminence-frontend-v2.onrender.com';
const API     = 'https://eminence-api-v2.onrender.com';
const API_HOST = 'eminence-api-v2.onrender.com';
```
(API cookie domain MUST be the v2 host; ports, assertions, and admin password unchanged.)

- [ ] **Step 2: Run the smoke suite**

```powershell
node "C:\Users\jadoo\AppData\Local\Temp\opencode\verify_v2_smoke.cjs"
```
Expected: **7/7 PASS** — admin login `is_admin:true`, storefront product cards (≥20 via data), admin navbar link, `/admin` title+tabs+rows, no admin link for normal user, `/admin` redirects normal user.

---

### Task 6: Delete old services (old links die)

**Files:**
- (none in repo)

- [ ] **Step 1: Delete old API service**

```powershell
curl.exe -s -o NUL -w "HTTP %{http_code}" -X DELETE "https://api.render.com/v1/services/srv-da05vq67bikc73efbr2g" -H "Accept: application/json" -H "Authorization: Bearer rnd_JOVDgKdvz6PUSiTTcMzKLfEf8aNb"
```
Expected: HTTP 202.

- [ ] **Step 2: Delete old static service**

```powershell
curl.exe -s -o NUL -w "HTTP %{http_code}" -X DELETE "https://api.render.com/v1/services/srv-da0601u7bikc73efc9r0" -H "Accept: application/json" -H "Authorization: Bearer rnd_JOVDgKdvz6PUSiTTcMzKLfEf8aNb"
```
Expected: HTTP 202.

- [ ] **Step 3: Confirm old links are dead**

```powershell
curl.exe -s -o NUL -w "old frontend HTTP %{http_code}" "https://eminence-frontend.onrender.com/"
curl.exe -s -o NUL -w "old api HTTP %{http_code}" "https://eminence-api.onrender.com/api/health"
```
Expected: non-200 / connection error for both (404 or DNS failure) — old links no longer work.

---

### Task 7: Update docs and commit

**Files:**
- Modify: `docs/superpowers/specs/2026-08-20-fresh-deployment-design.md` (mark executed + actual URLs/service ids)
- Modify: `docs/superpowers/plans/2026-08-16-admin-product-manager.md` (Execution Record: append v2 links note; replace any old-URL references in prod smoke/grep sections)
- Repository-wide: `grep -rn "eminence-frontend.onrender.com\|eminence-api.onrender.com" --include=*.md --include=*.json --include=*.example` — replace with v2 URLs where they describe the LIVE deployment (leave historical commit references in plan text as-is).

- [ ] **Step 1: Update spec doc**

Add an "Execution Record" section to the spec: actual new service ids, URLs, date executed, smoke result (7/7), old services deleted.

- [ ] **Step 2: Update plan doc Execution Record**

Append: new links, new service ids, old services deleted, verification result. Update `CLIENT_URL`/`VITE_API_URL` references to v2.

- [ ] **Step 3: Grep repo for stale URLs and fix live references**

Run:
```powershell
rg -n "eminence-frontend\.onrender\.com|eminence-api\.onrender\.com" . -g "!*.png" -g "!*.jpg" -g "!*.jpeg"
```
Fix any that describe the current/live deployment (README, plan execution notes). Leave the old-URL mentions inside historical plan step text (they document what was done at the time).

- [ ] **Step 4: Commit**

```bash
git add docs/ README.md 2>/dev/null || git add docs/
git commit -m "docs(deploy): record fresh deployment — v2 URLs live, old services retired"
git push origin main
```

- [ ] **Step 5: Final sanity — auto-deploy pipeline intact**

Verify the push from Step 4 triggered a deploy on API v2 (auto-deploy works):
```powershell
curl.exe -s "https://api.render.com/v1/services/<new-api-id>/deploys?limit=2" -H "Accept: application/json" -H "Authorization: Bearer rnd_JOVDgKdvz6PUSiTTcMzKLfEf8aNb"
```
Expected: latest deploy `live` with the docs commit id.

---

## Execution Record (2026-08-20, completed)

All 7 tasks executed; extra operational fixes beyond the plan's steps:

- **API v2:** `srv-da3krirrn74s73fh8j80` → `https://eminence-api-v2.onrender.com` (health 200, admin login `is_admin:true`). Env vars: all 8 set (copied from old API; `CLIENT_URL` = frontend v2). Note: Render API service domain quirks — `type: web_service` (not `web`), `autoDeploy: "yes"` string, node settings in `serviceDetails.envSpecificDetails`, owner field `ownerID`.
- **Static v2:** `srv-da3l5qc9v7es7390k2cg` → `https://eminence-frontend-v2.onrender.com` (`type: static_site`, build `npm install && npm run build`, publish `./dist`).
- **Fix 1 (plan gap):** static first deploy served index.html but 404'd `/assets/*` — redeploy with `X-Render-Clear-Cache: clear` fixed it.
- **Fix 2 (plan gap):** deep SPA paths 404'd — added rewrite rule `/* → /index.html` via `PUT /v1/services/<static-id>/routes` (body = bare JSON array `[{"type":"rewrite","source":"/*","destination":"/index.html"}]`; routes are a sub-resource, not part of serviceDetails). Route id `rdr-da3l9u2jnfac739l4m80`.
- **Smoke:** `verify_v2_smoke.cjs` 7/7 PASS (same suite as the old stack, constants repointed).
- **Old services deleted:** `DELETE` HTTP 204 for API `srv-da05vq67bikc73efbr2g` + static `srv-da0601u7bikc73efc9r0`; both old URLs 404 now. (Transient 502 on v2 API right after deletion — Render instance blip; recovered, health 200.)
- **Docs:** render.yaml + robots.txt + sitemap.js comment + spec 2026-08-20 + admin plan execution record updated. Last push auto-deploy verified on API v2.

---

## Self-Review

**Spec coverage:**
- Fresh services created → Tasks 1, 4; env vars → Task 2; config repoint → Task 3; verification → Task 5; old services deleted → Task 6; docs → Task 7. No gaps.
- Same DB / JWT / admin creds → Task 2 Step 2 copies values verbatim; admin login verified in Task 2 Step 4 and Task 5.
- Zero-outage ordering → old services only touched in Task 6. ✓

**Placeholder scan:** `<new-api-id>` / `<owner.id>` are runtime values discovered in Task 1; each occurrence marks where the executing agent substitutes the captured value. `<ADMIN_PASSWORD copied in Step 1>` likewise. No TBD/TODO.

**Type consistency:** service ids/URLs named consistently (`eminence-api-v2`, `eminence-frontend-v2`, `new-api-id`) across tasks; smoke harness constants match Task 5 Step 1; `CLIENT_URL` target equals Task 4's static URL. ✓