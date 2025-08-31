-- Migration: Enhance product_images table for variant-specific images
-- This adds support for color-based and size-based image variants

-- Add new columns for variant-specific images
ALTER TABLE public.product_images 
ADD COLUMN IF NOT EXISTS color VARCHAR(100),
ADD COLUMN IF NOT EXISTS size VARCHAR(10),
ADD COLUMN IF NOT EXISTS variant_type VARCHAR(50) DEFAULT 'product';

-- Add comment explaining the new fields
COMMENT ON COLUMN public.product_images.color IS 'Color variant for this image (e.g., "Black", "Navy", "White")';
COMMENT ON COLUMN public.product_images.size IS 'Size variant for this image (e.g., "S", "M", "L", "XL")';
COMMENT ON COLUMN public.product_images.variant_type IS 'Type of variant: "product" (general), "color" (color-specific), "size" (size-specific)';

-- Create indexes for performance on variant queries
CREATE INDEX IF NOT EXISTS idx_product_images_color ON public.product_images(color);
CREATE INDEX IF NOT EXISTS idx_product_images_variant_type ON public.product_images(variant_type);
CREATE INDEX IF NOT EXISTS idx_product_images_product_color ON public.product_images(product_id, color);
CREATE INDEX IF NOT EXISTS idx_product_images_product_variant_type ON public.product_images(product_id, variant_type);

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

-- Create a view for easy variant image queries
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

-- Add RLS policies for the new columns
-- (RLS is already enabled on the table, so we just need to ensure policies work with new columns)

-- Verify the migration
SELECT 
    'Migration completed successfully' as status,
    COUNT(*) as total_images,
    COUNT(CASE WHEN variant_type = 'product' THEN 1 END) as product_images,
    COUNT(CASE WHEN variant_type = 'color' THEN 1 END) as color_images,
    COUNT(CASE WHEN variant_type = 'size' THEN 1 END) as size_images
FROM public.product_images;
