-- Fix missing printful_product_id_light column
-- This column is needed for the Availability Sync function to work

-- Add the missing column
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS printful_product_id_light text;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name = 'printful_product_id_light';
