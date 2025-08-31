-- Final Fix for Product Overrides RLS Policies
-- This script ensures RLS policies are working correctly and blocking unauthenticated access

-- 1. First, let's check the current state
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'product_overrides'
ORDER BY policyname;

-- 2. Check if RLS is enabled on the table
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'product_overrides';

-- 3. Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "product_overrides_select_policy" ON public.product_overrides;
DROP POLICY IF EXISTS "product_overrides_insert_policy" ON public.product_overrides;
DROP POLICY IF EXISTS "product_overrides_update_policy" ON public.product_overrides;
DROP POLICY IF EXISTS "product_overrides_delete_policy" ON public.product_overrides;

-- 4. Recreate policies with STRICT authentication checks
CREATE POLICY "product_overrides_select_policy" ON public.product_overrides
  FOR SELECT USING (is_active = true);

CREATE POLICY "product_overrides_insert_policy" ON public.product_overrides
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND 
    auth.uid() IS NOT NULL
  );

CREATE POLICY "product_overrides_update_policy" ON public.product_overrides
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND 
    auth.uid() IS NOT NULL
  );

CREATE POLICY "product_overrides_delete_policy" ON public.product_overrides
  FOR DELETE USING (
    auth.role() = 'authenticated' AND 
    auth.uid() IS NOT NULL
  );

-- 5. Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'product_overrides'
ORDER BY policyname;

-- 6. Test the policies by trying to insert as unauthenticated user
-- This should now fail with RLS error, not duplicate key error
-- INSERT INTO public.product_overrides (printful_product_id, custom_retail_price) VALUES ('test-rls-final-789', 29.99);

-- 7. Summary
SELECT 
    'Product Overrides RLS Policies' as check_type,
    COUNT(*)::text as count
FROM pg_policies 
WHERE tablename = 'product_overrides'

UNION ALL

SELECT 
    'RLS Enabled on Table' as check_type,
    CASE 
        WHEN rowsecurity THEN 'YES'
        ELSE 'NO'
    END as count
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'product_overrides';
