-- Add stock column to product_variants table
-- This is needed for the Printful sync function

ALTER TABLE product_variants 
ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_product_variants_stock_level 
ON product_variants(stock);

-- Add comment
COMMENT ON COLUMN product_variants.stock IS 'Current stock level for the variant';

-- Log completion
DO $$ 
BEGIN 
    RAISE NOTICE '✅ Added stock column to product_variants table';
END $$;