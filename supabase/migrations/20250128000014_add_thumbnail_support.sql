-- Migration: Add thumbnail support to product_images table
-- This adds support for thumbnail images separate from primary images

-- Add thumbnail column
ALTER TABLE public.product_images 
ADD COLUMN IF NOT EXISTS is_thumbnail BOOLEAN DEFAULT false;

-- Add comment explaining the new field
COMMENT ON COLUMN public.product_images.is_thumbnail IS 'Whether this image is the thumbnail for the product (used in product cards/listings)';

-- Create index for thumbnail queries
CREATE INDEX IF NOT EXISTS idx_product_images_thumbnail ON public.product_images(is_thumbnail);
CREATE INDEX IF NOT EXISTS idx_product_images_product_thumbnail ON public.product_images(product_id, is_thumbnail);

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

-- Note: PostgreSQL doesn't allow subqueries in check constraints
-- We'll enforce this at the application level instead
-- The constraint would be: only one thumbnail per product

-- Add comment explaining the business rule
COMMENT ON TABLE public.product_images IS 'Product images with variant support. Business rule: only one thumbnail per product.';

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

-- Verify the migration
SELECT 
    'Migration completed successfully' as status,
    COUNT(*) as total_images,
    COUNT(CASE WHEN is_thumbnail = true THEN 1 END) as thumbnail_images,
    COUNT(CASE WHEN is_primary = true THEN 1 END) as primary_images,
    COUNT(CASE WHEN is_thumbnail = false AND is_primary = false THEN 1 END) as gallery_images
FROM public.product_images;

-- Check for business rule violations (should show 0)
SELECT 
    'Business Rule Check' as check_type,
    COUNT(*) as products_with_multiple_thumbnails,
    'Should be 0' as expected
FROM (
    SELECT product_id, COUNT(*) as thumbnail_count
    FROM public.product_images 
    WHERE is_thumbnail = true 
    GROUP BY product_id 
    HAVING COUNT(*) > 1
) violations;
