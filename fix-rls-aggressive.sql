-- AGGRESSIVE RLS fix for product_images table
-- This will completely disable RLS and remove all policies

-- Step 1: Check current RLS status
SELECT 
    t.schemaname,
    t.tablename,
    t.rowsecurity,
    COUNT(p.policyname) as policy_count
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename
WHERE t.tablename = 'product_images'
GROUP BY t.schemaname, t.tablename, t.rowsecurity;

-- Step 2: Drop ALL policies (no matter what they're called)
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'product_images'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.product_images';
    END LOOP;
END $$;

-- Step 3: Disable RLS completely
ALTER TABLE public.product_images DISABLE ROW LEVEL SECURITY;

-- Step 4: Grant full permissions to authenticated users
GRANT ALL ON public.product_images TO authenticated;
GRANT ALL ON public.product_images TO anon;

-- Step 5: Verify RLS is disabled
SELECT 
    'RLS Status Check' as check_type,
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'product_images') as remaining_policies
FROM pg_tables 
WHERE tablename = 'product_images';

-- Step 6: Test insert (this should work now)
INSERT INTO public.product_images (
    product_id, 
    image_url, 
    image_order, 
    is_primary, 
    variant_type, 
    color, 
    size
) VALUES (
    (SELECT id FROM public.products LIMIT 1),
    'https://test.com/test-image.jpg',
    0,
    true,
    'product',
    NULL,
    NULL
) ON CONFLICT DO NOTHING;

-- Step 7: Clean up test data
DELETE FROM public.product_images WHERE image_url = 'https://test.com/test-image.jpg';

-- Step 8: Final verification
SELECT 
    'Final Status' as status,
    'RLS should be disabled' as message,
    (SELECT rowsecurity FROM pg_tables WHERE tablename = 'product_images') as rls_enabled,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'product_images') as policy_count;
