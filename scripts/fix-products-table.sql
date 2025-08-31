-- Fix Products Table Structure
-- This script adds the missing printful_product_id column to the products table

-- 1. Check if the column already exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'printful_product_id'
  ) THEN
    -- Add the missing column
    ALTER TABLE public.products ADD COLUMN printful_product_id text;
    
    -- Add a unique constraint
    ALTER TABLE public.products ADD CONSTRAINT unique_printful_product_id UNIQUE (printful_product_id);
    
    -- Create an index for performance
    CREATE INDEX IF NOT EXISTS idx_products_printful_id ON public.products(printful_product_id);
    
    RAISE NOTICE 'Added printful_product_id column to products table';
  ELSE
    RAISE NOTICE 'printful_product_id column already exists in products table';
  END IF;
END $$;

-- 2. Verify the column was added
SELECT 
  'Products table structure after fix:' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'products'
ORDER BY ordinal_position;

-- 3. Check if the unique constraint was added
SELECT 
  'Unique constraints on products table:' as info,
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.products'::regclass 
AND contype = 'u';

-- 4. Check if the index was created
SELECT 
  'Indexes on products table:' as info,
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'products' 
AND schemaname = 'public';

