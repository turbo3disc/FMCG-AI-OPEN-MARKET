// Tiny eval runner: stub adapter over 10 FMCG fixtures. Prints pass/fail.
// Run: pnpm --filter ./packages/ai eval   (node --experimental-strip-types src/eval.ts)

import { FIXTURES } from './fixtures.js';
import { ruleParse } from './tasks/parseSearchQuery.js';

let pass = 0;
for (const f of FIXTURES) {
  const got = ruleParse(f.input);
  const okQ = got.q.toLowerCase().includes(f.expectQ);
  const ok = okQ && got.qty === f.expectQty && got.unit_type === f.expectUnit && got.radius_km === f.expectRadius;
  if (ok) pass++;
  console.log(`${ok ? 'PASS' : 'FAIL'} | "${f.input}"`);
  if (!ok) {
    console.log(`  expected q~${f.expectQ} qty=${f.expectQty} unit=${f.expectUnit} r=${f.expectRadius}`);
    console.log(`  got      q="${got.q}" qty=${got.qty} unit=${got.unit_type} r=${got.radius_km}`);
  }
}
console.log(`\n${pass}/${FIXTURES.length} fixtures passed.`);
process.exit(pass === FIXTURES.length ? 0 : 1);
