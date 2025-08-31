-- Add missing printful_product_id_light column to products table
-- up

-- Add the missing column that the Direct Import function expects
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS printful_product_id_light text;

-- down
-- Remove the added column
ALTER TABLE public.products 
DROP COLUMN IF EXISTS printful_product_id_light;
