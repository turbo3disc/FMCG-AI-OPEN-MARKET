# FMCG Open Market — Architecture (v0.3, B2B + B2C)

Source PRD: `docs/FMCG OPEN MARKET.md` v0.3
Stack per PRD §15: Next.js/React (web) + Expo (mobile) + Node+TS API + Postgres/PostGIS + Redis/queue + S3 storage + PSP + LLM layer.

## Monorepo layout

```
apps/web/              # Next.js: buyer marketplace (B2C instant + B2B procurement), seller portal, admin console
apps/mobile/           # Expo: buyer + logistics (jobs, OTP, POD, COD collection)
services/api/src/
  modules/identity/    # ACC-01..07: auth, dual buyer/seller profiles, Tier-1/2 verification, guest browse
  modules/catalog/     # CAT-01..09: canonical products + seller offers, units, bulk breaks, dedup queue
  modules/search/      # SRCH-01..06: keyword/SKU/category + AI NL parse, proximity vs zone ranking
  modules/cart-orders/ # ORD-01,05..07 + CART-01..03: single-seller carts, grouped multi-seller orders, lifecycle machine
  modules/quotes/      # ORD-02..04: RFQ v2 versioned counter-offers, expiry, PO/invoice, partial accept
  modules/payments/    # protected + COD_PENDING_COLLECTION/RECONCILED, webhooks, per-seller split settlement
  modules/logistics/   # LOG-01..03: zones, partner/driver jobs, OTP/POD, exceptions, COD reconciliation
  modules/trust/       # REV-01, disputes, reports, FMCG reasons (expired/damaged/wrong)
  modules/admin/       # users, sellers, canonical moderation, orders, payments, disputes, AI audit
  common/              # authZ, errors, idempotency, audit log, geo utils, notifications
packages/shared/       # shared TS types, zod schemas, money/qty helpers
packages/ai/           # conversational search parser, listing copilot, reorder/sales copilots, eval logs
infra/db/migrations/   # Postgres + PostGIS schema: users, profiles, canonical products, offers, zones, carts, order groups, quotes, payments, settlements, delivery jobs, disputes
infra/docker/          # local Postgres/PostGIS + Redis + API + web compose
docs/api-contracts/    # per-module OpenAPI/zod contracts (to be generated in Phase 1)
```

## Request flows

**B2C instant:** browse (guest) → search (radius 3–5km) → offer → cart (MOQ/zone check) → checkout (fee + protection terms) → PSP protect → reserve stock → fulfill → POD/OTP → confirm/timer → per-seller settle → review → reorder.

**B2B quote-to-order:** search (zone coverage + stock depth) → compare suppliers → RFQ → versioned quote/counter → accept (PO + invoice) → schedule delivery → pay protected or Tier-2 COD → POD → reconcile → reorder from procurement list.

## Key decisions enforced in code (not prompts)

- Money movement only via PSP webhooks + reconciliation; DB flags are not proof.
- Idempotency keys on checkout, webhooks, settlement.
- Order lifecycle ≠ payment state; both logged to immutable audit.
- Canonical product required for alternative-seller results.
- Single-seller cart MVP; multi-seller = order group + one payment session.
- COD caps + Tier-2 gating + history checks before offering COD.
- Human approval for price/order/refund/settlement/restriction actions.

## Build order (maps to PRD §20)

- Phase 1 Foundation: identity, catalog+canonical, search+PostGIS, location zones, admin shell.
- Phase 2 Transactions: cart-orders, quotes v2, payments+webhooks+split settlement.
- Phase 3 Logistics+Trust: jobs/OTP/POD/COD, reviews/disputes.
- Phase 4 AI: NL search, listing copilot, alternative-seller, reorder assistant.
- Phase 5 Lagos pilot: seeded zones, Tier-2 cohort, selected FMCG categories.
