# ADR-0002 — Web: Next.js App Router

Status: accepted.

Context: buyer marketplace, seller portal and admin console share the design system
but need separate access rules and SEO on product/storefront pages.

Decision: one Next.js app in `apps/web` with route groups `(buyer)`, `(seller)`,
`(admin)`. Server components for catalogue pages, client components for cart/checkout.

Consequences: one deploy, shared components, per-group middleware for RBAC.
Free: Next.js + Vercel/Render free tiers for pilot.
