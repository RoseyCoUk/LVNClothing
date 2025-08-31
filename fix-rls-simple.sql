-- Simple fix for product_images RLS policies
-- Run this in your Supabase SQL editor

-- Drop all existing policies
DROP POLICY IF EXISTS "product_images_select_policy" ON public.product_images;
DROP POLICY IF EXISTS "product_images_insert_policy" ON public.product_images;
DROP POLICY IF EXISTS "product_images_update_policy" ON public.product_images;
DROP POLICY IF EXISTS "product_images_delete_policy" ON public.product_images;
DROP POLICY IF EXISTS "Allow all on product_images" ON public.product_images;

-- Create simple policy that allows all operations for authenticated users
CREATE POLICY "Allow authenticated users full access" ON public.product_images
    FOR ALL USING (auth.role() = 'authenticated');

-- Verify the policy was created
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'product_images';
