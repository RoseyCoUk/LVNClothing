-- Migration: Add thumbnail support to product_images table
-- This adds support for thumbnail images separate from primary images

-- Add thumbnail column only if table exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'product_images'
    ) THEN
        -- Add thumbnail column
        ALTER TABLE public.product_images 
        ADD COLUMN IF NOT EXISTS is_thumbnail BOOLEAN DEFAULT false;
        
        RAISE NOTICE 'Added thumbnail support to product_images table';
    ELSE
        RAISE NOTICE 'product_images table does not exist, skipping thumbnail support';
    END IF;
END $$;

-- Add comment and indexes only if table exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'product_images'
    ) THEN
        -- Add comment explaining the new field
        COMMENT ON COLUMN public.product_images.is_thumbnail IS 'Whether this image is the thumbnail for the product (used in product cards/listings)';
        
        -- Create index for thumbnail queries
        CREATE INDEX IF NOT EXISTS idx_product_images_thumbnail ON public.product_images(is_thumbnail);
        CREATE INDEX IF NOT EXISTS idx_product_images_product_thumbnail ON public.product_images(product_id, is_thumbnail);
        
        RAISE NOTICE 'Added comments and indexes for thumbnail support';
    END IF;
END $$;

-- Update existing images and add comments only if table exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'product_images'
    ) THEN
        -- Update existing images to have proper thumbnail status
        -- Set the first primary image as thumbnail if no thumbnail exists
        UPDATE public.product_images 
        SET is_thumbnail = true 
        WHERE id IN (
          SELECT DISTINCT ON (product_id) id
          FROM public.product_images 
          WHERE is_primary = true 
          ORDER BY product_id, image_order
        );
        
        -- Add comment explaining the business rule
        COMMENT ON TABLE public.product_images IS 'Product images with variant support. Business rule: only one thumbnail per product.';
        
        RAISE NOTICE 'Updated existing images with thumbnail status';
    END IF;
END $$;

-- Drop and recreate the variant_images view only if both tables exist
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'product_images'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'products'
    ) THEN
        -- Drop and recreate the variant_images view to include thumbnail information
        DROP VIEW IF EXISTS variant_images;
        
        CREATE VIEW variant_images AS
        SELECT 
            pi.*,
            p.name as product_name,
            p.category as product_category,
            CASE 
                WHEN pi.variant_type = 'product' THEN 'Product Images'
                WHEN pi.variant_type = 'color' THEN CONCAT('Color: ', pi.color)
                WHEN pi.variant_type = 'size' THEN CONCAT('Size: ', pi.size)
            END as variant_description,
            CASE 
                WHEN pi.is_thumbnail THEN 'Thumbnail'
                WHEN pi.is_primary THEN 'Primary'
                ELSE 'Gallery'
            END as image_role
        FROM public.product_images pi
        JOIN public.products p ON pi.product_id = p.id;
        
        -- Grant permissions on the updated view
        GRANT SELECT ON variant_images TO authenticated;
        GRANT SELECT ON variant_images TO anon;
        
        RAISE NOTICE 'Updated variant_images view with thumbnail support';
    END IF;
END $$;

-- Verify the migration only if table exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'product_images'
    ) THEN
        RAISE NOTICE 'Thumbnail support migration completed successfully';
    ELSE
        RAISE NOTICE 'product_images table does not exist - skipped thumbnail support';
    END IF;
END $$;
