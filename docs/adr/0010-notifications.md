# ADR-0010 — One notification interface (push first, SMS last)

Status: accepted.

Context: SMS costs per message in Nigeria; order updates are high-volume. Push and
WhatsApp are effectively free.

Decision: single queue interface `notify(channel, template, payload)` with
priority push → email → WhatsApp → SMS. SMS reserved for OTP and COD-critical
alerts. Free tiers: Expo Push/FCM, Resend/Brevo; Termii pay-per-SMS only.

Consequences: pilot messaging stays near-zero cost; channels switch per user
preference without touching business code.
