# Go live without Netlify

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
