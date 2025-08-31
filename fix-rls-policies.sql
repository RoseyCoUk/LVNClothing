-- Fix RLS Policies for Admin Products Management
-- This script ensures RLS policies are working correctly

-- 1. First, let's check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename IN ('product_overrides', 'product_images', 'bundles', 'bundle_items')
ORDER BY tablename, policyname;

-- 2. Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can view active product overrides" ON public.product_overrides;
DROP POLICY IF EXISTS "Authenticated users can manage product overrides" ON public.product_overrides;

DROP POLICY IF EXISTS "Users can view product images" ON public.product_images;
DROP POLICY IF EXISTS "Authenticated users can manage product images" ON public.product_images;

DROP POLICY IF EXISTS "Users can view active bundles" ON public.bundles;
DROP POLICY IF EXISTS "Authenticated users can manage bundles" ON public.bundles;

DROP POLICY IF EXISTS "Users can view bundle items" ON public.bundle_items;
DROP POLICY IF EXISTS "Authenticated users can manage bundle items" ON public.bundle_items;

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

-- 5. Test RLS is working
-- This should fail for unauthenticated users
-- INSERT INTO public.product_overrides (printful_product_id, custom_retail_price) VALUES ('test-rls-123', 29.99);
