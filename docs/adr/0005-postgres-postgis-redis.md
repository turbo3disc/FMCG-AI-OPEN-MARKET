# ADR-0005 — Data: PostgreSQL + PostGIS, Redis for cache/queues

Status: accepted.

Context: location ranking (radius + delivery zones) is a core mechanic; money and
inventory need ACID guarantees; notifications/jobs need a queue.

Decision: PostgreSQL 16 + PostGIS (zones, radius search) as system of record;
Redis for cache, rate limits and job queues. Run both in Docker locally; managed
services only if pilot outgrows free tiers.

Consequences: one transaction covers order + reserve + audit; geo queries stay in
SQL; queues survive restarts via Redis persistence.
