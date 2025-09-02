-- Migration: Enhance product_images table for variant-specific images
-- This adds support for color-based and size-based image variants

-- Check if table exists before altering
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'product_images'
    ) THEN
        -- Add new columns for variant-specific images
        ALTER TABLE public.product_images 
        ADD COLUMN IF NOT EXISTS color VARCHAR(100),
        ADD COLUMN IF NOT EXISTS size VARCHAR(10),
        ADD COLUMN IF NOT EXISTS variant_type VARCHAR(50) DEFAULT 'product';
        
        RAISE NOTICE 'Enhanced product_images table with variant columns';
    ELSE
        RAISE NOTICE 'product_images table does not exist, skipping enhancement';
    END IF;
END $$;

-- Add comment explaining the new fields (only if table exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'product_images'
    ) THEN
        COMMENT ON COLUMN public.product_images.color IS 'Color variant for this image (e.g., "Black", "Navy", "White")';
        COMMENT ON COLUMN public.product_images.size IS 'Size variant for this image (e.g., "S", "M", "L", "XL")';
        COMMENT ON COLUMN public.product_images.variant_type IS 'Type of variant: "product" (general), "color" (color-specific), "size" (size-specific)';
        RAISE NOTICE 'Added comments to product_images columns';
    END IF;
END $$;

-- Create indexes for performance on variant queries (only if table exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'product_images'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_product_images_color ON public.product_images(color);
        CREATE INDEX IF NOT EXISTS idx_product_images_variant_type ON public.product_images(variant_type);
        CREATE INDEX IF NOT EXISTS idx_product_images_product_color ON public.product_images(product_id, color);
        CREATE INDEX IF NOT EXISTS idx_product_images_product_variant_type ON public.product_images(product_id, variant_type);
        RAISE NOTICE 'Created indexes on product_images table';
    END IF;
END $$;

-- Update existing images and add constraints (only if table exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'product_images'
    ) THEN
        -- Update existing images to have proper variant_type
        UPDATE public.product_images 
        SET variant_type = 'product' 
        WHERE variant_type IS NULL;

        -- Add constraint to ensure variant_type is valid
        ALTER TABLE public.product_images 
        ADD CONSTRAINT check_variant_type 
        CHECK (variant_type IN ('product', 'color', 'size'));

        -- Add constraint to ensure color and size are consistent with variant_type
        ALTER TABLE public.product_images 
        ADD CONSTRAINT check_variant_consistency 
        CHECK (
            (variant_type = 'product' AND color IS NULL AND size IS NULL) OR
            (variant_type = 'color' AND color IS NOT NULL AND size IS NULL) OR
            (variant_type = 'size' AND size IS NOT NULL)
        );
        
        RAISE NOTICE 'Updated product_images constraints';
    END IF;
END $$;

-- Create a view for easy variant image queries (only if both tables exist)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'product_images'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'products'
    ) THEN
        CREATE OR REPLACE VIEW variant_images AS
        SELECT 
            pi.*,
            p.name as product_name,
            p.category as product_category,
            CASE 
                WHEN pi.variant_type = 'product' THEN 'Product Images'
                WHEN pi.variant_type = 'color' THEN CONCAT('Color: ', pi.color)
                WHEN pi.variant_type = 'size' THEN CONCAT('Size: ', pi.size)
            END as variant_description
        FROM public.product_images pi
        JOIN public.products p ON pi.product_id = p.id;

        -- Grant permissions on the new view
        GRANT SELECT ON variant_images TO authenticated;
        GRANT SELECT ON variant_images TO anon;
        
        RAISE NOTICE 'Created variant_images view';
    ELSE
        RAISE NOTICE 'Required tables do not exist, skipping view creation';
    END IF;
END $$;

-- Add RLS policies for the new columns
-- (RLS is already enabled on the table, so we just need to ensure policies work with new columns)

-- Verify the migration (only if table exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'product_images'
    ) THEN
        RAISE NOTICE 'Product images table enhanced successfully';
    ELSE
        RAISE NOTICE 'Product images table does not exist - skipped enhancement';
    END IF;
END $$;
