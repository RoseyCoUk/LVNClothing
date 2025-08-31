-- Check Thumbnail Status in Database
-- This script helps verify that thumbnail images are properly set up

-- 1. Check the current structure of product_images table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'product_images' 
ORDER BY ordinal_position;

-- 2. Check if any products have thumbnail images set
SELECT 
    p.id,
    p.name,
    p.category,
    COUNT(pi.id) as total_images,
    COUNT(CASE WHEN pi.is_primary = true THEN 1 END) as primary_images,
    COUNT(CASE WHEN pi.is_thumbnail = true THEN 1 END) as thumbnail_images,
    MAX(CASE WHEN pi.is_thumbnail = true THEN pi.image_url END) as thumbnail_url,
    MAX(CASE WHEN pi.is_primary = true THEN pi.image_url END) as primary_url
FROM products p
LEFT JOIN product_images pi ON p.id = pi.product_id
GROUP BY p.id, p.name, p.category
ORDER BY p.name;

-- 3. Check products that have thumbnails but no primary images
SELECT 
    p.id,
    p.name,
    p.category,
    pi.image_url as thumbnail_url
FROM products p
JOIN product_images pi ON p.id = pi.product_id
WHERE pi.is_thumbnail = true 
AND NOT EXISTS (
    SELECT 1 FROM product_images pi2 
    WHERE pi2.product_id = p.id AND pi2.is_primary = true
);

-- 4. Check products that have primary images but no thumbnails
SELECT 
    p.id,
    p.name,
    p.category,
    pi.image_url as primary_url
FROM products p
JOIN product_images pi ON p.id = pi.product_id
WHERE pi.is_primary = true 
AND NOT EXISTS (
    SELECT 1 FROM product_images pi2 
    WHERE pi2.product_id = p.id AND pi2.is_thumbnail = true
);

-- 5. Check products with multiple thumbnails (should be 0)
SELECT 
    p.id,
    p.name,
    p.category,
    COUNT(CASE WHEN pi.is_thumbnail = true THEN 1 END) as thumbnail_count
FROM products p
JOIN product_images pi ON p.id = pi.product_id
WHERE pi.is_thumbnail = true
GROUP BY p.id, p.name, p.category
HAVING COUNT(CASE WHEN pi.is_thumbnail = true THEN 1 END) > 1;

-- 6. Sample of product images with their status
SELECT 
    p.name as product_name,
    p.category,
    pi.image_url,
    pi.image_order,
    pi.is_primary,
    pi.is_thumbnail,
    pi.created_at
FROM products p
JOIN product_images pi ON p.id = pi.product_id
ORDER BY p.name, pi.image_order
LIMIT 20;

-- 7. Check if the variant_images view is working correctly
SELECT * FROM variant_images LIMIT 10;
