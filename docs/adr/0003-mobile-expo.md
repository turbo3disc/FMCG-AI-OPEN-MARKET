# ADR-0003 — Mobile: Expo (buyer + logistics)

Status: accepted.

Context: riders need OTP/POD/COD capture in the field; buyers need search/cart on
low-end Android devices common in Lagos.

Decision: Expo in `apps/mobile`, shared API client with web. Expo Go for pilot
testing (free), EAS only if store builds are needed later.

Consequences: one codebase for buyer + logistics roles; offline-tolerant job queue;
no native-code maintenance in MVP.
