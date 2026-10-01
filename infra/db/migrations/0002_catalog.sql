-- 0002: catalog — canonical products, seller offers, delivery zones (PRD §14, CAT-01..09)
CREATE TABLE canonical_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  brand TEXT,
  category TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  unit_types TEXT[] NOT NULL DEFAULT '{piece}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('canonical','pending','duplicate')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_canonical_search ON canonical_products (category, brand);

CREATE TABLE delivery_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  center geography(Point, 4326),
  radius_km NUMERIC NOT NULL DEFAULT 5,
  fee_kobo INTEGER NOT NULL DEFAULT 0 CHECK (fee_kobo >= 0),
  min_order_kobo INTEGER NOT NULL DEFAULT 0 CHECK (min_order_kobo >= 0),
  windows JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE seller_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES seller_profiles(id),
  canonical_product_id UUID REFERENCES canonical_products(id),
  title TEXT NOT NULL,
  price_kobo INTEGER NOT NULL CHECK (price_kobo > 0),
  bulk_breaks JSONB NOT NULL DEFAULT '[]',
  moq INTEGER NOT NULL DEFAULT 1 CHECK (moq >= 1),
  unit_type TEXT NOT NULL DEFAULT 'piece' CHECK (unit_type IN ('piece','pack','carton')),
  on_hand INTEGER NOT NULL DEFAULT 0 CHECK (on_hand >= 0),
  reserved INTEGER NOT NULL DEFAULT 0 CHECK (reserved >= 0),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','paused','flagged','archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT stock_available CHECK (reserved <= on_hand)
);
CREATE INDEX idx_offers_seller ON seller_offers (seller_id, status);
CREATE INDEX idx_offers_canonical ON seller_offers (canonical_product_id, status);

-- Seller geo for proximity search (PostGIS point, seller shop/warehouse)
ALTER TABLE seller_profiles ADD COLUMN IF NOT EXISTS location geography(Point, 4326);
