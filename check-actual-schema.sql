-- Check the actual columns in product_variants table
SELECT 
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'product_variants' 
  AND table_schema = 'public'
ORDER BY ordinal_position;