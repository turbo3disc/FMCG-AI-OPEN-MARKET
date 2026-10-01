-- 0003: carts, order groups, orders, quotes (PRD §14, CART/ORD)
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  label TEXT NOT NULL,
  line1 TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Lagos',
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES users(id),
  seller_id UUID NOT NULL REFERENCES seller_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (buyer_id)
);

CREATE TABLE cart_items (
  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  offer_id UUID NOT NULL REFERENCES seller_offers(id),
  qty INTEGER NOT NULL CHECK (qty >= 1),
  price_kobo INTEGER NOT NULL CHECK (price_kobo > 0),
  PRIMARY KEY (cart_id, offer_id)
);

CREATE TABLE order_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES users(id),
  total_kobo INTEGER NOT NULL CHECK (total_kobo >= 0),
  address_id UUID REFERENCES addresses(id),
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES order_groups(id),
  buyer_id UUID NOT NULL REFERENCES users(id),
  seller_id UUID NOT NULL REFERENCES seller_profiles(id),
  subtotal_kobo INTEGER NOT NULL CHECK (subtotal_kobo >= 0),
  delivery_fee_kobo INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','confirmed','preparing','out_for_delivery','delivered','completed','cancelled','disputed','refunded')),
  payment_state TEXT NOT NULL DEFAULT 'PENDING',
  po_ref TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_orders_group ON orders (group_id);
CREATE INDEX idx_orders_seller ON orders (seller_id, status);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  offer_id UUID NOT NULL REFERENCES seller_offers(id),
  qty INTEGER NOT NULL CHECK (qty >= 1),
  price_kobo INTEGER NOT NULL CHECK (price_kobo > 0)
);

CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES users(id),
  seller_id UUID REFERENCES seller_profiles(id),
  canonical_product_id UUID REFERENCES canonical_products(id),
  title TEXT NOT NULL,
  qty INTEGER NOT NULL CHECK (qty >= 1),
  unit_type TEXT NOT NULL DEFAULT 'carton',
  target_price_kobo INTEGER,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','countered','accepted','declined','expired')),
  expires_at TIMESTAMPTZ NOT NULL,
  po_ref TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE quote_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  version_no INTEGER NOT NULL CHECK (version_no >= 1),
  actor TEXT NOT NULL CHECK (actor IN ('seller','buyer')),
  price_kobo INTEGER NOT NULL CHECK (price_kobo > 0),
  qty INTEGER,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (quote_id, version_no)
);
