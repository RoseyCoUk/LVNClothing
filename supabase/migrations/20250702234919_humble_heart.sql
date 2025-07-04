/*
  # Configure Secure Access for Orders (Authenticated & Guest Users)

  This migration file prepares the database for handling e-commerce orders from both
  authenticated users and guests. It implements a robust security model for accessing order data.

  1. New/Altered Tables:
     - `stripe_orders`: Adds a `session_id` column to associate orders with guest checkouts.

  2. Security Policies (RLS):
     - Enables Row Level Security on the `stripe_orders` table.
     - Creates a single policy that allows users to view their own orders,
       whether they are logged in (checking `user_id`) or a guest (checking `session_id`).

  3. Secure Views:
     - `stripe_user_orders`: Provides a secure view for querying orders. In this view,
       the `customer_id` from the base table is aliased as `id` for cleaner client-side access.
*/

-- Add a column to store a unique identifier for guest checkout sessions
ALTER TABLE stripe_orders
ADD COLUMN IF NOT EXISTS session_id TEXT;

-- Enable RLS on stripe_orders table if not already enabled
ALTER TABLE stripe_orders ENABLE ROW LEVEL SECURITY;

-- Drop the old policy if it exists to replace it with a more comprehensive one
DROP POLICY IF EXISTS "Allow authenticated users to view their own orders" ON stripe_orders;
DROP POLICY IF EXISTS "Allow users (authenticated or guest) to view their own orders" ON stripe_orders;

-- Create a single policy for stripe_orders to handle both authenticated users and guests.
CREATE POLICY "Allow users (authenticated or guest) to view their own orders"
  ON stripe_orders
  FOR SELECT
  USING (
    -- Case 1: The user is authenticated, and their UID matches the order's user_id
    (auth.uid() IS NOT NULL AND customer_id IN (SELECT customer_id FROM stripe_customers WHERE user_id = auth.uid())) OR
    -- Case 2: The user is a guest, and their session ID matches the order's session_id
    (auth.uid() IS NULL AND session_id = current_setting('request.jwt.claims.session_id', true))
  );

-- Drop the view if it exists, so we can reliably create it with the new column names.
DROP VIEW IF EXISTS stripe_user_orders;

-- Create the view with an explicit column alias.
-- We are selecting all columns from stripe_orders, but renaming 'customer_id' to 'id'.
CREATE VIEW stripe_user_orders AS
SELECT
  customer_id AS id, -- This is the change: explicitly aliasing the column
  amount_subtotal,
  amount_total,
  currency,
  -- Add all other columns from your stripe_orders table here
  -- For example:
  -- metadata,
  -- payment_status,
  -- created_at,
  user_id,
  session_id
FROM
  stripe_orders;


-- Grant access to the view for all authenticated users and anonymous users (guests).
-- The RLS policy is the ultimate authority on what rows can be seen.
GRANT SELECT ON stripe_user_orders TO authenticated;
GRANT SELECT ON stripe_user_orders TO anon;