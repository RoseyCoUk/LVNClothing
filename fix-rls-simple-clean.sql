-- SIMPLE AND CLEAN RLS fix for product_images table
-- This will completely disable RLS and remove all policies

-- Step 1: Check current RLS status
SELECT 
    'Current Status' as status,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'product_images';

-- Step 2: Check current policies
SELECT 
    'Current Policies' as status,
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename = 'product_images';

-- Step 3: Drop ALL policies (no matter what they're called)
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
        RAISE NOTICE 'Dropped policy: %', policy_record.policyname;
    END LOOP;
END $$;

-- Step 4: Disable RLS completely
ALTER TABLE public.product_images DISABLE ROW LEVEL SECURITY;

-- Step 5: Grant full permissions
GRANT ALL ON public.product_images TO authenticated;
GRANT ALL ON public.product_images TO anon;

-- Step 6: Verify RLS is disabled
SELECT 
    'Final Status' as status,
    tablename,
    rowsecurity as rls_enabled,
    'RLS should be disabled' as message
FROM pg_tables 
WHERE tablename = 'product_images';

-- Step 7: Verify no policies remain
SELECT 
    'Policy Count' as status,
    COUNT(*) as remaining_policies,
    'Should be 0' as expected
FROM pg_policies 
WHERE tablename = 'product_images';
