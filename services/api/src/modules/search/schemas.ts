import { ApiError } from '../../common/errors.js';

export interface SearchParams {
  q?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  unitType?: string;
  minQty?: number;
  category?: string;
}

export function validateSearch(q: Record<string, string | undefined>): SearchParams {
  const out: SearchParams = {};
  if (q.q) out.q = String(q.q).slice(0, 120);
  if (q.lat !== undefined) {
    out.lat = Number(q.lat);
    if (!Number.isFinite(out.lat) || Math.abs(out.lat) > 90) throw ApiError.badRequest('invalid lat');
  }
  if (q.lng !== undefined) {
    out.lng = Number(q.lng);
    if (!Number.isFinite(out.lng) || Math.abs(out.lng) > 180) throw ApiError.badRequest('invalid lng');
  }
  out.radiusKm = q.radius_km !== undefined ? Number(q.radius_km) : 5;
  if (!Number.isFinite(out.radiusKm) || out.radiusKm! <= 0 || out.radiusKm! > 100) throw ApiError.badRequest('radius_km must be 0–100');
  if (q.unit_type) {
    if (!['piece', 'pack', 'carton'].includes(q.unit_type)) throw ApiError.badRequest('invalid unit_type');
    out.unitType = q.unit_type;
  }
  if (q.min_qty !== undefined) {
    out.minQty = Number(q.min_qty);
    if (!Number.isInteger(out.minQty) || out.minQty < 1) throw ApiError.badRequest('min_qty must be integer >= 1');
  }
  if (q.category) out.category = String(q.category).slice(0, 60);
  return out;
}
