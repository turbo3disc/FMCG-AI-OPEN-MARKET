// Paystack adapter (sandbox + live via PAYSTACK_SECRET_KEY).
// NGN amounts are already integer kobo on both sides — no conversion.
import crypto from 'node:crypto';
import type { PaymentProvider } from './provider.js';

const BASE = 'https://api.paystack.co';
const key = (): string => {
  const k = process.env.PAYSTACK_SECRET_KEY ?? '';
  if (!k) throw new Error('PAYSTACK_SECRET_KEY missing');
  return k;
};

async function call(path: string, method: string, body?: unknown): Promise<{ status: boolean; message: string; data: Record<string, unknown> }> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { Authorization: `Bearer ${key()}`, 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = (await res.json()) as { status: boolean; message: string; data: Record<string, unknown> };
  if (!res.ok || !json.status) throw new Error(`paystack ${method} ${path}: ${json.message ?? res.status}`);
  return json;
}

export const PaystackProvider: PaymentProvider = {
  name: 'paystack',
  initialize: async (amountKobo: number, ref: string, email?: string) => {
    const json = await call('/transaction/initialize', 'POST', {
      email: email ?? 'buyer@fmcg-market.local',
      amount: amountKobo,
      reference: ref,
    });
    return {
      providerRef: String(json.data.reference),
      authUrl: String(json.data.authorization_url),
    };
  },
  // Paystack signs the raw JSON body: HMAC-SHA512 hex with the SECRET key,
  // sent as the x-paystack-signature header.
  verifyWebhookSignature: (payload: string, signature: string) =>
    crypto.createHmac('sha512', key()).update(payload).digest('hex') === signature,
  refund: async (providerRef: string, amountKobo: number) => {
    await call('/refund', 'POST', { transaction: providerRef, amount: amountKobo });
    return { ok: true };
  },
};

/** Server-side reconcile: fetch the transaction by reference from Paystack. */
export async function paystackVerify(reference: string): Promise<{ status: string; amountKobo: number; paidAt: string | null }> {
  const json = await call(`/transaction/verify/${encodeURIComponent(reference)}`, 'GET');
  return {
    status: String(json.data.status),
    amountKobo: Number(json.data.amount),
    paidAt: (json.data.paid_at as string | null) ?? null,
  };
}

// Paystack event → internal webhook type. charge.success = buyer paid.
export function mapPaystackEvent(event: string): string | null {
  if (event === 'charge.success') return 'paid';
  if (event === 'transfer.success') return 'settled';
  return null;
}
