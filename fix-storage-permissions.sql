-- Fix Storage Bucket Permissions for product-images
-- This script ensures that uploaded images are publicly accessible

-- 1. Check current storage bucket policies
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
WHERE tablename = 'objects' 
AND schemaname = 'storage';

-- 2. Check if the product-images bucket exists and its settings
-- Note: This would be done in Supabase dashboard, not SQL

-- 3. Create storage policies for the product-images bucket
-- These policies should be created in the Supabase dashboard under Storage > product-images > Policies

-- Policy 1: Allow public read access to all images
-- Name: "Public read access"
-- Target roles: public
-- Policy definition: true (allow all reads)

-- Policy 2: Allow authenticated users to upload images
-- Name: "Authenticated users can upload"
-- Target roles: authenticated
-- Policy definition: true (allow all uploads)

-- Policy 3: Allow authenticated users to update their uploaded images
-- Name: "Authenticated users can update"
-- Target roles: authenticated
-- Policy definition: true (allow all updates)

-- Policy 4: Allow authenticated users to delete their uploaded images
-- Name: "Authenticated users can delete"
-- Target roles: authenticated
-- Policy definition: true (allow all deletes)

-- 4. Check current product_images table for any broken URLs
SELECT 
    id,
    product_id,
    image_url,
    CASE 
        WHEN image_url LIKE '%product-images%' THEN 'Valid bucket'
        ELSE 'Invalid bucket'
    END as bucket_check,
    CASE 
        WHEN image_url LIKE '%supabase.co%' THEN 'Valid domain'
        ELSE 'Invalid domain'
    END as domain_check
FROM product_images 
LIMIT 10;

-- 5. Check if there are any images with invalid URLs
SELECT 
    COUNT(*) as total_images,
    COUNT(CASE WHEN image_url LIKE '%product-images%' THEN 1 END) as valid_bucket_images,
    COUNT(CASE WHEN image_url LIKE '%supabase.co%' THEN 1 END) as valid_domain_images,
    COUNT(CASE WHEN image_url NOT LIKE '%product-images%' OR image_url NOT LIKE '%supabase.co%' THEN 1 END) as invalid_urls
FROM product_images;

-- 6. Show sample of recent image uploads
SELECT 
    id,
    product_id,
    image_url,
    created_at,
    SUBSTRING(image_url, 1, 100) as url_preview
FROM product_images 
ORDER BY created_at DESC 
LIMIT 5;

-- 7. Check storage.objects table for uploaded files
-- Note: This table is managed by Supabase, not directly accessible via SQL
-- Check in Supabase dashboard: Storage > product-images > Files

-- 8. Create a function to validate image URLs
CREATE OR REPLACE FUNCTION validate_image_urls()
RETURNS TABLE(
    image_id TEXT,
    product_id TEXT,
    image_url TEXT,
    is_valid BOOLEAN,
    error_message TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pi.id::TEXT,
        pi.product_id::TEXT,
        pi.image_url,
        CASE 
            WHEN pi.image_url LIKE '%product-images%' 
                 AND pi.image_url LIKE '%supabase.co%' 
                 AND (pi.image_url LIKE '%.jpg%' OR pi.image_url LIKE '%.png%' OR pi.image_url LIKE '%.webp%')
            THEN true
            ELSE false
        END as is_valid,
        CASE 
            WHEN pi.image_url NOT LIKE '%product-images%' THEN 'Wrong bucket'
            WHEN pi.image_url NOT LIKE '%supabase.co%' THEN 'Wrong domain'
            WHEN pi.image_url NOT LIKE '%.jpg%' AND pi.image_url NOT LIKE '%.png%' AND pi.image_url NOT LIKE '%.webp%' THEN 'Invalid file extension'
            ELSE 'Valid URL'
        END as error_message
    FROM product_images pi;
END;
$$ LANGUAGE plpgsql;

-- 9. Test the validation function
SELECT * FROM validate_image_urls() WHERE NOT is_valid;

-- 10. Summary of current state
SELECT 
    'Storage Permissions Summary' as info,
    (SELECT COUNT(*) FROM product_images) as total_images,
    (SELECT COUNT(*) FROM product_images WHERE image_url LIKE '%product-images%') as valid_bucket_images,
    (SELECT COUNT(*) FROM product_images WHERE image_url LIKE '%supabase.co%') as valid_domain_images,
    (SELECT COUNT(*) FROM validate_image_urls() WHERE is_valid) as valid_urls,
    (SELECT COUNT(*) FROM validate_image_urls() WHERE NOT is_valid) as invalid_urls;
