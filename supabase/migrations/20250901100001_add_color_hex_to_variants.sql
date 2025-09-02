-- Add color_hex column to product_variants table for storing hex color codes from Printful

ALTER TABLE product_variants 
ADD COLUMN IF NOT EXISTS color_hex TEXT DEFAULT '#000000';

-- Add comment to document the column
COMMENT ON COLUMN product_variants.color_hex IS 'Hex color code from Printful API for the variant color';