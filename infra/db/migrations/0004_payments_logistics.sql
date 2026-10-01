-- 0004: payments, settlements, logistics, trust, audit (PRD §14)
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_group_id UUID NOT NULL REFERENCES order_groups(id),
  amount_kobo INTEGER NOT NULL CHECK (amount_kobo >= 0),
  state TEXT NOT NULL DEFAULT 'PENDING' CHECK (state IN (
    'PENDING','PROTECTED','OUT_FOR_DELIVERY','DELIVERED_PENDING_CONFIRMATION',
    'SETTLEMENT_PENDING','SETTLED','DISPUTED','REFUNDED',
    'COD_PENDING_COLLECTION','COD_RECONCILED')),
  provider TEXT NOT NULL DEFAULT 'fake',
  provider_ref TEXT UNIQUE NOT NULL,
  method TEXT NOT NULL DEFAULT 'card' CHECK (method IN ('card','transfer','cod')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payment_transactions(id),
  event TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payment_transactions(id),
  order_id UUID NOT NULL REFERENCES orders(id),
  seller_id UUID NOT NULL REFERENCES seller_profiles(id),
  amount_kobo INTEGER NOT NULL,
  fee_kobo INTEGER NOT NULL DEFAULT 0,
  net_kobo INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paused','released','settled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE delivery_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES delivery_partners(id),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE delivery_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  partner_id UUID REFERENCES delivery_partners(id),
  driver_id UUID REFERENCES drivers(id),
  status TEXT NOT NULL DEFAULT 'assigned'
    CHECK (status IN ('assigned','accepted','picked_up','delivered','cod_collected','cod_reconciled','exception','cancelled')),
  pickup_otp_hash TEXT,
  pod_photo_url TEXT,
  pod_signature TEXT,
  pod_lat DOUBLE PRECISION,
  pod_lng DOUBLE PRECISION,
  cod_amount_kobo INTEGER,
  cod_status TEXT CHECK (cod_status IN ('collected','reconciled')),
  exception_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  reporter_id UUID NOT NULL REFERENCES users(id),
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','awaiting_evidence','under_review','resolved','appealed')),
  ruling TEXT CHECK (ruling IN ('buyer','seller','split')),
  resolution TEXT,
  sla_due_at TIMESTAMPTZ NOT NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE dispute_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id UUID NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES users(id),
  url TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  seller_id UUID NOT NULL REFERENCES seller_profiles(id),
  buyer_id UUID NOT NULL REFERENCES users(id),
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  reasons TEXT[] NOT NULL DEFAULT '{}',
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES users(id),
  entity TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  meta JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_entity ON audit_events (entity, entity_id);
