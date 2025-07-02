/*
  # Create User Subscription View

  1. New Views
    - `stripe_user_subscriptions` - View that exposes user's subscription data filtered by authenticated user
  
  2. Security
    - Enable RLS on stripe_subscriptions table if not already enabled
    - Create policy to allow authenticated users to view their own subscriptions
    - Create policy to allow authenticated users to view their own orders
  
  3. Changes
    - Creates a secure view for user subscription data
    - Ensures proper RLS policies are in place
*/

-- Enable RLS on stripe_subscriptions table if not already enabled
ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;

-- Enable RLS on stripe_orders table if not already enabled  
ALTER TABLE stripe_orders ENABLE ROW LEVEL SECURITY;

-- Create policy for stripe_subscriptions to allow authenticated users to view their own subscriptions
CREATE POLICY IF NOT EXISTS "Allow authenticated users to view their own subscriptions"
  ON stripe_subscriptions
  FOR SELECT
  TO authenticated
  USING (customer_id IN (SELECT customer_id FROM stripe_customers WHERE user_id = auth.uid()));

-- Create policy for stripe_orders to allow authenticated users to view their own orders
CREATE POLICY IF NOT EXISTS "Allow authenticated users to view their own orders"
  ON stripe_orders
  FOR SELECT
  TO authenticated
  USING (customer_id IN (SELECT customer_id FROM stripe_customers WHERE user_id = auth.uid()));

-- Create the stripe_user_subscriptions view
CREATE OR REPLACE VIEW stripe_user_subscriptions AS
SELECT * FROM stripe_subscriptions
WHERE customer_id IN (SELECT customer_id FROM stripe_customers WHERE user_id = auth.uid());

-- Create the stripe_user_orders view for consistency
CREATE OR REPLACE VIEW stripe_user_orders AS
SELECT * FROM stripe_orders
WHERE customer_id IN (SELECT customer_id FROM stripe_customers WHERE user_id = auth.uid());

-- Grant access to the views for authenticated users
GRANT SELECT ON stripe_user_subscriptions TO authenticated;
GRANT SELECT ON stripe_user_orders TO authenticated;