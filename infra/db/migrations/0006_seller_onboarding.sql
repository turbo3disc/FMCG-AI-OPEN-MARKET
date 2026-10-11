-- 0006: seller onboarding — contact/address/location on seller_profiles,
-- 'suspended' status, and a notification outbox (email / sms / whatsapp).
-- Additive + idempotent (safe to run on production).
ALTER TABLE seller_profiles ADD COLUMN IF NOT EXISTS contact_name TEXT;
ALTER TABLE seller_profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE seller_profiles ADD COLUMN IF NOT EXISTS address_line1 TEXT;
ALTER TABLE seller_profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE seller_profiles ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION;
ALTER TABLE seller_profiles ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION;
ALTER TABLE seller_profiles DROP CONSTRAINT IF EXISTS seller_profiles_verification_status_check;
DO $$ BEGIN
  ALTER TABLE seller_profiles ADD CONSTRAINT seller_profiles_verification_status_check
    CHECK (verification_status IN ('pending','approved','rejected','suspended'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel TEXT NOT NULL CHECK (channel IN ('email','sms','whatsapp')),
  to_addr TEXT NOT NULL,
  template TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'logged' CHECK (status IN ('logged','sent','failed')),
  provider_ref TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_template ON notifications (template, created_at);
