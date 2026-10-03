// Stub adapter — deterministic rule-based fallback for tests/demos (no network).
// Parses "X cartons of Y within Z km" style queries; drafts titles from keywords.

import type { CompleteOpts, CompleteResult, VendorAdapter } from '../types.js';

export const QTY_RE = /(\d+)\s*(cartons?|packs?|packets?|pieces?|pcs|sachets?|bags?|bottles?)/i;
export const RADIUS_RE = /within\s+(\d+(?:\.\d+)?)\s*km/i;
export const PRICE_RE = /(?:under|below|max|up to|<=?)\s*[₦N]?\s*([\d,]+)/i;

export function stubCompleteText(prompt: string): string {
  const q: string[] = [];
  const qty = prompt.match(QTY_RE);
  if (qty) q.push(`qty=${qty[1]} ${qty[2].toLowerCase()}`);
  const r = prompt.match(RADIUS_RE);
  if (r) q.push(`radius=${r[1]}km`);
  const p = prompt.match(PRICE_RE);
  if (p) q.push(`max_price=${p[1]}`);
  // Title-draft mode: echo keywords as a listing title.
  const keywords = prompt
    .replace(/^(draft|title|listing)[:\s]*/i, '')
    .split(/[\s,;]+/)
    .filter((w) => w.length > 2)
    .slice(0, 6);
  if (/draft|title|listing/i.test(prompt) && keywords.length > 0) {
    return `Draft title: ${keywords.map(titleCase).join(' ')} (${q.join(', ') || 'retail'})`;
  }
  return `Stub parse → ${q.join(', ') || 'no qty/radius/price detected'} | query="${prompt.slice(0, 80)}"`;
}

function titleCase(w: string): string {
  return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
}

export async function complete(prompt: string, _opts: CompleteOpts = {}): Promise<CompleteResult> {
  return { text: stubCompleteText(prompt), model: 'stub/deterministic', confidence: 0.9 };
}

export async function isAvailable(): Promise<boolean> {
  return true;
}

export const stubAdapter: VendorAdapter = { name: 'stub', complete, isAvailable };
