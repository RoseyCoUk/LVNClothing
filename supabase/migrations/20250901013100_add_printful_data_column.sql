-- Add printful_data column to product_variants table
-- This column will store the full Printful variant data as JSONB

ALTER TABLE public.product_variants 
ADD COLUMN IF NOT EXISTS printful_data jsonb;

-- Add index for better query performance on Printful data
CREATE INDEX IF NOT EXISTS idx_product_variants_printful_data 
ON public.product_variants USING gin(printful_data);

-- Add comment to document the column purpose
COMMENT ON COLUMN public.product_variants.printful_data IS 
'Stores complete Printful API variant data as JSONB for reference and debugging';