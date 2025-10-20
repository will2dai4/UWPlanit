-- -----------------------------------------------------------------------------
-- 0002_add_billing_columns.sql — billing-related fields on auth.users
-- -----------------------------------------------------------------------------

-- assume the super-role that owns auth.users just for this migration
SET ROLE supabase_auth_admin;

-- your alterations
ALTER TABLE auth.users
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free';

RESET ROLE;  -- return to supabase_migrations

-- Convenient lookup when processing webhooks
create index if not exists idx_users_stripe_customer_id on auth.users(stripe_customer_id); 