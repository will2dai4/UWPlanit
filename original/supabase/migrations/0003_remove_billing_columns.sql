-- -----------------------------------------------------------------------------
-- 0003_remove_billing_columns.sql — Remove billing-related fields from auth.users
-- -----------------------------------------------------------------------------

-- assume the super-role that owns auth.users just for this migration
SET ROLE supabase_auth_admin;

-- Remove billing-related columns
ALTER TABLE auth.users
  DROP COLUMN IF EXISTS stripe_customer_id,
  DROP COLUMN IF EXISTS plan;

-- Remove the index that was created for Stripe customer lookup
DROP INDEX IF EXISTS idx_users_stripe_customer_id;

RESET ROLE;  -- return to supabase_migrations
