# Go live — hosting guide (Netlify web + Render API)

## Option 0 — Netlify (free domain, auto-deploy) — RECOMMENDED for the web

Netlify hosts the **storefront only** (`apps/web`). The Fastify API still needs
Render (below) — Netlify can't run long-lived Node servers.

**One-time connect (~3 min, you do this in your Netlify account):**
1. Netlify → **Add new site → Import an existing project → GitHub** → pick
   `turbo3disc/FMCG-AI-OPEN-MARKET`.
2. Settings Netlify auto-fills from `netlify.toml` — confirm:
   - Base directory: `apps/web` — Build: `npm ci && npm run build` — Publish: `apps/web/.next`
3. **Site settings → Environment variables** → add:
   - `NEXT_PUBLIC_API_URL` = `https://<your-api>.onrender.com/api` (after Render step below)
4. **Deploy site** → you get `https://<yourname>.netlify.app` free. Change the
   name under Site settings → Site name.
5. Back in the Render API service, set `FRONTEND_URL=https://<yourname>.netlify.app` and redeploy.

**Auto-deploy:** every `git push` to `main` rebuilds + republishes automatically.
Branch pushes get free preview URLs. Nothing to run — pushing IS deploying.

> honestly: Netlify fits the web frontend well. The earlier "skip Netlify"
> advice was about the API, which still belongs on Render/Fly/VPS.

Netlify is intentionally skipped: Next.js is native on Vercel, and the
Fastify API needs a long-running Node host (Render/Fly/Railway/VPS).

## Option A — fastest public link (~10 min, free tiers)

1. **API on Render**
   - New → Web Service → import `FMCG-AI-OPEN-MARKET` → Root Directory `services/api`
   - Build: `npm ci && npm run build` — Start: `npm start` — Health: `/health`
   - Env: `DATABASE_URL` (Neon pooled URL), `JWT_SECRET` (generate),
     `FRONTEND_URL` (fill after step 2), `PSP_PROVIDER=paystack-sandbox`
   - Note the URL: `https://fmcg-api-xxxx.onrender.com`

2. **Web on Vercel**
   - Import same repo → Root Directory `apps/web` → Framework Next.js
   - Env: `NEXT_PUBLIC_API_URL=https://fmcg-api-xxxx.onrender.com/api`
   - Deploy → you get `https://<project>.vercel.app` ← share this to test live.

3. **Wire CORS/domain**
   - Back in Render API, set `FRONTEND_URL=https://<project>.vercel.app`, redeploy.
   - Test: `<api>/health` → `{"ok":true}`, `<api>/ready` → `{"db":"up"}`.

## Option B — single VPS with Docker

```bash
export DATABASE_URL='postgresql://...'  # Neon pooled URL
export JWT_SECRET='long-random-string'
export FRONTEND_URL='https://web.example.com'
export NEXT_PUBLIC_API_URL='https://api.example.com/api'
docker compose -f infra/docker/docker-compose.prod.yml up -d --build
curl http://localhost:3001/health
curl http://localhost:3000/
```

Put Caddy/Nginx in front for HTTPS + your domain.

## Env checklist (production)

- `DATABASE_URL` — Neon pooled URL (Neon dashboard → Connect → pooled)
- `JWT_SECRET` — `openssl rand -base64 32`
- `FRONTEND_URL` — public web URL (for API CORS)
- `NEXT_PUBLIC_API_URL` — public API URL + `/api` (for web build)
- `PSP_SECRET_KEY` — Paystack live/secret when taking real money
- `ADMIN_PASSWORD` — super-admin console password (default `SuperAdmin@2026` — change before going live)
