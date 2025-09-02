-- Migration: Ensure thumbnail support is properly added to product_images table
-- This ensures the is_thumbnail column exists for the image API fix

-- Add thumbnail column if it doesn't exist
ALTER TABLE product_images 
ADD COLUMN IF NOT EXISTS is_thumbnail BOOLEAN DEFAULT false;

-- Add comment explaining the new field
COMMENT ON COLUMN product_images.is_thumbnail IS 'Whether this image is the thumbnail for the product (used in product cards/listings)';

-- Create index for thumbnail queries if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_product_images_thumbnail ON product_images(is_thumbnail);
CREATE INDEX IF NOT EXISTS idx_product_images_product_thumbnail ON product_images(product_id, is_thumbnail);

-- Add constraint to ensure only one thumbnail per product
-- First, remove any existing constraint if it exists
ALTER TABLE product_images DROP CONSTRAINT IF EXISTS unique_thumbnail_per_product;

-- Add the unique constraint for thumbnails per product
CREATE UNIQUE INDEX IF NOT EXISTS unique_thumbnail_per_product 
ON product_images (product_id) 
WHERE is_thumbnail = true;