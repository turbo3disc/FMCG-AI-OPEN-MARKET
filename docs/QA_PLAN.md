# QA Plan — acceptance matrix (PRD §19, Phase 9)

Money in kobo integers. Each row: steps + expected result + B2C/B2B tag.
Staging UAT: 5 shops + 3 wholesalers before pilot.

| # | PRD §19 case | Tag | Steps | Expected result |
|---|--------------|-----|-------|-----------------|
| 1 | Buyer search | B2C | 1. GET /search?q=Indomie&lat=6.45&lng=3.39 2. Check distance/stock sorting 3. Open alternative-seller block | Offers ranked by proximity; in-stock first; alternatives shown for OOS items |
| 2 | Retail RFQ→order | B2B | 1. POST /rfqs (10 cartons Milo, zone, window) 2. Seller POST /rfqs/{id}/quotes 3. Buyer counter 4. Seller counter 5. POST /quotes/{id}/accept with po_ref | Version chain preserved; accept creates order with PO ref; RFQ closed |
| 3 | Seller SKU publish | Both | 1. POST /offers (unit types, bulk breaks, MOQ) 2. POST /offers/{id}/link 3. Admin approves in /moderation/queue | Offer live and linked to canonical; pending state visible until approval |
| 4 | Reserve correctness | Both | 1. Seed on_hand=5 2. Fire 10 parallel reserves ×1 (see reserve.test.ts) 3. Check available = on_hand − reserved ≥ 0 | Exactly 5 succeed, 5 rejected; no oversell; audit rows written |
| 5 | Checkout totals | B2C | 1. Cart 3× pack @ bulk break 2. POST /checkout with idempotency key 3. Retry same key | Item price + bulk discount + delivery fee correct; retry returns same group, no double order |
| 6 | Webhook payment | Both | 1. POST /payments/initialize 2. POST /payments/webhook twice with same reference (see webhook.test.ts) | Single PROTECTED transition; dedupe by reference+event; ledger has one credit |
| 7 | COD POD run | B2C | 1. Checkout payment_method=cod 2. Accept→pickup→deliver with OTP+POD photo 3. POST /cod-collect | COD_PENDING_COLLECTION → COD_RECONCILED after collect; OTP mismatch rejected |
| 8 | Dispute lifecycle | Both | 1. POST /disputes (order) 2. Settlement paused 3. POST evidence 4. POST /resolve outcome=refund 5. Appeal | Settlement frozen on open; refund settles to buyer; appeal reopens within window |
| 9 | AI listing approve | Seller | 1. draftListing("indomie 70g carton") → draft:true 2. Seller edits title 3. Seller publishes | Nothing live before publish; audit log has prompt/output/confidence |
| 10 | Audit coverage | Both | 1. Run payment→settlement→dispute→inventory→status-change flow 2. Query audit_events | Every payment/settlement/dispute/inventory/user-status action has an append-only row |

## Negative / Tier tests

- Guest browse allowed; guest checkout blocked (401 + login prompt).
- Tier-1 seller COD capped; Tier-2 uncapped within policy (LOG-03 recon rules).
- Expired quote accept → 410 Gone.
- Double webhook → 200 deduped, single effect (webhook.test.ts).
- Oversell race → 5/10 succeed (reserve.test.ts).

## AI eval gate

`pnpm --filter ./packages/ai eval` → 10/10 fixtures (pidgin + formal English)
before any vendor swap demo.
