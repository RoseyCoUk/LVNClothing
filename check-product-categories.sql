-- Check what product categories exist in your database
SELECT 
    category,
    COUNT(*) as product_count,
    STRING_AGG(name, ', ') as product_names
FROM public.products 
GROUP BY category 
ORDER BY category;
