-- Fix Orders Table Schema for Stripe Webhook
-- This migration adds missing columns required by the stripe-webhook2 function
-- and ensures compatibility with the order processing workflow

-- Add missing columns to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS customer_email TEXT,
ADD COLUMN IF NOT EXISTS readable_order_id TEXT,
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'GBP',
ADD COLUMN IF NOT EXISTS items JSONB,
ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS guest_checkout BOOLEAN DEFAULT false;

-- Add unique constraint on stripe_payment_intent_id if it doesn't exist
-- This is critical for preventing duplicate orders
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_stripe_payment_intent_id'
    ) THEN
        ALTER TABLE orders 
        ADD CONSTRAINT unique_stripe_payment_intent_id 
        UNIQUE (stripe_payment_intent_id);
        RAISE NOTICE 'Added unique constraint on stripe_payment_intent_id';
    END IF;
END $$;

-- Add unique constraint on readable_order_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_readable_order_id'
    ) THEN
        ALTER TABLE orders 
        ADD CONSTRAINT unique_readable_order_id 
        UNIQUE (readable_order_id);
        RAISE NOTICE 'Added unique constraint on readable_order_id';
    END IF;
END $$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_intent_id ON orders(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_readable_order_id ON orders(readable_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Update RLS policies to include new columns
-- Allow authenticated users to see their own orders by customer_email
DROP POLICY IF EXISTS "Users can view their own orders by email" ON orders;
CREATE POLICY "Users can view their own orders by email" ON orders
FOR SELECT USING (
  customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR user_id = auth.uid()
);

-- Allow service role to perform all operations
DROP POLICY IF EXISTS "Service role can access orders" ON orders;
CREATE POLICY "Service role can access orders" ON orders
FOR ALL USING (auth.role() = 'service_role');

-- Comments for documentation
COMMENT ON COLUMN orders.stripe_payment_intent_id IS 'Stripe PaymentIntent ID - used for idempotency and webhook processing';
COMMENT ON COLUMN orders.customer_email IS 'Customer email address from Stripe PaymentIntent metadata';
COMMENT ON COLUMN orders.readable_order_id IS 'Human-readable order ID displayed to customers (e.g., RUK-123456)';
COMMENT ON COLUMN orders.currency IS 'Order currency code (e.g., GBP, USD)';
COMMENT ON COLUMN orders.items IS 'JSON array of ordered items with product details, variants, and pricing';
COMMENT ON COLUMN orders.shipping_cost IS 'Shipping cost in the order currency';
COMMENT ON COLUMN orders.subtotal IS 'Subtotal before shipping and taxes';
COMMENT ON COLUMN orders.guest_checkout IS 'Whether this was a guest checkout (no user account)';

COMMENT ON CONSTRAINT unique_stripe_payment_intent_id ON orders IS 'CRITICAL: Prevents duplicate orders from Stripe webhooks';
COMMENT ON CONSTRAINT unique_readable_order_id ON orders IS 'Ensures readable order IDs are unique for customer reference';