-- Clean up test data that was already inserted
DELETE FROM product_variants WHERE name = 'Test Variant';
DELETE FROM products WHERE name = 'Test Product';

-- Verify cleanup
SELECT COUNT(*) as remaining_products FROM products WHERE name = 'Test Product';
SELECT COUNT(*) as remaining_variants FROM product_variants WHERE name = 'Test Variant';

-- Check current state of tables
SELECT 'Products table count:' as info, COUNT(*) as count FROM products
UNION ALL
SELECT 'Product variants table count:' as info, COUNT(*) as count FROM product_variants;

-- Clean up the test product we created
DELETE FROM products WHERE name = 'Test Product After Fix';

-- Verify it's gone
SELECT COUNT(*) as remaining_products FROM products;
