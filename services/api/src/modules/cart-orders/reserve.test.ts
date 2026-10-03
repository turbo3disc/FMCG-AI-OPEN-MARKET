// Reserve correctness — oversell race (Phase 9, QA #4).
// node:test + assert only. Fake store with row-lock semantics:
// available = on_hand - reserved; parallel reserves must never oversell.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

function makeStore(onHand: number) {
  let reserved = 0;
  const audit: Array<{ qty: number; ok: boolean }> = [];
  // Simulate atomic row lock with a promise chain (serializes reserves).
  let tail: Promise<void> = Promise.resolve();
  function reserve(qty: number): Promise<boolean> {
    const run = tail.then(() => {
      const ok = reserved + qty <= onHand;
      if (ok) reserved += qty;
      audit.push({ qty, ok });
      return ok;
    });
    // Keep chain alive even on failure.
    tail = run.then(() => undefined, () => undefined);
    return run;
  }
  return { reserve, state: () => ({ onHand, reserved, available: onHand - reserved }), audit };
}

describe('inventory reserve race', () => {
  it('5 on_hand vs 10 parallel reserves of 1 → exactly 5 succeed, none oversell', async () => {
    const store = makeStore(5);
    const results = await Promise.all(Array.from({ length: 10 }, () => store.reserve(1)));
    const okCount = results.filter(Boolean).length;
    assert.equal(okCount, 5);
    const s = store.state();
    assert.equal(s.reserved, 5);
    assert.ok(s.available >= 0);
    assert.equal(store.audit.length, 10);
  });

  it('reserve beyond available is rejected and audited', async () => {
    const store = makeStore(2);
    assert.equal(await store.reserve(2), true);
    assert.equal(await store.reserve(1), false);
    assert.equal(store.state().available, 0);
  });
});
