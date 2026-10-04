// parseSearchQuery — NL → structured search params (Phase 7).
// Shows parsed interpretation (editable by user); never touches money/stock.

import type { ParsedSearch, TaskOutput, UnitType, VendorAdapter } from '../types.js';
import { QTY_RE, RADIUS_RE, PRICE_RE } from '../vendors/stub.js';
import { asPosInt, asUnit, extractJson, pickAdapter } from '../smart.js';

const PIDGIN_QTY: Array<[RegExp, number]> = [
  [/one\s+carton/i, 1],
  [/two\s+cartons?/i, 2],
  [/(\d+)\s+carton/i, 0], // handled by generic regex; marker only
];

const UNIT_WORDS: Array<[RegExp, UnitType]> = [
  [/cartons?/i, 'carton'],
  [/packs?|packets?|sachets?|bags?/i, 'pack'],
  [/pieces?|\bpcs\b|bottles?/i, 'piece'],
];

const KNOWN_PRODUCTS = [
  'indomie', 'milo', 'sugar', 'water', 'coke', 'peak milk', 'peak',
  'dangote', 'aqua', 'eva water', 'golden penny', 'honeywell', 'maggi', 'knorr',
];

export function ruleParse(text: string): ParsedSearch {
  const lower = text.toLowerCase();
  let qty = 1;
  const qm = text.match(QTY_RE);
  if (qm) qty = parseInt(qm[1], 10);
  else for (const [re, n] of PIDGIN_QTY) {
    const m = text.match(re);
    if (m) { qty = n === 0 ? parseInt(m[1], 10) : n; break; }
  }
  // "abeg", "i wan buy", "find me" → still qty 1 unless specified.
  let unit_type: UnitType = 'piece';
  for (const [re, u] of UNIT_WORDS) if (re.test(text)) { unit_type = u; break; }
  // Default bulk: bare "carton(s)" without pack/piece mention → carton.
  if (/carton/i.test(text)) unit_type = 'carton';

  const rm = text.match(RADIUS_RE);
  const radius_km = rm ? parseFloat(rm[1]) : 5;

  const pm = text.match(PRICE_RE);
  const max_price_kobo = pm ? Math.round(parseFloat(pm[1].replace(/,/g, '')) * 100) : null;

  // Product query: all known-product hits (brand + product), dropping any hit
  // already contained in a longer one, joined in text order.
  // "Golden Penny sugar" → "golden penny sugar" (not just the brand).
  const hits: Array<{ p: string; i: number }> = [];
  for (const p of KNOWN_PRODUCTS) {
    const i = lower.indexOf(p);
    if (i >= 0) hits.push({ p, i });
  }
  const kept = hits.filter((h) => !hits.some((o) => o.p !== h.p && o.p.includes(h.p)));
  kept.sort((a, b) => a.i - b.i);
  let q = kept.map((h) => h.p).join(' ');
  if (!q) {
    q = text
      .replace(QTY_RE, ' ').replace(RADIUS_RE, ' ').replace(PRICE_RE, ' ')
      .replace(/\b(abeg|please|i wan(t)? buy|i want|find me|show me|within|under|below|near me|around|for my shop|for shop)\b/gi, ' ')
      .replace(/\s+/g, ' ').trim().slice(0, 80) || text.slice(0, 80);
  }
  return { q, qty, unit_type, radius_km, max_price_kobo };
}

export function interpretationOf(p: ParsedSearch): string {
  const price = p.max_price_kobo == null ? 'any price' : `max ₦${(p.max_price_kobo / 100).toLocaleString('en-NG')}`;
  return `Search "${p.q}" × ${p.qty} ${p.unit_type}(s), within ${p.radius_km} km, ${price}. Edit any field before searching.`;
}

export async function parseSearchQuery(
  text: string,
  adapter?: VendorAdapter,
): Promise<TaskOutput<ParsedSearch>> {
  // Cloud LLM first (validated + rule-backed per field), rules as ground truth.
  const a = await pickAdapter(adapter);
  if (a) {
    try {
      const out = await a.complete(
        `Extract FMCG search params as JSON {"q": product words, "qty": integer, "unit_type": "piece"|"pack"|"carton", "radius_km": number, "max_price_kobo": integer|null} from: ${text}`,
        { temperature: 0, maxTokens: 256 },
      );
      const j = extractJson(out.text);
      const fb = ruleParse(text);
      const data: ParsedSearch = {
        q: typeof j.q === 'string' && j.q.trim() ? j.q.trim().slice(0, 120) : fb.q,
        qty: asPosInt(j.qty, fb.qty),
        unit_type: asUnit(j.unit_type, fb.unit_type),
        radius_km: typeof j.radius_km === 'number' && j.radius_km > 0 && j.radius_km <= 100 ? j.radius_km : fb.radius_km,
        max_price_kobo: typeof j.max_price_kobo === 'number' && j.max_price_kobo > 0 ? Math.round(j.max_price_kobo) : fb.max_price_kobo,
      };
      return { data, confidence: 0.9, needsConfirm: true, interpretation: interpretationOf(data), model: out.model };
    } catch {
      /* fall through to deterministic rules */
    }
  }
  const data = ruleParse(text);
  return {
    data,
    confidence: data.q ? 0.85 : 0.4,
    needsConfirm: true,
    interpretation: interpretationOf(data),
    model: 'stub/rule-parse-v1',
  };
}
