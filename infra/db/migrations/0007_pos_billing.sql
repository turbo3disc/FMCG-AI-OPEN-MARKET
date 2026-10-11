-- 0007: seller POS (robotic inventory) + subscriptions.
-- Additive + idempotent (safe to run on production).
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES seller_profiles(id),
  plan TEXT NOT NULL CHECK (plan IN ('monthly','quarterly','yearly')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','expired','cancelled')),
  amount_kobo INTEGER NOT NULL CHECK (amount_kobo >= 0),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_subs_seller ON subscriptions (seller_id, status);

CREATE TABLE IF NOT EXISTS pos_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES seller_profiles(id),
  items JSONB NOT NULL DEFAULT '[]',
  total_kobo INTEGER NOT NULL CHECK (total_kobo >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sales_seller ON pos_sales (seller_id, created_at);

CREATE TABLE IF NOT EXISTS stock_moves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES seller_profiles(id),
  sku TEXT NOT NULL,
  delta_cartons INTEGER NOT NULL DEFAULT 0,
  delta_rolls INTEGER NOT NULL DEFAULT 0,
  delta_packs INTEGER NOT NULL DEFAULT 0,
  delta_pieces INTEGER NOT NULL DEFAULT 0,
  reason TEXT NOT NULL CHECK (reason IN ('sale','damage','return','restock','correction')),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_moves_seller ON stock_moves (seller_id, created_at);
