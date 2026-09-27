# FMCG Open Market — Detailed Implementation Plan

Source: `docs/FMCG OPEN MARKET.md` v0.3 (§6 requirements, §14 data model, §15 stack, §18 backlog, §19 acceptance, §20 roadmap, §26 start plan)
Architecture: `docs/ARCHITECTURE.md`
Market: Nigeria, pilot Lagos. Brand TBD.

Planned monorepo (scaffold next): `apps/web`, `apps/mobile`, `services/api`,
`packages/shared`, `packages/ai`, `infra/db`, `infra/docker`, `docs/api-contracts`.

---

## Phase -1 — Workstation setup (free tools only, with commands)

Status: Git installed. Docker + Node auto-install running in background.

```powershell
# 1) Docker (containers for Postgres/PostGIS + Redis, free for personal/small use)
winget install --id Docker.DockerDesktop -e --accept-package-agreements --accept-source-agreements --silent
# Fully-free open-source alternative if Docker Desktop licence ever bites:
# winget install --id Rancher.RancherDesktop -e --accept-package-agreements --accept-source-agreements --silent

# 2) Node LTS (API + web, free/open-source)
winget install --id OpenJS.NodeJS.LTS -e --accept-package-agreements --accept-source-agreements --silent

# 3) Verify (close + reopen PowerShell first so PATH refreshes)
docker --version
docker compose version
node --version
npm --version

# 4) Start the stack (from repo root, once infra/docker exists)
docker compose -f infra/docker/docker-compose.yml up -d
docker compose -f infra/docker/docker-compose.yml ps
```

Windows note: Docker Desktop needs WSL2 enabled (it prompts on first run) + one restart.
If Docker will not run on your PC, fallback is local installs of PostgreSQL + Redis —
same code, only the connection strings change.

---

## Cost policy — free or minimal-fee tooling (top-grade, free alternatives first)

Rule: build entirely on free tiers; pay only per-use where money/SMS move.

| Need | Free choice (use this) | Cost | Paid alternative it replaces |
| ---- | ---- | ---- | ---- |
| Containers | Docker Desktop (personal/small-biz free) or Rancher Desktop (fully free) | ₦0 | — |
| Frontend web | Next.js + React + Tailwind (open-source) | ₦0 | — |
| Mobile | Expo + React Native (free tier covers pilot) | ₦0 | — |
| Backend | Node + TypeScript + Fastify (open-source) | ₦0 | — |
| Database + geo | PostgreSQL + PostGIS in Docker (open-source) | ₦0 | Managed Postgres only at scale |
| Cache/queues | Redis in Docker (open-source) | ₦0 | Managed Redis only at scale |
| Maps/geocode | OpenStreetMap + Nominatim + Leaflet (free, attribution) | ₦0 | Google Maps (pay per call) |
| Push | Expo Push + Firebase FCM (free) | ₦0 | OneSignal paid tiers |
| Email | Resend or Brevo free tier (~100–300/day, enough for pilot) | ₦0 | Paid SMTP |
| SMS/OTP | Minimise: OTP via WhatsApp/push first; Termii pay-per-SMS only when needed | minimal, per SMS | Bulk SMS contracts |
| AI | Ollama local models (free) for dev + Groq/Gemini free tiers for pilot; vendor-abstracted so we switch without code changes | ₦0 | OpenAI paid API |
| Payments | Paystack/Flutterwave sandbox free; live = per-transaction fee only, no setup fee | per transaction | — |
| Hosting (pilot) | Render free tier or Oracle Cloud free tier; Docker image runs anywhere | ₦0 | Paid VPS only if free tier limits hit |
| CI | GitHub Actions free tier | ₦0 | — |
| Editor | VS Code (free) | ₦0 | — |

Never-commit-to-paid rule: PSP, maps, SMS and AI vendors sit behind interfaces
(`services/api` provider adapters, `packages/ai` vendor abstraction), so a free
choice today can be swapped for a paid one later with zero business-logic changes.

---

## Phase 0 — Design system + UX flows (no code yet)

Goal: every screen in PRD §26 Step 7 is wireframed against one token set before building.

1. **Design tokens** (light + dark later): colors (primary, success, warning, danger),
   spacing scale, radius, typography (display/body/caption, support for long product names),
   ₦ money formatting (`NGN`, kobo integers in code, formatted display).
2. **Core component library** (build once in `apps/web/components`):
   ProductCard, PriceBlock (retail vs bulk-break display), StockBadge + freshness dot,
   SellerCard + trust chips (Tier-1/2), DistanceChip, CartLine (unit-type selector),
   QuoteCard (version history), OrderTracker (lifecycle steps), OTPInput, PODCapture,
   DisputeForm, RatingInput (FMCG reasons), ZonePicker, SearchBar (+ voice later).
3. **B2C screens**: splash, signup, home, search, categories, product, seller, cart,
   checkout, payment, order tracking, chat, reviews, reorder.
4. **B2B procurement screens**: procurement dashboard, bulk search, RFQ composer,
   quotes inbox (versions/counter-offers), supplier compare, supplier follow list,
   procurement lists, scheduled-delivery picker, PO/invoice view.
5. **Seller screens**: dashboard, products, add-SKU (unit types + bulk breaks),
   canonical-link step, inventory, orders, quotes, customers, messages, AI assistant, analytics.
6. **Logistics screens** (mobile-first): jobs queue, pickup confirm, delivery + OTP,
   POD photo/signature, COD collection record, exception reporting, earnings.
7. **Admin screens**: dashboard, users, sellers (Tier approval), canonical moderation queue,
   products, orders, payments/settlement, logistics/COD recon, disputes, fraud/risk, AI audit, reports.
8. **Gate**: clickable flows for §5.1 shopper, §5.2 retail RFQ, §5.3 seller, logistics, admin/dispute.

## Phase 1 — Architectural decisions (ADRs) + repo scaffold

Record each as `docs/adr/NNNN-title.md` (context → decision → consequences):

- ADR-01 monorepo + TypeScript everywhere (single `packages/shared` types/zod).
- ADR-02 web: Next.js App Router; admin + seller portal same app, route-grouped.
- ADR-03 mobile: Expo (buyer + logistics), shared API client with web.
- ADR-04 API: Node + TypeScript (Fastify/Express), modular monolith first; module
  boundaries = `services/api/src/modules/*` (identity, catalog, search, cart-orders,
  quotes, payments, logistics, trust, admin).
- ADR-05 data: PostgreSQL + PostGIS (geo), Redis (cache/queues/jobs). Money as
  integer kobo; quantities as integers per unit type.
- ADR-06 PSP abstraction: provider interface (initialize, verify webhook, refund,
  settle) so Paystack/Flutterwave/others swap without touching order logic.
- ADR-07 auth: phone/OTP + email/password; short JWT + refresh rotation; MFA for
  admin/finance; RBAC by profile context (buyer/seller/dual) + Tier-1/2 gates.
- ADR-08 storage: S3-compatible for product/POD/dispute images (signed URLs).
- ADR-09 AI vendor abstraction (`packages/ai`): NL-parse → structured search params,
  listing copilot, sales/reorder copilots; all high-impact outputs require human confirm;
  log prompts/outputs for audit.
- ADR-10 notifications: SMS/email/push (+WhatsApp later) via one queue interface.
- Scaffold: `infra/docker` compose (postgres/postgis, redis, api, web), lint/test/CI,
  `.env.example`, seed script for Lagos demo data.

```powershell
# Monorepo + toolchain (all free/open-source)
npm install -g pnpm                              # fast free package manager (or use npm)
pnpm init                                        # run at repo root after scaffold lands
npx create-next-app@latest apps/web --typescript --tailwind --app
npx create-expo-app@latest apps/mobile --template blank-typescript
pnpm --filter ./services/api init; pnpm --filter ./services/api add fastify zod
docker compose -f infra/docker/docker-compose.yml up -d     # postgres/postgis + redis
docker compose -f infra/docker/docker-compose.yml logs -f   # watch first boot
```

## Phase 2 — Data model + migrations (`infra/db/migrations`)

Per PRD §14 (+ v0.3 additions). Order: users/profiles → canonical products →
offers/inventory → zones → carts/order-groups → quotes → orders/payments/settlements →
delivery jobs → conversations → disputes/reviews → audit events.

Key tables/constraints:
- `users`, `buyer_profiles`, `seller_profiles` (dual-profile link), verification tier.
- `canonical_products` (status: canonical/pending/duplicate) ← `seller_offers`
  (unit types + conversion, price, bulk_breaks JSONB, MOQ, zones, on_hand/reserved).
- `delivery_zones` (PostGIS polygon/radius + fee + min_order + windows).
- `carts` (single seller CHECK), `order_groups` (payment session → child orders).
- `quotes` + `quote_versions` (counter-offer chain, expiry), `orders` (lifecycle enum
  separate from `payment_state`), `payment_transactions` + `payment_events` (immutable),
  `settlements` (per-seller split), `delivery_jobs` (OTP hash, POD), `disputes`,
  `reviews`, `audit_events` (append-only).
- Every inventory mutation writes an audit row; oversell blocked by
  `available = on_hand - reserved` CHECK + row locking on reserve.
- Gate: migrations up/down clean; seed creates 3 zones, 5 sellers, 20 canonical
  products, 40 offers.

```powershell
# Migrate + seed (free local Postgres/PostGIS in Docker)
pnpm --filter ./services/api db:migrate
pnpm --filter ./services/api db:seed
pnpm --filter ./services/api db:rollback -- --steps 1   # verify down-migration
```

## Phase 3 — API contracts (`docs/api-contracts/*.openapi.yaml` + zod in `packages/shared`)

One contract file per module; backend + web + mobile all generate from these:
- `identity`: register/OTP/login/refresh, profiles (switch context), addresses, tier upgrade.
- `catalog`: canonical CRUD (admin), offer CRUD, image upload URLs, moderation queue.
- `search`: `q`, category, brand, SKU, lat/lng + radius/zone, unit-type, MOQ, seller-tier;
  response = offers with price/stock/distance/seller + alternative-seller block.
- `cart-orders`: cart CRUD (MOQ/zone validation), checkout (idempotency key) →
  order group + child orders; order lifecycle transitions; reorder.
- `quotes`: RFQ create, quote versions, counter, accept (PO ref) → order, decline/expire.
- `payments`: initialize, webhook (signature-verified, retry-safe), status, refund request.
- `logistics`: partners/drivers, job assign/accept/pickup/deliver (OTP), POD, COD
  collect + reconcile, exceptions.
- `trust`: reviews, reports, disputes (open/evidence/resolve), appeal.
- `admin`: user/seller moderation, canonical dedup, payment/settlement review,
  dispute SLA, AI audit, analytics (GMV, conversion, freshness, dispute/COD rates).
- Gate: contract tests (schema validation) pass; mock server serves web/mobile dev.

```powershell
# Contract tests + mock server (all free)
pnpm --filter ./packages/shared test        # zod schema tests
pnpm --filter ./services/api test:contracts # OpenAPI validation
npx @stoplight/prism-cli mock docs/api-contracts/search.openapi.yaml  # local mock API
```

## Phase 4 — Backend build order (`services/api`)

1. `common`: error model, auth middleware, RBAC, idempotency, audit writer, geo utils.
2. `identity` (ACC-01..07) incl. guest-browse policy + Tier gates.
3. `catalog` (CAT-01..09) incl. canonical link + moderation queue.
4. `search` (SRCH-01..06) PostGIS: B2C proximity rank, B2B zone+stock-depth rank.
5. `cart-orders` (ORD-01,05..07, CART-01..03) + reserve/release transactions.
6. `quotes` (ORD-02..04) version chain + expiry job + accept→order.
7. `payments` (protected + COD states, webhook verify, per-seller split, refunds).
8. `logistics` (LOG-01..03, OTP/POD, COD recon rules: cap + Tier-2 + history).
9. `trust` (REV-01, disputes workflow §9.2, fraud signals advisory §9.3).
10. `admin` + analytics endpoints (§17 KPIs).
- Gate per module: unit + integration tests, incl. oversell race test, double-webhook
  test, expired-quote test.

```powershell
# Daily backend loop (free toolchain)
docker compose -f infra/docker/docker-compose.yml up -d
pnpm --filter ./services/api dev            # API on localhost:3001
pnpm --filter ./services/api test           # unit + integration
pnpm --filter ./services/api test:e2e       # oversell race, webhook replay, quote expiry
```

## Phase 5 — Web app (`apps/web`)

Build in this order: design-system components → buyer B2C → buyer B2B procurement →
seller portal → admin console. Checkout always shows: item price, bulk discount,
delivery fee, payment method, protection/COD terms (per §7 + CART-02).
Gate: §19 acceptance scripts pass on staging (search, retail RFQ→order, seller SKU
publish, reserve correctness, checkout totals, webhook-confirmed payment, COD POD run,
dispute lifecycle, AI listing approve flow, audit coverage).

```powershell
pnpm --filter ./apps/web dev                # web on localhost:3000
pnpm --filter ./apps/web build              # production check (free Next.js)
```

## Phase 6 — Mobile app (`apps/mobile`, Expo)

Buyer parity for search/cart/orders/chat + logistics role (jobs, OTP, POD, COD).
Offline-tolerant job list (queue status updates). Gate: full COD field run on staging.

```powershell
npx expo start                               # scan QR with free Expo Go app
npx expo run:android                          # or run:ios on a Mac
```

## Phase 7 — AI layer (`packages/ai`)

- NL search parser → `search` params (shows parsed interpretation, editable).
- Listing copilot + catalogue normalizer (draft only; seller publishes).
- Alternative-seller + substitute matcher (canonical-based).
- Reorder assistant + seller sales/replenishment copilots (recommendations only).
- Guardrails per §10.3: confidence display, PII minimization, audit logs, evals vs
  marketplace outcomes (search→order rate, listing accept rate).
- Gate: AI P1 items demoable without touching money/stock directly.

```powershell
# Free local AI first (no API bill while building)
ollama pull llama3.1                         # one-time model download, free/open weights
ollama run llama3.1                          # smoke-test local inference
pnpm --filter ./packages/ai eval             # copilot quality evals
# Pilot cloud fallback (free tiers): Groq or Gemini API key in .env only
```

## Phase 8 — Integrations

PSP sandbox→live (checkout, webhooks, refunds, settlement recon), SMS/email/push
(+WhatsApp), maps/geocoding, S3 storage, error/APM monitoring, backups + restore test.
Compliance pass: NDPA 2023 notices/consents, FCCPC terms (pricing, refunds, complaints),
licensed-PSP + logistics-partner verification checklist (§23).

```powershell
# Webhook tunnel for PSP sandbox testing (free)
npx ngrok http 3001                          # or: npx localtunnel --port 3001
# Point the Paystack/Flutterwave sandbox webhook URL at the tunnel /payments/webhook
```

## Phase 9 — QA + acceptance (§19)

Matrices: B2C instant order; B2B bulk RFQ→quote→order→scheduled delivery;
COD cap/gating; dispute→pause-settlement→resolution; inventory race; webhook replay;
role/Tier negative tests. Staging UAT with 5 shops + 3 wholesalers before pilot.

## Phase 10 — Lagos pilot (§20 Phase 5)

Seeded geography, Tier-2 seller cohort, 3 FMCG clusters (groceries, beverages,
household essentials), 1–2 logistics partners. Track §17 KPIs weekly:
search-to-view, view-to-order, completion, freshness, nearby-match, repeat, response
time, dispute rate, COD recon rate, AI-assisted rate. Iterate pricing/fees (§21) from data.

## Phase 11 — Hardening + scale prep (§20 Phase 6)

Rate limits/bot controls, queue autoscaling, read replicas, search index upgrade path,
COD policy tuning, sponsored-products/ads behind flags, multi-city rollout plan.

---

## Risks → mitigations (§22, wired to phases)

Cold start → Phase 10 concentrated cohort. Inventory trust → Phase 4 reserve/audit +
freshness UI. Off-platform leakage → in-platform quote/chat + protection benefits.
COD fraud → caps + Tier-2 + recon SLA. Payment disputes → PSP ledger + dispute SOP.
Expired/misleading FMCG → verification tiers + report/expiry-reason flows. AI errors →
human-confirm + evals.

## Definition of done (MVP)

PRD §19 all green on staging + pilot KPIs instrumented + audit covers every
payment/settlement/dispute/inventory/user-status action + rollback + restore tested.
