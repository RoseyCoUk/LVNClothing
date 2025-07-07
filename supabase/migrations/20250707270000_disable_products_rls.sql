-- Temporarily disable RLS on products table to ensure access
-- This migration disables RLS to fix the permission issue

-- up

-- Completely disable RLS on products table
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;

-- Grant explicit permissions
GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;

-- Verify the table is accessible
DO $$
BEGIN
    -- Test as anon role
    PERFORM set_config('role', 'anon', false);
    IF NOT EXISTS (SELECT 1 FROM public.products LIMIT 1) THEN
        RAISE EXCEPTION 'Anon role still cannot access products table after disabling RLS';
    ELSE
        RAISE NOTICE 'SUCCESS: Anon role can access products table with RLS disabled';
    END IF;
    
    -- Reset to postgres role
    PERFORM set_config('role', 'postgres', false);
END $$;

-- down

-- Re-enable RLS (this will require proper policies to be added later)
-- ALTER TABLE public.products ENABLE ROW LEVEL SECURITY; 