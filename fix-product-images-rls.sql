-- Fix RLS policies for product_images table
-- This ensures authenticated users can manage product images

-- First, let's check current policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'product_images';

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "product_images_select_policy" ON public.product_images;
DROP POLICY IF EXISTS "product_images_insert_policy" ON public.product_images;
DROP POLICY IF EXISTS "product_images_update_policy" ON public.product_images;
DROP POLICY IF EXISTS "product_images_delete_policy" ON public.product_images;
DROP POLICY IF EXISTS "Allow all on product_images" ON public.product_images;

-- Create new comprehensive policies
-- Policy 1: Allow authenticated users to view all product images
CREATE POLICY "product_images_select_policy" ON public.product_images
    FOR SELECT USING (true);

-- Policy 2: Allow authenticated users to insert product images
CREATE POLICY "product_images_insert_policy" ON public.product_images
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy 3: Allow authenticated users to update product images
CREATE POLICY "product_images_update_policy" ON public.product_images
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy 4: Allow authenticated users to delete product images
CREATE POLICY "product_images_delete_policy" ON public.product_images
    FOR DELETE USING (auth.role() = 'authenticated');

-- Verify the policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'product_images';

-- Test insert permission (this should work now)
-- Note: This is just a test - you can remove it after confirming it works
INSERT INTO public.product_images (
    product_id, 
    image_url, 
    image_order, 
    is_primary, 
    variant_type, 
    color, 
    size
) VALUES (
    (SELECT id FROM public.products LIMIT 1), -- Use first available product
    'https://example.com/test-image.jpg',
    0,
    true,
    'product',
    NULL,
    NULL
) ON CONFLICT DO NOTHING;

-- Clean up test data
DELETE FROM public.product_images WHERE image_url = 'https://example.com/test-image.jpg';

-- Final verification
SELECT 
    'RLS policies fixed successfully' as status,
    COUNT(*) as total_policies
FROM pg_policies 
WHERE tablename = 'product_images';
