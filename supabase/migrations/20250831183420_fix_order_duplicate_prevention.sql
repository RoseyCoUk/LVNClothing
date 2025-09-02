-- Fix Order Duplicate Prevention (V2 - Fixed for missing admin_users)
-- This migration implements critical fixes to prevent duplicate order creation
-- Addresses race condition between confirm-payment-intent and stripe-webhook handlers

-- 1. Add stripe_payment_intent_id column if it doesn't exist and unique constraint
-- This is the CRITICAL constraint that prevents duplicate orders
DO $$
BEGIN
    -- Add the column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'stripe_payment_intent_id'
    ) THEN
        ALTER TABLE orders ADD COLUMN stripe_payment_intent_id text;
        RAISE NOTICE 'Added stripe_payment_intent_id column to orders table';
    END IF;
    
    -- Add unique constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_payment_intent'
    ) THEN
        ALTER TABLE orders 
        ADD CONSTRAINT unique_payment_intent 
        UNIQUE (stripe_payment_intent_id);
        RAISE NOTICE 'Added unique constraint on stripe_payment_intent_id';
    END IF;
END $$;

-- 2. Create webhook events audit table for deduplication and monitoring
-- This table tracks all incoming webhooks to prevent duplicate processing
CREATE TABLE IF NOT EXISTS webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL, -- 'stripe' or 'printful'
  event_id text UNIQUE NOT NULL, -- External event ID for deduplication
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  processed boolean DEFAULT false,
  processed_at timestamptz,
  error text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Create fulfillments tracking table for order fulfillment management
-- This table tracks Printful order fulfillment status and shipping updates
CREATE TABLE IF NOT EXISTS fulfillments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  printful_order_id text UNIQUE,
  status text NOT NULL DEFAULT 'pending', -- pending, submitted, fulfilled, shipped, cancelled
  tracking_number text,
  tracking_url text,
  shipped_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. Create idempotency keys table for preventing duplicate external API calls
-- This table prevents duplicate Stripe/Printful API calls through idempotency tracking
CREATE TABLE IF NOT EXISTS idempotency_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  result jsonb,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '24 hours')
);

-- 5. Add performance indexes
CREATE INDEX IF NOT EXISTS idx_webhook_events_source ON webhook_events(source);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON webhook_events(processed);
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON webhook_events(created_at);

CREATE INDEX IF NOT EXISTS idx_fulfillments_order_id ON fulfillments(order_id);
CREATE INDEX IF NOT EXISTS idx_fulfillments_status ON fulfillments(status);
CREATE INDEX IF NOT EXISTS idx_fulfillments_printful_order_id ON fulfillments(printful_order_id);

CREATE INDEX IF NOT EXISTS idx_idempotency_keys_key ON idempotency_keys(key);
CREATE INDEX IF NOT EXISTS idx_idempotency_keys_expires_at ON idempotency_keys(expires_at);

-- 6. Add updated_at trigger for webhook_events
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_webhook_events_updated_at'
    ) THEN
        CREATE TRIGGER update_webhook_events_updated_at
            BEFORE UPDATE ON webhook_events
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_fulfillments_updated_at'
    ) THEN
        CREATE TRIGGER update_fulfillments_updated_at
            BEFORE UPDATE ON fulfillments
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- 7. Add RLS policies for new tables
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE fulfillments ENABLE ROW LEVEL SECURITY;
ALTER TABLE idempotency_keys ENABLE ROW LEVEL SECURITY;

-- Service role can access everything
CREATE POLICY "Service role can access webhook_events" ON webhook_events
FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access fulfillments" ON fulfillments
FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access idempotency_keys" ON idempotency_keys
FOR ALL USING (auth.role() = 'service_role');

-- Admin users can view webhook events and fulfillments for monitoring
-- Only create these policies if admin_users table exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'admin_users'
    ) THEN
        -- Check if policy doesn't already exist
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE policyname = 'Admin can view webhook_events' 
            AND tablename = 'webhook_events'
        ) THEN
            EXECUTE 'CREATE POLICY "Admin can view webhook_events" ON webhook_events
            FOR SELECT USING (
              EXISTS (
                SELECT 1 FROM admin_users 
                WHERE admin_users.user_id = auth.uid()
              )
            )';
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE policyname = 'Admin can view fulfillments' 
            AND tablename = 'fulfillments'
        ) THEN
            EXECUTE 'CREATE POLICY "Admin can view fulfillments" ON fulfillments
            FOR SELECT USING (
              EXISTS (
                SELECT 1 FROM admin_users 
                WHERE admin_users.user_id = auth.uid()
              )
            )';
        END IF;
    ELSE
        RAISE NOTICE 'admin_users table does not exist, skipping admin policies';
    END IF;
END $$;

-- 8. Create a cleanup function for expired idempotency keys
CREATE OR REPLACE FUNCTION cleanup_expired_idempotency_keys()
RETURNS void AS $$
BEGIN
    DELETE FROM idempotency_keys WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE webhook_events IS 'Audit trail for all incoming webhooks from Stripe and Printful';
COMMENT ON TABLE fulfillments IS 'Tracks Printful order fulfillment status and shipping information';
COMMENT ON TABLE idempotency_keys IS 'Prevents duplicate external API calls through idempotency key tracking';
COMMENT ON CONSTRAINT unique_payment_intent ON orders IS 'CRITICAL: Prevents duplicate orders for same Stripe PaymentIntent';