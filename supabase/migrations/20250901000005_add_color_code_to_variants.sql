-- Add color_code column to product_variants table
-- This is needed for the Printful sync function

ALTER TABLE product_variants 
ADD COLUMN IF NOT EXISTS color_code TEXT;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_product_variants_color_code 
ON product_variants(color_code);

-- Also fix product_images table to have alt_text column if missing
ALTER TABLE product_images 
ADD COLUMN IF NOT EXISTS alt_text TEXT;

-- Update the products table to ensure it has all necessary columns
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add comment
COMMENT ON COLUMN product_variants.color_code IS 'Hex color code for the variant (e.g., #000000)';

-- Log completion
DO $$ 
BEGIN 
    RAISE NOTICE '✅ Added color_code column to product_variants table';
    RAISE NOTICE '✅ Added alt_text column to product_images table if missing';
    RAISE NOTICE '✅ Added is_active column to products table if missing';
END $$;