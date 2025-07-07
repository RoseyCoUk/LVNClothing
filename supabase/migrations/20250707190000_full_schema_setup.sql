-- Full Schema Setup Migration
-- This migration creates the complete orders and order_items schema with all necessary
-- triggers, RLS policies, indexes, and functionality for the Reform UK eCommerce system

-- up

-- 1. Create orders table with all required fields
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id text,
  customer_email text,
  items jsonb,
  customer_details jsonb,
  created_at timestamptz DEFAULT timezone('utc', now()),
  readable_order_id text
);

-- 2. Create order_items table with foreign key reference
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  name text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  price numeric NOT NULL CHECK (price >= 0),
  created_at timestamptz DEFAULT timezone('utc', now())
);

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id ON public.orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_readable_order_id ON public.orders(readable_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_readable_order_id_asc ON public.orders(readable_order_id ASC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_details ON public.orders USING GIN (customer_details);

-- 4. Create unique constraint on readable_order_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_readable_order_id_unique ON public.orders(readable_order_id);

-- 5. Add table comments for documentation
COMMENT ON TABLE public.orders IS 'Stores customer orders from Stripe checkout';
COMMENT ON TABLE public.order_items IS 'Stores individual line items for each order';
COMMENT ON COLUMN public.orders.customer_details IS 'Stores customer details from Stripe checkout session (name, phone, address, etc.)';
COMMENT ON INDEX public.idx_orders_customer_details IS 'GIN index for efficient JSONB queries on customer_details';

-- 6. Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies for orders table
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Service role can update orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Allow service role full access to orders" ON public.orders;
DROP POLICY IF EXISTS "Allow anonymous users to view orders" ON public.orders;
DROP POLICY IF EXISTS "Allow service role to insert orders" ON public.orders;
DROP POLICY IF EXISTS "Allow service role to update orders" ON public.orders;

-- Create new RLS policies
CREATE POLICY "Allow service role full access to orders"
ON public.orders
AS PERMISSIVE
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Users can view their own orders"
ON public.orders
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (auth.email() = customer_email);

CREATE POLICY "Allow anonymous users to view orders"
ON public.orders
AS PERMISSIVE
FOR SELECT
TO anon
USING (true);

CREATE POLICY "Allow service role to insert orders"
ON public.orders
AS PERMISSIVE
FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Allow service role to update orders"
ON public.orders
AS PERMISSIVE
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- 8. Create RLS policies for order_items table
CREATE POLICY "Allow service role full access to order_items"
ON public.order_items
AS PERMISSIVE
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Users can view their own order items"
ON public.order_items
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
  order_id IN (
    SELECT id FROM public.orders 
    WHERE customer_email = auth.email()
  )
);

CREATE POLICY "Allow anonymous users to view order items"
ON public.order_items
AS PERMISSIVE
FOR SELECT
TO anon
USING (true);

-- 9. Grant necessary permissions
GRANT ALL ON public.orders TO service_role;
GRANT SELECT ON public.orders TO authenticated;
GRANT SELECT ON public.orders TO anon;

GRANT ALL ON public.order_items TO service_role;
GRANT SELECT ON public.order_items TO authenticated;
GRANT SELECT ON public.order_items TO anon;

-- 10. Create the trigger function to generate readable order IDs
CREATE OR REPLACE FUNCTION public.generate_readable_order_id()
RETURNS TRIGGER AS $$
DECLARE
    org_prefix TEXT := 'RB'; -- Default prefix for Reform UK
    max_number INTEGER := 0;
    next_number INTEGER;
    new_readable_id TEXT;
BEGIN
    -- Only generate if readable_order_id is NULL
    IF NEW.readable_order_id IS NULL THEN
        -- Get the maximum number for this organization prefix
        -- Use advisory lock to prevent race conditions
        PERFORM pg_advisory_xact_lock(12345); -- Arbitrary lock ID
        
        SELECT COALESCE(MAX(
            CASE 
                WHEN readable_order_id ~ ('^' || org_prefix || '-[0-9]+$') 
                THEN CAST(SUBSTRING(readable_order_id FROM LENGTH(org_prefix) + 2) AS INTEGER)
                ELSE 0
            END
        ), 0) INTO max_number
        FROM public.orders 
        WHERE readable_order_id IS NOT NULL;
        
        -- Increment the number
        next_number := max_number + 1;
        
        -- Format the new readable order ID (left-pad to 5 digits)
        new_readable_id := org_prefix || '-' || LPAD(next_number::TEXT, 5, '0');
        
        -- Set the new readable order ID
        NEW.readable_order_id := new_readable_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 11. Create the trigger for readable order ID generation
DROP TRIGGER IF EXISTS set_readable_order_id ON public.orders;
CREATE TRIGGER set_readable_order_id
    BEFORE INSERT ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.generate_readable_order_id();

-- down

-- Drop triggers and functions
DROP TRIGGER IF EXISTS set_readable_order_id ON public.orders;
DROP FUNCTION IF EXISTS public.generate_readable_order_id();

-- Drop RLS policies
DROP POLICY IF EXISTS "Allow service role full access to orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Allow anonymous users to view orders" ON public.orders;
DROP POLICY IF EXISTS "Allow service role to insert orders" ON public.orders;
DROP POLICY IF EXISTS "Allow service role to update orders" ON public.orders;

DROP POLICY IF EXISTS "Allow service role full access to order_items" ON public.order_items;
DROP POLICY IF EXISTS "Users can view their own order items" ON public.order_items;
DROP POLICY IF EXISTS "Allow anonymous users to view order items" ON public.order_items;

-- Drop indexes
DROP INDEX IF EXISTS public.idx_orders_customer_email;
DROP INDEX IF EXISTS public.idx_orders_stripe_session_id;
DROP INDEX IF EXISTS public.idx_orders_readable_order_id;
DROP INDEX IF EXISTS public.idx_orders_readable_order_id_asc;
DROP INDEX IF EXISTS public.idx_orders_readable_order_id_unique;
DROP INDEX IF EXISTS public.idx_order_items_order_id;
DROP INDEX IF EXISTS public.idx_orders_customer_details;

-- Drop tables (order matters due to foreign key constraints)
DROP TABLE IF EXISTS public.order_items;
DROP TABLE IF EXISTS public.orders; 