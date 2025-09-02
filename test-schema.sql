-- Check products table schema
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
  AND table_schema = 'public' 
ORDER BY ordinal_position;

-- Check product_images table schema
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'product_images' 
  AND table_schema = 'public' 
ORDER BY ordinal_position;