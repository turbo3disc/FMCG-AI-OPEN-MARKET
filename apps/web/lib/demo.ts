// Lagos pilot demo data — fallback when the API (localhost:3001) is unreachable.
// Every page renders from this file with zero backend.

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

export interface DemoQuote {
  id: string;
  rfqTitle: string;
  buyer: string;
  versions: { who: string; text: string; accepted?: boolean }[];
  status: 'open' | 'accepted' | 'expired';
  expiresIn: string;
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
      { sellerId: 'balogun', priceKobo: 1235000, stock: 18, unitTypes: ['carton'], bulkBreaks: [{ minQty: 10, priceKobo: 1180000 }, { minQty: 50, priceKobo: 1150000 }], moq: 1, updatedMinAgo: 12, zone: 'Oshodi zone' },
      { sellerId: 'chidi', priceKobo: 1270000, stock: 75, unitTypes: ['carton', 'pack', 'piece'], bulkBreaks: [], moq: 1, updatedMinAgo: 30, zone: 'Yaba zone' },
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
    id: 'dangote-sugar-50kg', name: 'Dangote Sugar — 50kg Bag', emoji: '🧂',
    category: 'Groceries', brand: 'Dangote', unit: 'pack', basePriceKobo: 8200000,
    offers: [
      { sellerId: 'balogun', priceKobo: 8200000, stock: 25, unitTypes: ['pack'], bulkBreaks: [{ minQty: 5, priceKobo: 7950000 }], moq: 1, updatedMinAgo: 15, zone: 'Oshodi zone' },
      { sellerId: 'chidi', priceKobo: 8350000, stock: 10, unitTypes: ['pack'], bulkBreaks: [], moq: 1, updatedMinAgo: 45, zone: 'Yaba zone' },
    ],
  },
  {
    id: 'bottled-water-75cl', name: 'Bottled Water — Pack of 12×75cl', emoji: '💧',
    category: 'Beverages', brand: 'CWay', unit: 'pack', basePriceKobo: 240000,
    offers: [
      { sellerId: 'adeola', priceKobo: 240000, stock: 200, unitTypes: ['pack', 'carton'], bulkBreaks: [{ minQty: 20, priceKobo: 220000 }], moq: 5, updatedMinAgo: 3, zone: 'Mile 12 zone' },
      { sellerId: 'chidi', priceKobo: 250000, stock: 90, unitTypes: ['pack'], bulkBreaks: [], moq: 2, updatedMinAgo: 60, zone: 'Yaba zone' },
    ],
  },
  {
    id: 'closeup-140g', name: 'Close-Up Toothpaste — 140g', emoji: '🪥',
    category: 'Household', brand: 'Close-Up', unit: 'piece', basePriceKobo: 185000,
    offers: [
      { sellerId: 'chidi', priceKobo: 185000, stock: 300, unitTypes: ['piece', 'pack'], bulkBreaks: [{ minQty: 48, priceKobo: 170000 }], moq: 6, updatedMinAgo: 10, zone: 'Yaba zone' },
      { sellerId: 'adeola', priceKobo: 190000, stock: 150, unitTypes: ['piece', 'pack'], bulkBreaks: [], moq: 1, updatedMinAgo: 25, zone: 'Mile 12 zone' },
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

export const quotes: DemoQuote[] = [
  {
    id: 'RFQ-0417', rfqTitle: '20 cartons Indomie for restock — deliver Fri',
    buyer: 'Mama Nkechi Shop, Yaba', status: 'open', expiresIn: 'expires in 14h',
    versions: [
      { who: 'Shop v1', text: '20 cartons @ ₦12,000, deliver Fri AM' },
      { who: 'Seller v1', text: '20 cartons @ ₦12,300, deliver Fri PM, expires 24h' },
    ],
  },
  {
    id: 'RFQ-0411', rfqTitle: '50 packs bottled water — estate kiosk',
    buyer: 'Lekki Kiosk Cluster', status: 'accepted', expiresIn: 'converted to order',
    versions: [
      { who: 'Shop v1', text: '50 packs @ ₦2,200, deliver Sat' },
      { who: 'Seller v1', text: '50 packs @ ₦2,300, deliver Sat AM' },
      { who: 'Agreed v2', text: '50 packs @ ₦2,250, Sat AM • PO-0417 → converted to order', accepted: true },
    ],
  },
];

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

export const sellerOf = (id: string): DemoSeller =>
  sellers.find((s) => s.id === id) ?? sellers[0];

export const productById = (id: string): DemoProduct | undefined =>
  products.find((p) => p.id === id);

export const bestOffer = (p: DemoProduct): DemoOffer =>
  [...p.offers].sort((a, b) => a.priceKobo - b.priceKobo)[0];
