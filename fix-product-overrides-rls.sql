-- Fix Product Overrides RLS Policies
-- This script ensures RLS policies are working correctly for product_overrides

-- 1. First, let's check current policies on product_overrides
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'product_overrides'
ORDER BY policyname;

-- 2. Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "product_overrides_select_policy" ON public.product_overrides;
DROP POLICY IF EXISTS "product_overrides_insert_policy" ON public.product_overrides;
DROP POLICY IF EXISTS "product_overrides_update_policy" ON public.product_overrides;
DROP POLICY IF EXISTS "product_overrides_delete_policy" ON public.product_overrides;

-- 3. Recreate RLS policies with proper restrictions
CREATE POLICY "product_overrides_select_policy" ON public.product_overrides
  FOR SELECT USING (is_active = true);

CREATE POLICY "product_overrides_insert_policy" ON public.product_overrides
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "product_overrides_update_policy" ON public.product_overrides
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "product_overrides_delete_policy" ON public.product_overrides
  FOR DELETE USING (auth.role() = 'authenticated');

-- 4. Verify policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'product_overrides'
ORDER BY policyname;

-- 5. Test RLS is working by trying to insert as unauthenticated user
-- This should fail with RLS error, not duplicate key error
-- INSERT INTO public.product_overrides (printful_product_id, custom_retail_price) VALUES ('test-rls-fix-456', 29.99);

-- 6. Summary
SELECT 
    'Product Overrides RLS Policies' as check_type,
    COUNT(*)::text as count
FROM pg_policies 
WHERE tablename = 'product_overrides'

UNION ALL

SELECT 
    'RLS Enabled on Table' as check_type,
    CASE 
        WHEN relrowsecurity THEN 'YES'
        ELSE 'NO'
    END as count
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'product_overrides';
