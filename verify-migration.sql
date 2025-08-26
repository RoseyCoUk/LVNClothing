-- Verification Script for Printful Integration Migration
-- Run this after applying the main migration to verify success

-- 1. Check if Printful fields were added to products table
SELECT 'Checking products table...' as step;
SELECT 
  name,
  CASE 
    WHEN printful_product_id IS NOT NULL THEN '✅ Has Printful ID'
    ELSE '❌ Missing Printful ID'
  END as status,
  printful_product_id
FROM public.products 
WHERE name IN ('Reform UK T-Shirt', 'Reform UK Cap', 'Reform UK Mug', 'Starter Bundle')
ORDER BY name;

-- 2. Check if Printful fields were added to product_variants table
SELECT 'Checking product_variants table...' as step;
SELECT 
  p.name as product_name,
  pv.name as variant_name,
  CASE 
    WHEN pv.printful_variant_id IS NOT NULL THEN '✅ Has Printful Variant ID'
    ELSE '❌ Missing Printful Variant ID'
  END as status,
  pv.printful_variant_id,
  pv.color,
  pv.size
FROM public.product_variants pv
JOIN public.products p ON p.id = pv.product_id
WHERE p.name IN ('Reform UK T-Shirt', 'Reform UK Cap', 'Reform UK Mug')
ORDER BY p.name, pv.name;

-- 3. Check if bundle_variants table was created
SELECT 'Checking bundle_variants table...' as step;
SELECT 
  b.name as bundle_name,
  p.name as component_product,
  pv.name as variant_name,
  pv.printful_variant_id,
  bv.quantity
FROM public.bundle_variants bv
JOIN public.products b ON b.id = bv.bundle_id
JOIN public.product_variants pv ON pv.id = bv.product_variant_id
JOIN public.products p ON p.id = pv.product_id
WHERE b.name = 'Starter Bundle'
ORDER BY p.name;

-- 4. Summary of what should exist
SELECT 'Migration Summary:' as summary;
SELECT 
  'Products with Printful IDs' as item,
  COUNT(*) as count
FROM public.products 
WHERE printful_product_id IS NOT NULL
UNION ALL
SELECT 
  'Product Variants with Printful IDs' as item,
  COUNT(*) as count
FROM public.product_variants 
WHERE printful_variant_id IS NOT NULL
UNION ALL
SELECT 
  'Bundle Variant Relationships' as item,
  COUNT(*) as count
FROM public.bundle_variants;

-- 5. Expected Printful IDs for Starter Bundle
SELECT 'Expected Starter Bundle Composition:' as expected;
SELECT 
  'T-Shirt (Black M)' as component,
  4017 as printful_variant_id,
  'Black' as color,
  'M' as size
UNION ALL
SELECT 
  'Cap (Black)' as component,
  6001 as printful_variant_id,
  'Black' as color,
  'One Size' as size
UNION ALL
SELECT 
  'Mug (White)' as component,
  7001 as printful_variant_id,
  'White' as color,
  'One Size' as size;
