-- Fix All RLS Policies for Admin Products Management
-- This script ensures RLS policies are working correctly for all tables

-- 1. First, let's check current policies on all tables
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename IN ('product_overrides', 'product_images', 'bundles', 'bundle_items')
ORDER BY tablename, policyname;

-- 2. Drop existing policies to recreate them properly
-- Product Overrides
DROP POLICY IF EXISTS "product_overrides_select_policy" ON public.product_overrides;
DROP POLICY IF EXISTS "product_overrides_insert_policy" ON public.product_overrides;
DROP POLICY IF EXISTS "product_overrides_update_policy" ON public.product_overrides;
DROP POLICY IF EXISTS "product_overrides_delete_policy" ON public.product_overrides;

-- Product Images
DROP POLICY IF EXISTS "product_images_select_policy" ON public.product_images;
DROP POLICY IF EXISTS "product_images_insert_policy" ON public.product_images;
DROP POLICY IF EXISTS "product_images_update_policy" ON public.product_images;
DROP POLICY IF EXISTS "product_images_delete_policy" ON public.product_images;

-- Bundles
DROP POLICY IF EXISTS "bundles_select_policy" ON public.bundles;
DROP POLICY IF EXISTS "bundles_insert_policy" ON public.bundles;
DROP POLICY IF EXISTS "bundles_update_policy" ON public.bundles;
DROP POLICY IF EXISTS "bundles_delete_policy" ON public.bundles;

-- Bundle Items
DROP POLICY IF EXISTS "bundle_items_select_policy" ON public.bundle_items;
DROP POLICY IF EXISTS "bundle_items_insert_policy" ON public.bundle_items;
DROP POLICY IF EXISTS "bundle_items_update_policy" ON public.bundle_items;
DROP POLICY IF EXISTS "bundle_items_delete_policy" ON public.bundle_items;

-- 3. Recreate RLS policies with proper restrictions

-- Product Overrides Policies
CREATE POLICY "product_overrides_select_policy" ON public.product_overrides
  FOR SELECT USING (is_active = true);

CREATE POLICY "product_overrides_insert_policy" ON public.product_overrides
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "product_overrides_update_policy" ON public.product_overrides
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "product_overrides_delete_policy" ON public.product_overrides
  FOR DELETE USING (auth.role() = 'authenticated');

-- Product Images Policies
CREATE POLICY "product_images_select_policy" ON public.product_images
  FOR SELECT USING (true);

CREATE POLICY "product_images_insert_policy" ON public.product_images
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "product_images_update_policy" ON public.product_images
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "product_images_delete_policy" ON public.product_images
  FOR DELETE USING (auth.role() = 'authenticated');

-- Bundles Policies
CREATE POLICY "bundles_select_policy" ON public.bundles
  FOR SELECT USING (is_active = true);

CREATE POLICY "bundles_insert_policy" ON public.bundles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "bundles_update_policy" ON public.bundles
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "bundles_delete_policy" ON public.bundles
  FOR DELETE USING (auth.role() = 'authenticated');

-- Bundle Items Policies
CREATE POLICY "bundle_items_select_policy" ON public.bundle_items
  FOR SELECT USING (true);

CREATE POLICY "bundle_items_insert_policy" ON public.bundle_items
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "bundle_items_update_policy" ON public.bundle_items
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "bundle_items_delete_policy" ON public.bundle_items
  FOR DELETE USING (auth.role() = 'authenticated');

-- 4. Verify policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename IN ('product_overrides', 'product_images', 'bundles', 'bundle_items')
ORDER BY tablename, policyname;

-- 5. Summary
SELECT 
    'Product Overrides Policies' as table_name,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'product_overrides'

UNION ALL

SELECT 
    'Product Images Policies' as table_name,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'product_images'

UNION ALL

SELECT 
    'Bundles Policies' as table_name,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'bundles'

UNION ALL

SELECT 
    'Bundle Items Policies' as table_name,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'bundle_items';
