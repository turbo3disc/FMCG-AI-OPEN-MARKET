// summariseThread — chat messages → order-confirmation summary (buyer confirms).

import type { TaskOutput, ThreadSummary, VendorAdapter } from '../types.js';
import { QTY_RE, PRICE_RE } from '../vendors/stub.js';
import { asPosInt, extractJson, pickAdapter } from '../smart.js';

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
  adapter?: VendorAdapter,
): Promise<TaskOutput<ThreadSummary>> {
  const a = await pickAdapter(adapter);
  if (a && messages.length) {
    try {
      const out = await a.complete(
        `Summarise this buyer-seller chat into JSON {"product": string, "quantity": integer, "price_kobo": integer|null (naira×100), "delivery": string|null}:\n${messages.join('\n')}`,
        { temperature: 0, maxTokens: 256 },
      );
      const j = extractJson(out.text);
      const fb = ruleSummarise(messages);
      const data: ThreadSummary = {
        product: typeof j.product === 'string' && j.product.trim() ? j.product.trim().slice(0, 80) : fb.product,
        quantity: asPosInt(j.quantity, fb.quantity),
        price_kobo: typeof j.price_kobo === 'number' && j.price_kobo > 0 ? Math.round(j.price_kobo) : fb.price_kobo,
        delivery: typeof j.delivery === 'string' && j.delivery.trim() ? j.delivery.trim().slice(0, 80) : fb.delivery,
      };
      return { data, confidence: 0.85, needsConfirm: true, interpretation: confirmLine(data), model: out.model };
    } catch {
      /* fall through to deterministic rules */
    }
  }
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

function confirmLine(data: ThreadSummary): string {
  const price = data.price_kobo == null ? 'price TBC' : `₦${(data.price_kobo / 100).toLocaleString('en-NG')}`;
  return `Confirm: ${data.quantity}× ${data.product} at ${price}${data.delivery ? `, ${data.delivery}` : ''}. Buyer taps confirm — nothing ordered yet.`;
}
