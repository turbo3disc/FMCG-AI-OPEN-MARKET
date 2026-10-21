-- 0008: per-SKU product photos (carton / pack shots) for seller-uploaded offers.
-- Additive + idempotent (safe to run on production).
ALTER TABLE seller_offers ADD COLUMN IF NOT EXISTS image_urls TEXT[] NOT NULL DEFAULT '{}';
