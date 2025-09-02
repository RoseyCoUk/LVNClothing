-- Migration: Add source tracking to product_images table
-- This allows us to distinguish between custom uploaded images and Printful synced images

-- Add source column to product_images table
ALTER TABLE product_images 
ADD COLUMN source TEXT DEFAULT 'custom';

-- Add comment for clarity
COMMENT ON COLUMN product_images.source IS 'Source of the image: "custom" for user uploads, "printful" for Printful API synced images';

-- Create index for source queries
CREATE INDEX IF NOT EXISTS idx_product_images_source ON product_images(source);

-- Create composite index for source and thumbnail queries (important for performance)
-- Only create if is_thumbnail column exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'product_images' 
        AND column_name = 'is_thumbnail'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_product_images_source_thumbnail ON product_images(product_id, source, is_thumbnail);
    ELSE
        -- Create index without is_thumbnail if column doesn't exist
        CREATE INDEX IF NOT EXISTS idx_product_images_source_product ON product_images(product_id, source);
    END IF;
END $$;

-- Update existing Printful images based on URL patterns
UPDATE product_images 
SET source = 'printful' 
WHERE image_url LIKE '%printful%' 
   OR image_url LIKE '%printfulcdn%'
   OR image_url LIKE '%files.printful.com%'
   OR image_url LIKE '%cdn.printful.com%';

-- Add constraint to ensure valid source values
ALTER TABLE product_images 
ADD CONSTRAINT check_image_source 
CHECK (source IN ('custom', 'printful'));

-- Add constraint to ensure source is never null
ALTER TABLE product_images 
ALTER COLUMN source SET NOT NULL;