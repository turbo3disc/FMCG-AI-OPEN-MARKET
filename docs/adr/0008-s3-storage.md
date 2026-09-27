# ADR-0008 — S3-compatible storage, signed URLs

Status: accepted.

Context: product images, POD photos/signatures and dispute evidence need durable
storage without bloating Postgres.

Decision: S3-compatible bucket (local MinIO in Docker for dev; any S3 provider in
pilot) with short-lived signed upload/download URLs issued by the API.

Consequences: API never proxies bytes; access control stays in one place; free
local dev, pay-per-GB only in production.
