// Buyer's remembered location (area picker persists across visits).
'use client';

import { LAGOS_AREAS } from './geo';

const KEY = 'fmcg-buyer-area-v1';
export const DEFAULT_BUYER_AREA = 'Mile 12 / Ketu';

export function buyerArea(): string {
  if (typeof window === 'undefined') return DEFAULT_BUYER_AREA;
  const v = window.localStorage.getItem(KEY);
  return (v && LAGOS_AREAS.some((a) => a.area === v) ? v : DEFAULT_BUYER_AREA);
}

export function setBuyerArea(area: string): void {
  window.localStorage.setItem(KEY, area);
}
