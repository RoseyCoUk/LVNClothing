-- Check the actual structure of the products and product_variants tables
-- Run this in your Supabase SQL editor

-- Check products table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if products table has any data
SELECT COUNT(*) as product_count FROM products;

-- Check product_variants table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'product_variants' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if product_variants table has any data
SELECT COUNT(*) as variant_count FROM product_variants;

-- Check table constraints
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name IN ('products', 'product_variants')
AND tc.table_schema = 'public';

-- Try to insert a test product to see what happens (FIXED: includes required price field)
INSERT INTO products (name, description, category, price, is_available) 
VALUES ('Test Product', 'Test Description', 'Test', 19.99, true)
RETURNING *;

-- Check if the test product was inserted
SELECT * FROM products WHERE name = 'Test Product';

-- Try to insert a test variant
INSERT INTO product_variants (product_id, name, value, is_available)
SELECT id, 'Test Variant', 'Test Value', true
FROM products 
WHERE name = 'Test Product'
RETURNING *;

-- Check if the test variant was inserted
SELECT pv.*, p.name as product_name 
FROM product_variants pv
JOIN products p ON pv.product_id = p.id
WHERE p.name = 'Test Product';

-- Clean up test data
DELETE FROM product_variants WHERE name = 'Test Variant';
DELETE FROM products WHERE name = 'Test Product';
