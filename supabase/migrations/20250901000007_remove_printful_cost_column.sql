-- Fix product_variants table schema to match what the sync function expects
-- Remove the printful_cost column reference as it doesn't exist in the actual schema

-- The actual schema from migration 20250901000001 only includes:
-- id, product_id, printful_variant_id, name, value, color, size, 
-- retail_price, margin, in_stock, is_available, image_url, printful_data, 
-- created_at, updated_at, color_code (added in 005), stock (added in 006)

-- No changes needed to table structure, just documenting the issue
-- The sync function was trying to insert into 'printful_cost' which doesn't exist

-- Add comment to clarify the schema
COMMENT ON TABLE product_variants IS 'Product variants table - does not include printful_cost column, uses margin and retail_price instead';

-- Log completion
DO $$ 
BEGIN 
    RAISE NOTICE '✅ Documented product_variants schema - printful_cost column is not available';
END $$;