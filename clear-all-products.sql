-- Clear all existing products and variants for clean slate import
-- This will remove all data and reset the tables

-- First, clear product_variants (due to foreign key constraints)
DELETE FROM product_variants;

-- Then clear products
DELETE FROM products;

-- Verify tables are empty
SELECT 
    'products' as table_name,
    COUNT(*) as row_count
FROM products
UNION ALL
SELECT 
    'product_variants' as table_name,
    COUNT(*) as row_count
FROM product_variants;

-- Reset auto-increment sequences if they exist
-- (PostgreSQL uses UUIDs, so this isn't necessary, but good practice)
