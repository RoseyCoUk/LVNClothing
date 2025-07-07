-- Fix products table permissions and RLS policies
-- This migration ensures products are accessible to all users

-- up

-- First, let's check if RLS is enabled and disable it temporarily to ensure we can access the table
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;

-- Grant all necessary permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.products TO anon;
GRANT ALL ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;

-- Re-enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
DROP POLICY IF EXISTS "Allow service role full access to products" ON public.products;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;

-- Create a simple policy that allows everyone to read products
CREATE POLICY "Enable read access for all users"
ON public.products
FOR SELECT
USING (true);

-- Create policy for service role
CREATE POLICY "Enable all access for service role"
ON public.products
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Verify the table exists and has data
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'products') THEN
        RAISE EXCEPTION 'Products table does not exist';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public.products LIMIT 1) THEN
        RAISE NOTICE 'Products table is empty';
    ELSE
        RAISE NOTICE 'Products table has data';
    END IF;
END $$;

-- down

-- Remove policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;
DROP POLICY IF EXISTS "Enable all access for service role" ON public.products;

-- Revoke permissions
REVOKE ALL ON public.products FROM anon;
REVOKE ALL ON public.products FROM authenticated;
REVOKE USAGE ON SCHEMA public FROM anon;
REVOKE USAGE ON SCHEMA public FROM authenticated; 