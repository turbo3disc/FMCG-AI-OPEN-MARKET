import { ApiError } from '../../common/errors.js';

const phoneRe = /^\+?[0-9]{7,15}$/;
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegister(b: Record<string, unknown>): { phone?: string; email?: string; password?: string; buyerType: string; displayName?: string } {
  const { phone, email, password, buyerType, displayName } = b;
  if (phone !== undefined && (typeof phone !== 'string' || !phoneRe.test(phone))) {
    throw ApiError.badRequest('invalid phone');
  }
  if (email !== undefined && (typeof email !== 'string' || !emailRe.test(email))) {
    throw ApiError.badRequest('invalid email');
  }
  if (!phone && !email) throw ApiError.badRequest('phone or email required');
  if (password !== undefined && (typeof password !== 'string' || password.length < 8)) {
    throw ApiError.badRequest('password must be 8+ chars');
  }
  const bt = typeof buyerType === 'string' ? buyerType : 'shopper';
  if (!['shopper', 'household', 'retail_shop'].includes(bt)) throw ApiError.badRequest('invalid buyerType');
  return { phone: phone as string | undefined, email: email as string | undefined, password: password as string | undefined, buyerType: bt, displayName: displayName as string | undefined };
}

export function validateLogin(b: Record<string, unknown>): { phone?: string; email?: string; password: string } {
  const { phone, email, password } = b;
  if (typeof password !== 'string' || !password) throw ApiError.badRequest('password required');
  if (!phone && !email) throw ApiError.badRequest('phone or email required');
  return { phone: phone as string | undefined, email: email as string | undefined, password };
}

export function validateOtp(b: Record<string, unknown>): { phone: string; code: string } {
  const { phone, code } = b;
  if (typeof phone !== 'string' || !phoneRe.test(phone)) throw ApiError.badRequest('invalid phone');
  if (typeof code !== 'string' || code.length < 4) throw ApiError.badRequest('invalid otp code');
  return { phone, code };
}

export function validateAddress(b: Record<string, unknown>): { label: string; line1: string; city: string; lat?: number; lng?: number } {
  const { label, line1, city, lat, lng } = b as Record<string, string | number | undefined>;
  if (typeof label !== 'string' || !label) throw ApiError.badRequest('label required');
  if (typeof line1 !== 'string' || !line1) throw ApiError.badRequest('line1 required');
  if (typeof city !== 'string' || !city) throw ApiError.badRequest('city required');
  return { label, line1, city, lat: lat as number | undefined, lng: lng as number | undefined };
}
