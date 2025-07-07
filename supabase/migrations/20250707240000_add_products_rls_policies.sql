-- Add RLS policies to products table
-- This migration ensures that products are accessible to all users

-- up

-- Enable RLS on products table if not already enabled
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
DROP POLICY IF EXISTS "Allow service role full access to products" ON public.products;

-- Create policy for public read access
CREATE POLICY "Allow public read access to products"
ON public.products
AS PERMISSIVE
FOR SELECT
TO anon, authenticated
USING (true);

-- Create policy for service role full access
CREATE POLICY "Allow service role full access to products"
ON public.products
AS PERMISSIVE
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Grant necessary permissions
GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;

-- down

-- Remove policies
DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
DROP POLICY IF EXISTS "Allow service role full access to products" ON public.products;

-- Revoke permissions
REVOKE SELECT ON public.products FROM anon;
REVOKE SELECT ON public.products FROM authenticated;
REVOKE ALL ON public.products FROM service_role; 