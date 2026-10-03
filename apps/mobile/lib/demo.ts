// Trimmed Lagos pilot demo data — copied shapes from apps/web/lib/demo.ts.
// Zero-backend fallback: every screen renders from this file.

import type { PriceBreak, UnitType } from './money';

export interface DemoSeller {
  id: string;
  name: string;
  market: string;
  tier: 1 | 2;
  rating: number;
  reviews: number;
  distanceKm: number;
  codEligible: boolean;
  deliveryFeeKobo: number;
}

export interface DemoOffer {
  sellerId: string;
  priceKobo: number;
  stock: number;
  unitTypes: UnitType[];
  bulkBreaks: PriceBreak[];
  moq: number;
  updatedMinAgo: number;
  zone: string;
}

export interface DemoProduct {
  id: string;
  name: string;
  emoji: string;
  category: string;
  brand: string;
  unit: string;
  basePriceKobo: number;
  offers: DemoOffer[];
}

export interface DemoOrder {
  id: string;
  sellerId: string;
  items: { productId: string; qty: number; unitKobo: number }[];
  status: 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'completed';
  paymentState: string;
  totalKobo: number;
  deliveryFeeKobo: number;
  otp: string;
}

export interface RiderJob extends DemoOrder {
  buyer: string;
  address: string;
  codKobo: number;
  jobStatus: 'queued' | 'accepted' | 'picked_up' | 'delivered';
}

export const sellers: DemoSeller[] = [
  { id: 'adeola', name: 'Adeola Wholesale', market: 'Mile 12', tier: 2, rating: 4.6, reviews: 212, distanceKm: 1.5, codEligible: true, deliveryFeeKobo: 80000 },
  { id: 'balogun', name: 'Balogun Distributors', market: 'Oshodi', tier: 2, rating: 4.9, reviews: 340, distanceKm: 3.2, codEligible: true, deliveryFeeKobo: 120000 },
  { id: 'chidi', name: 'Chidi RetailHub', market: 'Yaba', tier: 1, rating: 3.8, reviews: 96, distanceKm: 4.8, codEligible: false, deliveryFeeKobo: 100000 },
];

export const products: DemoProduct[] = [
  {
    id: 'indomie-carton', name: 'Indomie Instant Noodles — Carton (40×70g)', emoji: '🍜',
    category: 'Groceries', brand: 'Indomie', unit: 'carton', basePriceKobo: 1250000,
    offers: [
      { sellerId: 'adeola', priceKobo: 1250000, stock: 40, unitTypes: ['carton', 'pack'], bulkBreaks: [{ minQty: 10, priceKobo: 1190000 }], moq: 2, updatedMinAgo: 5, zone: 'Mile 12 zone' },
      { sellerId: 'balogun', priceKobo: 1235000, stock: 18, unitTypes: ['carton'], bulkBreaks: [{ minQty: 10, priceKobo: 1180000 }], moq: 1, updatedMinAgo: 12, zone: 'Oshodi zone' },
    ],
  },
  {
    id: 'milo-800g', name: 'Milo Activ-Go Refill — 800g', emoji: '🍫',
    category: 'Beverages', brand: 'Milo', unit: 'pack', basePriceKobo: 685000,
    offers: [
      { sellerId: 'adeola', priceKobo: 685000, stock: 120, unitTypes: ['pack', 'carton'], bulkBreaks: [{ minQty: 12, priceKobo: 650000 }], moq: 1, updatedMinAgo: 8, zone: 'Mile 12 zone' },
      { sellerId: 'balogun', priceKobo: 670000, stock: 60, unitTypes: ['pack', 'carton'], bulkBreaks: [{ minQty: 24, priceKobo: 640000 }], moq: 6, updatedMinAgo: 20, zone: 'Oshodi zone' },
    ],
  },
  {
    id: 'bottled-water-75cl', name: 'Bottled Water — Pack of 12×75cl', emoji: '💧',
    category: 'Beverages', brand: 'CWay', unit: 'pack', basePriceKobo: 240000,
    offers: [
      { sellerId: 'adeola', priceKobo: 240000, stock: 200, unitTypes: ['pack', 'carton'], bulkBreaks: [{ minQty: 20, priceKobo: 220000 }], moq: 5, updatedMinAgo: 3, zone: 'Mile 12 zone' },
    ],
  },
  {
    id: 'closeup-140g', name: 'Close-Up Toothpaste — 140g', emoji: '🪥',
    category: 'Household', brand: 'Close-Up', unit: 'piece', basePriceKobo: 185000,
    offers: [
      { sellerId: 'chidi', priceKobo: 185000, stock: 300, unitTypes: ['piece', 'pack'], bulkBreaks: [{ minQty: 48, priceKobo: 170000 }], moq: 6, updatedMinAgo: 10, zone: 'Yaba zone' },
    ],
  },
  {
    id: 'peak-milk-tin', name: 'Peak Filled Milk Tin — 400g (×12)', emoji: '🥛',
    category: 'Groceries', brand: 'Peak', unit: 'carton', basePriceKobo: 1580000,
    offers: [
      { sellerId: 'balogun', priceKobo: 1580000, stock: 35, unitTypes: ['carton', 'pack'], bulkBreaks: [{ minQty: 10, priceKobo: 1520000 }], moq: 2, updatedMinAgo: 18, zone: 'Oshodi zone' },
    ],
  },
];

export const categories = ['Groceries', 'Beverages', 'Household'];

export const orders: DemoOrder[] = [
  {
    id: 'ORD-1001', sellerId: 'adeola', status: 'out_for_delivery',
    paymentState: 'PROTECTED', otp: '481236', deliveryFeeKobo: 80000, totalKobo: 2508000,
    items: [{ productId: 'indomie-carton', qty: 2, unitKobo: 1250000 }],
  },
  {
    id: 'ORD-1002', sellerId: 'balogun', status: 'preparing',
    paymentState: 'PROTECTED', otp: '902177', deliveryFeeKobo: 120000, totalKobo: 8320000,
    items: [{ productId: 'dangote-sugar-50kg', qty: 1, unitKobo: 8200000 }],
  },
];

export const riderJobs: RiderJob[] = [
  {
    id: 'ORD-1001', sellerId: 'adeola', status: 'out_for_delivery', paymentState: 'PROTECTED',
    otp: '481516', deliveryFeeKobo: 80000, totalKobo: 2508000, buyer: 'Mama Nkechi, Yaba',
    address: '12 Herbert Macaulay Way, Yaba', codKobo: 0, jobStatus: 'queued',
    items: [{ productId: 'indomie-carton', qty: 2, unitKobo: 1250000 }],
  },
  {
    id: 'ORD-1003', sellerId: 'balogun', status: 'confirmed', paymentState: 'COD_PENDING_COLLECTION',
    otp: '481516', deliveryFeeKobo: 120000, totalKobo: 1340000, buyer: 'Lekki Kiosk Cluster',
    address: 'Block 4, Lekki Phase 1', codKobo: 1340000, jobStatus: 'queued',
    items: [{ productId: 'milo-800g', qty: 2, unitKobo: 670000 }],
  },
];

export const DEV_OTP = '481516';

export const sellerOf = (id: string): DemoSeller =>
  sellers.find((s) => s.id === id) ?? sellers[0];

export const productById = (id: string): DemoProduct | undefined =>
  products.find((p) => p.id === id);

export const bestOffer = (p: DemoProduct): DemoOffer =>
  [...p.offers].sort((a, b) => a.priceKobo - b.priceKobo)[0];

export const searchOffers = (q: string, maxKm: number): { product: DemoProduct; offer: DemoOffer }[] => {
  const needle = q.trim().toLowerCase();
  const out: { product: DemoProduct; offer: DemoOffer }[] = [];
  for (const p of products) {
    const hay = `${p.name} ${p.brand} ${p.category}`.toLowerCase();
    if (needle && !hay.includes(needle)) continue;
    for (const o of p.offers) {
      const s = sellerOf(o.sellerId);
      if (s.distanceKm <= maxKm) out.push({ product: p, offer: o });
    }
  }
  return out.sort((a, b) => a.offer.priceKobo - b.offer.priceKobo);
};
