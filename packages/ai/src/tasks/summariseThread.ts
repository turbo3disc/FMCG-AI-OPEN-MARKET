// summariseThread — chat messages → order-confirmation summary (buyer confirms).

import type { TaskOutput, ThreadSummary, VendorAdapter } from '../types.js';
import { QTY_RE, PRICE_RE } from '../vendors/stub.js';

const DELIVERY_RES = [
  /deliver(?:y)?\s+(?:on\s+)?(monday|tuesday|wednesday|thursday|friday|saturday|sunday|tomorrow|today|[\w\s,]+?\d{1,2}(?:st|nd|rd|th)?)/i,
  /(pickup|self[-\s]?pickup|come and collect|i go come)/i,
];

export function ruleSummarise(messages: string[]): ThreadSummary {
  const text = messages.join('\n');
  const qm = text.match(QTY_RE);
  const quantity = qm ? parseInt(qm[1], 10) : 1;
  const pm = text.match(PRICE_RE) ?? text.match(/[₦N]\s*([\d,]+)/);
  const price_kobo = pm ? Math.round(parseFloat(pm[1].replace(/,/g, '')) * 100) : null;
  let product = messages[messages.length - 1]?.slice(0, 60) ?? '';
  const prodMatch = text.match(/(indomie|milo|sugar|water|coke|peak(?: milk)?|maggi|knorr|rice|oil|soap)[^.\n]{0,40}/i);
  if (prodMatch) product = prodMatch[0].trim();
  let delivery: string | null = null;
  for (const re of DELIVERY_RES) {
    const m = text.match(re);
    if (m) { delivery = m[0].trim().slice(0, 80); break; }
  }
  return { product, quantity, price_kobo, delivery };
}

export async function summariseThread(
  messages: string[],
  _adapter?: VendorAdapter,
): Promise<TaskOutput<ThreadSummary>> {
  const data = ruleSummarise(messages);
  const price = data.price_kobo == null ? 'price TBC' : `₦${(data.price_kobo / 100).toLocaleString('en-NG')}`;
  return {
    data,
    confidence: data.product ? 0.75 : 0.35,
    needsConfirm: true,
    interpretation: `Confirm: ${data.quantity}× ${data.product} at ${price}${data.delivery ? `, ${data.delivery}` : ''}. Buyer taps confirm — nothing ordered yet.`,
    model: 'stub/summarise-v1',
  };
}
