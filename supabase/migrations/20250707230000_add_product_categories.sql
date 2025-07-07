-- Add categories to products and update existing products with appropriate categories
-- This migration adds categories to products for better organization

-- up

-- Add category column if it doesn't exist
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category text;

-- Update existing products with appropriate categories based on their names
UPDATE public.products 
SET category = 'apparel' 
WHERE name LIKE '%T-Shirt%' OR name LIKE '%Hoodie%' OR name LIKE '%Cap%';

UPDATE public.products 
SET category = 'gear' 
WHERE name LIKE '%Badge%' OR name LIKE '%Sticker%' OR name LIKE '%Mug%' OR name LIKE '%Mouse Pad%' OR name LIKE '%Tote Bag%' OR name LIKE '%Water Bottle%';

UPDATE public.products 
SET category = 'bundle' 
WHERE name LIKE '%Bundle%';

-- Set any remaining products to 'gear' as default
UPDATE public.products 
SET category = 'gear' 
WHERE category IS NULL;

-- Add some tags to products for better filtering
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- Add tags to products based on their characteristics
UPDATE public.products 
SET tags = ARRAY['bestseller'] 
WHERE name LIKE '%T-Shirt%' OR name LIKE '%Hoodie%';

UPDATE public.products 
SET tags = ARRAY['new'] 
WHERE name LIKE '%Bundle%';

UPDATE public.products 
SET tags = ARRAY['limited'] 
WHERE name LIKE '%Badge%' AND variant LIKE '%50%';

-- Add reviews and rating columns with default values
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS reviews integer DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS rating numeric(3,2) DEFAULT 4.5;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_tags ON public.products USING GIN (tags);

-- down

-- Remove indexes
DROP INDEX IF EXISTS public.idx_products_category;
DROP INDEX IF EXISTS public.idx_products_tags;

-- Remove columns (be careful with this in production)
-- ALTER TABLE public.products DROP COLUMN IF EXISTS category;
-- ALTER TABLE public.products DROP COLUMN IF EXISTS tags;
-- ALTER TABLE public.products DROP COLUMN IF EXISTS reviews;
-- ALTER TABLE public.products DROP COLUMN IF EXISTS rating; 