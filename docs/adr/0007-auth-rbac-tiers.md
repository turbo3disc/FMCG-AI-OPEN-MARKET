# ADR-0007 — Auth: phone/OTP + email, RBAC by profile + tier

Status: accepted.

Context: shoppers want fast phone signup; retail shops/wholesalers need business
verification; admins need MFA. One person can be both buyer and seller.

Decision: phone/OTP + email/password; short-lived JWT + rotating refresh tokens;
MFA enforced for admin/finance. RBAC checks active profile context
(buyer/seller/dual) and verification tier (Tier-1 basic, Tier-2 B2B/COD).

Consequences: guest browsing without checkout; B2B and COD gated server-side, not
just hidden in UI.
