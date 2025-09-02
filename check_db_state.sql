-- Check current database state
SELECT 'Product Count:' as check_type, COUNT(*)::text as count FROM products
UNION ALL
SELECT 'Variant Count:', COUNT(*)::text FROM product_variants
UNION ALL
SELECT 'Image Count:', COUNT(*)::text FROM product_images;

-- Show all products
SELECT 'Products:' as section, '' as data1, '' as data2, '' as data3
UNION ALL
SELECT id::text, name, slug, COALESCE(printful_product_id::text, 'NULL') FROM products ORDER BY id;

-- Show all variants (first 20)
SELECT 'Variants:' as section, '' as data1, '' as data2, '' as data3
UNION ALL
SELECT id::text, product_id::text, color, size FROM product_variants ORDER BY id LIMIT 20;