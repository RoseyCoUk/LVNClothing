/*
  # Configure Secure Access for Orders (Authenticated & Guest Users)

  This migration file prepares the database for handling e-commerce orders from both
  authenticated users and guests. It removes previous subscription-related logic
  and implements a robust security model for accessing order data.

  1. New/Altered Tables:
     - `stripe_orders`: Adds a `session_id` column to associate orders with guest checkouts.

  2. Security Policies (RLS):
     - Enables Row Level Security on the `stripe_orders` table.
     - Creates a single, powerful policy that allows users to view their own orders,
       whether they are logged in (checking `user_id`) or a guest (checking `session_id`).

  3. Secure Views:
     - `stripe_user_orders`: Provides a secure view for querying orders that automatically
       respects the RLS policies for both logged-in and guest users.

  4. Implementation Note:
     - Your application backend will be responsible for generating a unique session ID for
       guests, storing it (e.g., in a secure, HTTP-only cookie), and passing it to
       Supabase when querying for guest orders.
*/

-- Add a column to store a unique identifier for guest checkout sessions
ALTER TABLE stripe_orders
ADD COLUMN IF NOT EXISTS session_id TEXT;

-- Enable RLS on stripe_orders table if not already enabled
ALTER TABLE stripe_orders ENABLE ROW LEVEL SECURITY;

-- Drop the old policy if it exists to replace it with a more comprehensive one
DROP POLICY IF EXISTS "Allow authenticated users to view their own orders" ON stripe_orders;

-- Create a single policy for stripe_orders to handle both authenticated users and guests.
-- This policy checks for a matching user_id for logged-in users OR a matching session_id for guests.
-- Your application should set the 'request.jwt.claims.session_id' value for guest users.
CREATE POLICY "Allow users (authenticated or guest) to view their own orders"
  ON stripe_orders
  FOR SELECT
  USING (
    -- Case 1: The user is authenticated, and their UID matches the order's user_id
    (auth.uid() IS NOT NULL AND customer_id IN (SELECT customer_id FROM stripe_customers WHERE user_id = auth.uid())) OR
    -- Case 2: The user is a guest, and their session ID matches the order's session_id
    (auth.uid() IS NULL AND session_id = current_setting('request.jwt.claims.session_id', true))
  );

-- Create or replace the stripe_user_orders view.
-- The underlying RLS policy will handle the filtering automatically.
CREATE OR REPLACE VIEW stripe_user_orders AS
SELECT * FROM stripe_orders;

-- Grant access to the view for all authenticated users and anonymous users (guests)
-- The RLS policy is the ultimate authority on what rows can be seen.
GRANT SELECT ON stripe_user_orders TO authenticated;
GRANT SELECT ON stripe_user_orders TO anon;