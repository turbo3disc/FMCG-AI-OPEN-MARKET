# ADR-0004 — API: modular Node monolith (Fastify + TS)

Status: accepted.

Context: team is small; microservices would multiply DevOps cost. But payments,
inventory and settlement need hard boundaries.

Decision: modular monolith in `services/api` (Fastify + TypeScript). Module
boundaries mirror the PRD: identity, catalog, search, cart-orders, quotes,
payments, logistics, trust, admin. Cross-module calls go through exported
functions, never direct table access from another module's routes.

Consequences: one deploy, easy transactions across modules (reserve stock +
create order atomically); can split into services later along module lines.
