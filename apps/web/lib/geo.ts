// Geo helpers — buyer proximity ranking ("nearby first").
// Server-safe (no 'use client'): importable from server components.
export const LAGOS_AREAS = [
  { area: 'Mile 12 / Ketu', lat: '6.6044', lng: '3.3912' },
  { area: 'Oshodi', lat: '6.5559', lng: '3.3425' },
  { area: 'Ikeja', lat: '6.6018', lng: '3.3515' },
  { area: 'Lekki', lat: '6.4698', lng: '3.5852' },
  { area: 'Surulere', lat: '6.5001', lng: '3.3582' },
  { area: 'Yaba', lat: '6.5158', lng: '3.3711' },
  { area: 'Ajah', lat: '6.4692', lng: '3.5681' },
  { area: 'Balogun / Lagos Island', lat: '6.4572', lng: '3.3922' },
];

/** Great-circle distance in km between two lat/lng points. */
export function kmBetween(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371;
  const dLa = ((bLat - aLat) * Math.PI) / 180;
  const dLn = ((bLng - aLng) * Math.PI) / 180;
  const s =
    Math.sin(dLa / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLn / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function areaCoords(area: string): { lat: number; lng: number } {
  const hit = LAGOS_AREAS.find((a) => a.area === area) ?? LAGOS_AREAS[0];
  return { lat: Number(hit.lat), lng: Number(hit.lng) };
}

/** Demo market names → coordinates, so seeded sellers rank by proximity too. */
const MARKET_COORDS: Record<string, { lat: number; lng: number }> = {
  'Mile 12': { lat: 6.6044, lng: 3.3912 },
  Oshodi: { lat: 6.5559, lng: 3.3425 },
  Yaba: { lat: 6.5158, lng: 3.3711 },
  Ikeja: { lat: 6.6018, lng: 3.3515 },
  Lekki: { lat: 6.4698, lng: 3.5852 },
};

export function marketCoords(market: string): { lat: number; lng: number } {
  return MARKET_COORDS[market] ?? { lat: 6.5244, lng: 3.3792 };
}

/** Distance from the buyer's area to a seller point. Unknown seller → far. */
export function sellerDistanceKm(buyerArea: string, sLat?: string | number, sLng?: string | number): number {
  const b = areaCoords(buyerArea);
  const la = Number(sLat);
  const ln = Number(sLng);
  if (!Number.isFinite(la) || !Number.isFinite(ln)) return 999;
  return kmBetween(b.lat, b.lng, la, ln);
}

export function distanceLabel(km: number): string {
  if (km >= 999) return 'City-wide';
  if (km < 1) return `${Math.round(km * 1000)} m • Very close`;
  if (km <= 5) return `${km.toFixed(1)} km • Nearby`;
  return `${km.toFixed(1)} km`;
}
