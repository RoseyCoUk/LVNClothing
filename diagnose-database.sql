-- Database Diagnostic Script
-- Run this first to see what actually exists in your database

-- 1. Check what products exist
SELECT 'Current Products in Database:' as section;
SELECT 
  id,
  name,
  category,
  price,
  created_at
FROM public.products 
ORDER BY name;

-- 2. Check if product_variants table exists and has data
SELECT 'Product Variants Table Status:' as section;
SELECT 
  COUNT(*) as total_variants,
  COUNT(DISTINCT product_id) as products_with_variants
FROM public.product_variants;

-- 3. Check if Printful fields exist
SELECT 'Printful Fields Status:' as section;
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'products' 
  AND column_name LIKE '%printful%'
ORDER BY column_name;

-- 4. Check if bundle_variants table exists
SELECT 'Bundle Variants Table Status:' as section;
SELECT 
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'bundle_variants'
  ) as table_exists;

-- 5. Show sample product data
SELECT 'Sample Product Data:' as section;
SELECT 
  p.id,
  p.name,
  p.category,
  p.price,
  p.created_at,
  CASE 
    WHEN p.printful_product_id IS NOT NULL THEN p.printful_product_id::text
    ELSE 'NULL'
  END as printful_id
FROM public.products p
LIMIT 5;
