-- Verify that the products table now has all required columns
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Count total columns
SELECT COUNT(*) as total_columns 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND table_schema = 'public';

-- Check if we can insert a test product
INSERT INTO products (
    name, 
    description, 
    price, 
    category, 
    printful_product_id
) VALUES (
    'Test Product After Fix',
    'This is a test product to verify the table structure is fixed',
    19.99,
    'test',
    'test-123'
) RETURNING id, name, price;
