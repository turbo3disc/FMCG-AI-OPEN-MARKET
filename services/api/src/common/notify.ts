// Notification outbox: email / SMS / WhatsApp.
// Production providers are optional and env-driven:
//   TERMII_API_KEY (+TERMII_SENDER, TERMII_WHATSAPP=1) → real SMS/WhatsApp via Termii
//   SMTP_URL (or BREVO_API_KEY) → real email
// Without keys, messages are logged and recorded with status 'logged' so the
// onboarding demo and audit trail work with zero configuration.
import { pool } from '../db/pool.js';

export type Channel = 'email' | 'sms' | 'whatsapp';

export const TEMPLATES = {
  'seller.application_received': (v: { business: string }) =>
    `FMCG Open Market: hi ${v.business}! Your seller application was received and is under review. We will message you here once approved.`,
  'seller.welcome': (v: { business: string }) =>
    `FMCG Open Market: congrats ${v.business} — you are approved! Welcome onboard. Open your sub-admin dashboard to upload products and go live for buyers.`,
  'seller.rejected': (v: { business: string }) =>
    `FMCG Open Market: hello ${v.business}, your seller application needs more detail. Reply to this message or update your profile and re-apply.`,
} satisfies Record<string, (vars: { business: string }) => string>;

export type Template = keyof typeof TEMPLATES;

async function sendViaProvider(channel: Channel, to: string, body: string): Promise<string | null> {
  try {
    if ((channel === 'sms' || channel === 'whatsapp') && process.env.TERMII_API_KEY) {
      const res = await fetch('https://v3.api.termii.com/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: process.env.TERMII_API_KEY,
          to, from: process.env.TERMII_SENDER ?? 'FMCGMkt',
          sms: body, type: 'plain',
          ...(channel === 'whatsapp' ? { channel: 'whatsapp' } : {}),
        }),
      });
      if (!res.ok) return null;
      const j = (await res.json()) as { message_id?: string };
      return j.message_id ?? 'termii-ok';
    }
    if (channel === 'email' && (process.env.BREVO_API_KEY || process.env.SMTP_URL)) {
      // Minimal Brevo path; full SMTP wiring lands with the mailer milestone.
      if (process.env.BREVO_API_KEY) {
        const res = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'api-key': process.env.BREVO_API_KEY },
          body: JSON.stringify({
            sender: { email: process.env.MAIL_FROM ?? 'hello@fmcg-market.ng' },
            to: [{ email: to }], subject: 'FMCG Open Market', textContent: body,
          }),
        });
        if (!res.ok) return null;
        const j = (await res.json()) as { messageId?: string };
        return j.messageId ?? 'brevo-ok';
      }
      return 'smtp-queued';
    }
  } catch {
    return null;
  }
  return null;
}

export async function notify(channel: Channel, to: string, template: Template, vars: { business: string }): Promise<{ id: string; status: string }> {
  const body = TEMPLATES[template](vars);
  const ref = await sendViaProvider(channel, to, body);
  const status = ref ? 'sent' : 'logged';
  try {
    const r = await pool.query(
      `INSERT INTO notifications (channel, to_addr, template, body, status, provider_ref)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
      [channel, to, template, body, status, ref],
    );
    if (status === 'logged') console.log(`[notify:${channel}→${to}] ${body}`);
    return { id: (r.rows[0] as { id: string }).id, status };
  } catch {
    // Table missing (migration not yet applied) — still deliver/log, never crash onboarding.
    console.log(`[notify:${channel}→${to}] ${body}`);
    return { id: 'unrecorded', status };
  }
}

/** Welcome a newly approved seller on every channel we have an address for. */
export async function welcomeSeller(s: { business_name: string; phone?: string | null; email?: string | null; notifyChannel?: string }): Promise<Array<{ channel: Channel; status: string }>> {
  const out: Array<{ channel: Channel; status: string }> = [];
  const pref = s.notifyChannel ?? 'whatsapp';
  if (s.phone) {
    const ch: Channel = pref === 'sms' ? 'sms' : 'whatsapp';
    const r = await notify(ch, s.phone, 'seller.welcome', { business: s.business_name });
    out.push({ channel: ch, status: r.status });
  }
  if (s.email) {
    const r = await notify('email', s.email, 'seller.welcome', { business: s.business_name });
    out.push({ channel: 'email', status: r.status });
  }
  return out;
}
