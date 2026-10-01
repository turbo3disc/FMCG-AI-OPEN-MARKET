import { ApiError } from '../../common/errors.js';

export function validateModeration(b: Record<string, unknown>): { status: 'approved' | 'rejected' | 'suspended' } {
  const { status } = b;
  if (!['approved', 'rejected', 'suspended'].includes(status as string)) throw ApiError.badRequest('status must be approved|rejected|suspended');
  return { status: status as 'approved' | 'rejected' | 'suspended' };
}
