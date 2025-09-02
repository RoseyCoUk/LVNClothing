-- Migration: Add feature flag for Printful image usage
-- This allows per-product control over whether to use Printful images as fallback

-- Add feature flag column to products table
ALTER TABLE products 
ADD COLUMN use_printful_images BOOLEAN DEFAULT false;

-- Add comment for clarity
COMMENT ON COLUMN products.use_printful_images IS 'When true, allows Printful images as fallback if no custom images exist. When false, only custom uploaded images are used.';

-- Create index for feature flag queries
CREATE INDEX IF NOT EXISTS idx_products_use_printful_images ON products(use_printful_images);

-- Update existing products to use Printful images by default for backward compatibility
-- This ensures current functionality continues to work
UPDATE products 
SET use_printful_images = true 
WHERE use_printful_images IS NULL;

-- Add constraint to ensure the column is never null
ALTER TABLE products 
ALTER COLUMN use_printful_images SET NOT NULL;