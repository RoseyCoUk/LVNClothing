-- Check Current Database Structure
-- This script will help us understand what tables and columns actually exist

-- 1. Check what tables exist
SELECT 
  'Tables' as info_type,
  table_name,
  'exists' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'products', 'product_overrides', 'product_images', 
  'bundles', 'bundle_items', 'sync_status', 
  'inventory_changes', 'sync_errors', 'data_conflicts',
  'webhook_logs', 'notifications'
)
ORDER BY table_name;

-- 2. Check products table structure (if it exists)
SELECT 
  'Products Table Columns' as info_type,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'products'
ORDER BY ordinal_position;

-- 3. Check if products table has printful_product_id column
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'products' 
      AND column_name = 'printful_product_id'
    ) THEN 'printful_product_id column EXISTS'
    ELSE 'printful_product_id column DOES NOT EXIST'
  END as column_status;

-- 4. Check what columns the products table actually has
SELECT 
  'Available columns in products table:' as info,
  string_agg(column_name, ', ' ORDER BY ordinal_position) as columns
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'products';

-- 5. Check if we need to add the missing column
SELECT 
  CASE 
    WHEN NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'products' 
      AND column_name = 'printful_product_id'
    ) THEN 'Need to add printful_product_id column'
    ELSE 'printful_product_id column already exists'
  END as action_needed;

-- 6. Show sample data from products table (if any exists)
SELECT 
  'Sample products data' as info_type,
  COUNT(*) as record_count
FROM products;

-- 7. Check if there are any existing products with different structure
SELECT 
  'Existing products structure' as info_type,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'products'
ORDER BY ordinal_position;

