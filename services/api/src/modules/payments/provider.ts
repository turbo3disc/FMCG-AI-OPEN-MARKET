// PSP provider abstraction (ADR-0006). Order logic depends on this interface,
// never on a vendor SDK. Providers: fake (dev) + paystack (sandbox/live).
export interface PaymentProvider {
  name: string;
  initialize(amountKobo: number, ref: string, email?: string): Promise<{ providerRef: string; authUrl: string }>;
  verifyWebhookSignature(payload: string, signature: string): boolean;
  refund(providerRef: string, amountKobo: number): Promise<{ ok: boolean }>;
}

export const FakeProvider: PaymentProvider = {
  name: 'fake',
  initialize: async (amountKobo: number, ref: string) => ({
    providerRef: `fake_${ref}`,
    authUrl: `https://pay.dev/checkout/${ref}?amount=${amountKobo}`,
  }),
  verifyWebhookSignature: (payload: string, signature: string) =>
    signature === (process.env.PSP_WEBHOOK_SECRET ?? 'dev-secret') || signature === `sha256:${payload.length}`,
  refund: async () => ({ ok: true }),
};

// Lazy import keeps 'fake' working with zero vendor deps/config.
export async function activeProvider(): Promise<PaymentProvider> {
  if ((process.env.PSP_PROVIDER ?? 'fake').startsWith('paystack')) {
    if (!process.env.PAYSTACK_SECRET_KEY) throw new Error('PAYSTACK_SECRET_KEY missing for paystack provider');
    const { PaystackProvider } = await import('./paystack.js');
    return PaystackProvider;
  }
  return FakeProvider;
}
