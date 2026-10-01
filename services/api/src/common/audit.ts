// Append-only audit writer. Every inventory/payment/settlement/dispute/
// user-status mutation must call this inside the same transaction.
export interface DbLike {
  query(text: string, params?: unknown[]): Promise<{ rows: Array<Record<string, unknown>> }>;
}

export interface AuditInput {
  actorId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  meta?: Record<string, unknown>;
}

export async function writeAudit(db: DbLike, input: AuditInput): Promise<void> {
  await db.query(
    `INSERT INTO audit_events (actor_id, action, entity, entity_id, meta)
     VALUES ($1, $2, $3, $4, $5)`,
    [input.actorId ?? null, input.action, input.entity, input.entityId ?? null, JSON.stringify(input.meta ?? {})],
  );
}
