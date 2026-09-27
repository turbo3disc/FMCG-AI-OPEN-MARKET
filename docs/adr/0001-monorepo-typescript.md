# ADR-0001 — TypeScript monorepo

Status: accepted.

Context: web, mobile, API and AI helpers share money, quantity, geo and contract types.
Drift between them causes checkout and settlement bugs.

Decision: one pnpm monorepo, TypeScript everywhere, shared types + zod schemas in
`packages/shared`. Money in integer kobo, quantities in integer units.

Consequences: single `pnpm test` covers contracts; all clients compile against the
same shapes; junior contributors learn one language.
