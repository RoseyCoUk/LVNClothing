-- Check Products Table Structure and Primary Key
-- This will show us exactly what we're working with

-- 1. Show all columns in products table
SELECT 
  'Products Table Structure:' as info,
  column_name,
  data_type,
  is_nullable,
  column_default,
  ordinal_position
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'products'
ORDER BY ordinal_position;

-- 2. Check primary key constraints
SELECT 
  'Primary Key Info:' as info,
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  tc.constraint_type
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public' 
AND tc.table_name = 'products'
AND tc.constraint_type = 'PRIMARY KEY';

-- 3. Check if id column exists and its properties
SELECT 
  'ID Column Check:' as info,
  column_name,
  data_type,
  is_nullable,
  column_default,
  CASE 
    WHEN column_name = 'id' THEN 'EXISTS'
    ELSE 'NOT FOUND'
  END as status
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'products'
AND column_name = 'id';

-- 4. Show sample data to verify structure
SELECT 
  'Sample Data Structure:' as info,
  *
FROM public.products 
LIMIT 1;

-- 5. Check table owner and permissions
SELECT 
  'Table Info:' as info,
  table_name,
  table_type,
  table_schema,
  table_catalog
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'products';
