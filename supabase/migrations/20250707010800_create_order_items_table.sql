-- Migration: Create order_items table
-- This migration creates the missing order_items table referenced in send-order-email function

-- Create the order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price NUMERIC NOT NULL CHECK (price >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on the table
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_created_at ON public.order_items(created_at);

-- Create RLS policies for order_items table
-- Allow service role full access
CREATE POLICY "Allow service role full access to order_items"
ON public.order_items
AS PERMISSIVE
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow authenticated users to view their own order items
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

-- Allow anonymous users to view order items (for guest checkout)
CREATE POLICY "Allow anonymous users to view order items"
ON public.order_items
AS PERMISSIVE
FOR SELECT
TO anon
USING (true);

-- Grant necessary permissions
GRANT ALL ON public.order_items TO service_role;
GRANT SELECT ON public.order_items TO authenticated;
GRANT SELECT ON public.order_items TO anon;

-- Add comments for documentation
COMMENT ON TABLE public.order_items IS 'Stores individual line items for each order';
COMMENT ON COLUMN public.order_items.id IS 'Unique identifier for the order item';
COMMENT ON COLUMN public.order_items.order_id IS 'Foreign key reference to the parent order';
COMMENT ON COLUMN public.order_items.name IS 'Name/description of the product';
COMMENT ON COLUMN public.order_items.quantity IS 'Quantity of the item ordered';
COMMENT ON COLUMN public.order_items.price IS 'Price per unit in decimal format';
COMMENT ON COLUMN public.order_items.created_at IS 'Timestamp when the order item was created'; 