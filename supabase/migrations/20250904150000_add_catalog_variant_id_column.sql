-- Add catalog_variant_id column to product_variants table
-- This column will store the Printful catalog variant IDs for shipping quotes
-- Safe migration with rollback capability

-- Add the new column (nullable initially)
ALTER TABLE public.product_variants 
ADD COLUMN IF NOT EXISTS catalog_variant_id INTEGER;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_product_variants_catalog_variant_id 
ON public.product_variants(catalog_variant_id);

-- Add comment to document the column purpose
COMMENT ON COLUMN public.product_variants.catalog_variant_id IS 
'Stores Printful catalog variant ID used for shipping rate calculations. Maps from sync variant ID to catalog variant ID.';

-- Add constraint to ensure positive values when not null
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_positive_catalog_variant_id') THEN
        ALTER TABLE public.product_variants 
        ADD CONSTRAINT check_positive_catalog_variant_id 
        CHECK (catalog_variant_id IS NULL OR catalog_variant_id > 0);
    END IF;
END $$;

-- Log the completion
DO $$ 
BEGIN 
    RAISE NOTICE '✅ Added catalog_variant_id column to product_variants table';
    RAISE NOTICE '📊 Ready for data population step';
END $$;