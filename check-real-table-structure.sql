-- Check the REAL structure of the products table
-- The Edge Function shows "Products table columns: []" which means the table has no columns!

-- Check if products table actually exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'products'
) as table_exists;

-- Check what columns actually exist in products table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if the table is completely empty (no columns)
SELECT COUNT(*) as column_count 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND table_schema = 'public';

-- Check if there are any rows in the table
SELECT COUNT(*) as row_count FROM products;

-- Check table constraints
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'products'
AND tc.table_schema = 'public';

-- Check table size and other metadata
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats 
WHERE tablename = 'products';
