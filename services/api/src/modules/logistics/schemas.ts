import { ApiError } from '../../common/errors.js';

export const DELIVERY_OTP = '481516';

export function validateJob(b: Record<string, unknown>): { orderId: string; partnerId?: string; driverId?: string } {
  const { orderId, partnerId, driverId } = b;
  if (typeof orderId !== 'string' || !orderId) throw ApiError.badRequest('orderId required');
  return { orderId, partnerId: partnerId as string | undefined, driverId: driverId as string | undefined };
}

export function validatePod(b: Record<string, unknown>): { photoUrl?: string; signature?: string; lat?: number; lng?: number; otp: string } {
  const { photoUrl, signature, lat, lng, otp } = b as Record<string, string | number | undefined>;
  if (typeof otp !== 'string' || !otp) throw ApiError.badRequest('delivery OTP required');
  return { photoUrl: photoUrl as string | undefined, signature: signature as string | undefined, lat: lat as number | undefined, lng: lng as number | undefined, otp: otp as string };
}
