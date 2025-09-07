-- Emergency fix for orders table schema
-- This migration adds ALL required columns for stripe-webhook2 function
-- Uses IF NOT EXISTS to safely add columns even if they might already exist

-- Check if orders table exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables 
                  WHERE table_schema = 'public' AND table_name = 'orders') THEN
        CREATE TABLE public.orders (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END
$$;

-- Add all required columns with safe IF NOT EXISTS checks
DO $$
BEGIN
    -- stripe_payment_intent_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'orders' AND column_name = 'stripe_payment_intent_id') THEN
        ALTER TABLE public.orders ADD COLUMN stripe_payment_intent_id TEXT;
    END IF;
    
    -- customer_email
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'orders' AND column_name = 'customer_email') THEN
        ALTER TABLE public.orders ADD COLUMN customer_email TEXT;
    END IF;
    
    -- readable_order_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'orders' AND column_name = 'readable_order_id') THEN
        ALTER TABLE public.orders ADD COLUMN readable_order_id TEXT;
    END IF;
    
    -- order_number (required field)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'orders' AND column_name = 'order_number') THEN
        ALTER TABLE public.orders ADD COLUMN order_number TEXT;
    END IF;
    
    -- currency
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'orders' AND column_name = 'currency') THEN
        ALTER TABLE public.orders ADD COLUMN currency TEXT DEFAULT 'GBP';
    END IF;
    
    -- status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'orders' AND column_name = 'status') THEN
        ALTER TABLE public.orders ADD COLUMN status TEXT DEFAULT 'pending';
    END IF;
    
    -- total_amount
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'orders' AND column_name = 'total_amount') THEN
        ALTER TABLE public.orders ADD COLUMN total_amount DECIMAL(10,2);
    END IF;
    
    -- items
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'orders' AND column_name = 'items') THEN
        ALTER TABLE public.orders ADD COLUMN items JSONB;
    END IF;
    
    -- shipping_address
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'orders' AND column_name = 'shipping_address') THEN
        ALTER TABLE public.orders ADD COLUMN shipping_address JSONB;
    END IF;
    
    -- shipping_cost
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'orders' AND column_name = 'shipping_cost') THEN
        ALTER TABLE public.orders ADD COLUMN shipping_cost DECIMAL(10,2) DEFAULT 0.00;
    END IF;
    
    -- subtotal
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'orders' AND column_name = 'subtotal') THEN
        ALTER TABLE public.orders ADD COLUMN subtotal DECIMAL(10,2);
    END IF;
    
    -- guest_checkout
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'orders' AND column_name = 'guest_checkout') THEN
        ALTER TABLE public.orders ADD COLUMN guest_checkout BOOLEAN DEFAULT false;
    END IF;
    
    -- user_id (for authenticated users)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'orders' AND column_name = 'user_id') THEN
        ALTER TABLE public.orders ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
    
END
$$;

-- Add unique constraints safely
DO $$
BEGIN
    -- Unique constraint on stripe_payment_intent_id
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'orders_stripe_payment_intent_id_key'
    ) THEN
        ALTER TABLE public.orders 
        ADD CONSTRAINT orders_stripe_payment_intent_id_key 
        UNIQUE (stripe_payment_intent_id);
        RAISE NOTICE 'Added unique constraint on stripe_payment_intent_id';
    END IF;
    
    -- Unique constraint on readable_order_id
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'orders_readable_order_id_key'
    ) THEN
        ALTER TABLE public.orders 
        ADD CONSTRAINT orders_readable_order_id_key 
        UNIQUE (readable_order_id);
        RAISE NOTICE 'Added unique constraint on readable_order_id';
    END IF;
END $$;

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_intent_id ON public.orders(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_readable_order_id ON public.orders(readable_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);

-- Enable RLS on orders table
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Drop existing RLS policies and recreate them
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own orders by email" ON public.orders;
DROP POLICY IF EXISTS "Service role can access orders" ON public.orders;

-- Allow users to view their own orders (by user_id or email)
CREATE POLICY "Users can view their own orders" ON public.orders
FOR SELECT USING (
  user_id = auth.uid() 
  OR customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Allow service role to perform all operations (for webhooks and admin)
CREATE POLICY "Service role can access orders" ON public.orders
FOR ALL USING (auth.role() = 'service_role');

-- Add helpful comments
COMMENT ON TABLE public.orders IS 'Customer orders from Stripe payments - processed via webhooks';
COMMENT ON COLUMN public.orders.stripe_payment_intent_id IS 'Stripe PaymentIntent ID - CRITICAL for preventing duplicate orders';
COMMENT ON COLUMN public.orders.customer_email IS 'Customer email from Stripe metadata or receipt_email';
COMMENT ON COLUMN public.orders.readable_order_id IS 'Human-readable order ID (e.g., RUK-123456ABC)';
COMMENT ON COLUMN public.orders.order_number IS 'Internal order number (same as readable_order_id)';
COMMENT ON COLUMN public.orders.currency IS 'Order currency (GBP, USD, EUR)';
COMMENT ON COLUMN public.orders.status IS 'Order status: pending, paid, processing, shipped, delivered, cancelled';
COMMENT ON COLUMN public.orders.items IS 'JSON array of order items with product details, variants, pricing';
COMMENT ON COLUMN public.orders.shipping_address IS 'Shipping address from Stripe metadata';
COMMENT ON COLUMN public.orders.guest_checkout IS 'True for guest checkouts (no user account)';

RAISE NOTICE 'Emergency orders table schema fix completed successfully!';