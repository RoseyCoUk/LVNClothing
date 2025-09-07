-- EMERGENCY DATABASE SCHEMA FIX FOR STRIPE WEBHOOK
-- Execute this SQL in the Supabase SQL Editor to fix the orders table schema
-- This will resolve the "Could not find the 'currency' column" and other schema errors

-- Add missing columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'GBP';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS readable_order_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS items JSONB;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(10,2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_checkout BOOLEAN DEFAULT false;

-- Add unique constraints to prevent duplicate orders (CRITICAL for webhook idempotency)
-- Drop existing constraints if they exist, then recreate them
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_stripe_payment_intent_id_key;
ALTER TABLE orders ADD CONSTRAINT orders_stripe_payment_intent_id_key 
UNIQUE (stripe_payment_intent_id);

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_readable_order_id_key;
ALTER TABLE orders ADD CONSTRAINT orders_readable_order_id_key 
UNIQUE (readable_order_id);

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_intent_id ON orders(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_readable_order_id ON orders(readable_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Add helpful comments
COMMENT ON COLUMN orders.stripe_payment_intent_id IS 'Stripe PaymentIntent ID - CRITICAL for preventing duplicate orders';
COMMENT ON COLUMN orders.customer_email IS 'Customer email from Stripe metadata or receipt_email';
COMMENT ON COLUMN orders.readable_order_id IS 'Human-readable order ID (e.g., RUK-123456ABC)';
COMMENT ON COLUMN orders.currency IS 'Order currency (GBP, USD, EUR)';
COMMENT ON COLUMN orders.items IS 'JSON array of order items with product details, variants, pricing';
COMMENT ON COLUMN orders.shipping_cost IS 'Shipping cost in order currency';
COMMENT ON COLUMN orders.subtotal IS 'Subtotal before shipping and taxes';
COMMENT ON COLUMN orders.guest_checkout IS 'True for guest checkouts (no user account)';

-- Enable RLS if not already enabled
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Update RLS policies to handle new columns
DROP POLICY IF EXISTS "Users can view their own orders by email" ON orders;
CREATE POLICY "Users can view their own orders by email" ON orders
FOR SELECT USING (
  customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR user_id = auth.uid()
);

DROP POLICY IF EXISTS "Service role can access orders" ON orders;
CREATE POLICY "Service role can access orders" ON orders
FOR ALL USING (auth.role() = 'service_role');

-- Test the schema fix
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Display success message
SELECT 'Orders table schema fix completed successfully!' as status;