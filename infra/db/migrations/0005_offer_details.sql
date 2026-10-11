-- 0005: seller offer merchandising details — brand, size, SKU, carton/roll stock.
-- Additive + idempotent (safe to run on production).
ALTER TABLE seller_offers ADD COLUMN IF NOT EXISTS brand TEXT;
ALTER TABLE seller_offers ADD COLUMN IF NOT EXISTS size TEXT;
ALTER TABLE seller_offers ADD COLUMN IF NOT EXISTS sku TEXT;
ALTER TABLE seller_offers ADD COLUMN IF NOT EXISTS cartons INTEGER NOT NULL DEFAULT 0;
ALTER TABLE seller_offers ADD COLUMN IF NOT EXISTS rolls INTEGER NOT NULL DEFAULT 0;
DO $$ BEGIN
  ALTER TABLE seller_offers ADD CONSTRAINT cartons_nonneg CHECK (cartons >= 0);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE seller_offers ADD CONSTRAINT rolls_nonneg CHECK (rolls >= 0);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
-- allow 'roll' as a unit type (tissue, paper towels, etc.)
ALTER TABLE seller_offers DROP CONSTRAINT IF EXISTS seller_offers_unit_type_check;
DO $$ BEGIN
  ALTER TABLE seller_offers ADD CONSTRAINT seller_offers_unit_type_check
    CHECK (unit_type IN ('piece','pack','carton','roll'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_offers_sku ON seller_offers (sku);
CREATE INDEX IF NOT EXISTS idx_offers_brand ON seller_offers (brand);
