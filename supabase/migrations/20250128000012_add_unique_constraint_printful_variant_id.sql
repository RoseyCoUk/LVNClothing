-- Add unique constraint on printful_variant_id to prevent duplicates
-- This ensures that each Printful variant can only exist once in our database

-- First, check if the constraint already exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'product_variants_printful_variant_id_unique'
    ) THEN
        -- Add unique constraint
        ALTER TABLE product_variants 
        ADD CONSTRAINT product_variants_printful_variant_id_unique 
        UNIQUE (printful_variant_id);
        
        RAISE NOTICE 'Added unique constraint on printful_variant_id';
    ELSE
        RAISE NOTICE 'Unique constraint on printful_variant_id already exists';
    END IF;
END $$;

-- Also add a unique constraint on the combination of product_id, name, and value
-- This provides an additional layer of protection
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'product_variants_product_name_value_unique'
    ) THEN
        -- Add unique constraint on combination
        ALTER TABLE product_variants 
        ADD CONSTRAINT product_variants_product_name_value_unique 
        UNIQUE (product_id, name, value);
        
        RAISE NOTICE 'Added unique constraint on product_id, name, value combination';
    ELSE
        RAISE NOTICE 'Unique constraint on product_id, name, value combination already exists';
    END IF;
END $$;
