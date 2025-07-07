-- Force products table access by temporarily disabling RLS
-- This migration ensures products are accessible to all users

-- up

-- Completely disable RLS on products table
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;

-- Grant explicit permissions
GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;

-- Verify permissions work
DO $$
BEGIN
    -- Test as anon role
    PERFORM set_config('role', 'anon', false);
    IF NOT EXISTS (SELECT 1 FROM public.products LIMIT 1) THEN
        RAISE NOTICE 'Anon role cannot access products table';
    ELSE
        RAISE NOTICE 'Anon role can access products table - SUCCESS';
    END IF;
    
    -- Reset to postgres role
    PERFORM set_config('role', 'postgres', false);
END $$;

-- Now re-enable RLS with a simple policy
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;
DROP POLICY IF EXISTS "Enable all access for service role" ON public.products;
DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
DROP POLICY IF EXISTS "Allow service role full access to products" ON public.products;

-- Create a very simple policy that allows everyone to read
CREATE POLICY "products_select_policy"
ON public.products
FOR SELECT
TO anon, authenticated
USING (true);

-- Create policy for service role
CREATE POLICY "products_service_policy"
ON public.products
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Test the policy
DO $$
BEGIN
    -- Test as anon role with RLS enabled
    PERFORM set_config('role', 'anon', false);
    IF NOT EXISTS (SELECT 1 FROM public.products LIMIT 1) THEN
        RAISE EXCEPTION 'Anon role cannot access products table with RLS enabled';
    ELSE
        RAISE NOTICE 'Anon role can access products table with RLS - SUCCESS';
    END IF;
    
    -- Reset to postgres role
    PERFORM set_config('role', 'postgres', false);
END $$;

-- down

-- Remove policies
DROP POLICY IF EXISTS "products_select_policy" ON public.products;
DROP POLICY IF EXISTS "products_service_policy" ON public.products;

-- Revoke permissions
REVOKE SELECT ON public.products FROM anon;
REVOKE SELECT ON public.products FROM authenticated; 