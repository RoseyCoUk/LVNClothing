-- Check what actually exists in your products table
-- Run this first to see exactly what we're working with

SELECT 
  'Products Table Columns:' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'products'
ORDER BY ordinal_position;
