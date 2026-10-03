// Webhook idempotency — replay same PSP event twice, expect single effect (QA #6).
// node:test + assert only. Fake ledger keyed by reference+event.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

type PaymentState = 'PENDING' | 'PROTECTED';

function makeLedger() {
  const seen = new Set<string>();
  const events: Array<{ reference: string; event: string }> = [];
  let state: PaymentState = 'PENDING';
  function webhook(reference: string, event: string): { deduped: boolean; state: PaymentState } {
    const key = `${reference}:${event}`;
    if (seen.has(key)) return { deduped: true, state };
    seen.add(key);
    events.push({ reference, event });
    if (event === 'charge.success') state = 'PROTECTED';
    return { deduped: false, state };
  }
  return { webhook, getState: () => state, count: () => events.length };
}

describe('payment webhook replay', () => {
  it('same reference+event twice → single PROTECTED transition', () => {
    const ledger = makeLedger();
    const first = ledger.webhook('ref_123', 'charge.success');
    assert.equal(first.deduped, false);
    assert.equal(first.state, 'PROTECTED');
    const second = ledger.webhook('ref_123', 'charge.success');
    assert.equal(second.deduped, true);
    assert.equal(second.state, 'PROTECTED');
    assert.equal(ledger.count(), 1);
  });

  it('distinct events are not deduped', () => {
    const ledger = makeLedger();
    ledger.webhook('ref_123', 'charge.success');
    ledger.webhook('ref_123', 'charge.failed');
    assert.equal(ledger.count(), 2);
  });
});
