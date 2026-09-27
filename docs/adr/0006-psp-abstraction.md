# ADR-0006 — PSP abstraction (Paystack/Flutterwave swappable)

Status: accepted.

Context: protected payments and COD reconciliation must survive a provider switch;
live fees are per-transaction, so the choice should stay reversible.

Decision: `services/api/src/modules/payments/provider.ts` interface —
`initialize`, `verifyWebhook`, `refund`, `settle`. Paystack sandbox first,
Flutterwave second. The ledger (`payment_transactions` + immutable events) is
authoritative; webhooks only confirm.

Consequences: provider swap = new adapter, zero order-logic changes; tests run
against a fake provider.
