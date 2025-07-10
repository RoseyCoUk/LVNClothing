-- Fix bundle products by adding stripe_product_id field and using proper UUIDs
-- This migration corrects the previous bundle products migration

-- up

-- First, add stripe_product_id column to products table if it doesn't exist
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stripe_product_id TEXT;

-- Create an index on stripe_product_id for better performance
CREATE INDEX IF NOT EXISTS idx_products_stripe_product_id ON public.products(stripe_product_id);

-- Remove the problematic bundle products that were inserted with wrong ID format
DELETE FROM public.products WHERE id IN (
  'prod_ScXwG3hpBhqNZW',
  'prod_ScXvVATO8FKCvG', 
  'prod_ScXuloowrz4FVk'
);

-- Insert bundle products with proper UUIDs and stripe_product_id field
INSERT INTO products (id, name, description, price_pence, category, tags, image_url, slug, rating, reviews, stripe_product_id, created_at, updated_at) VALUES
(
  gen_random_uuid(),
  'Starter Bundle',
  'Perfect for newcomers to the Reform UK movement. This starter bundle includes our signature T-shirt and a practical tote bag, giving you everything you need to show your support and carry your essentials in style.',
  3499,
  'bundles',
  ARRAY['bundle', 'starter', 'tshirt', 'totebag'],
  'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=600',
  'starter-bundle',
  4.8,
  127,
  'prod_ScXwG3hpBhqNZW',
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Champion Bundle',
  'For dedicated supporters of Reform UK. This comprehensive bundle includes a premium hoodie, cap, tote bag, and water bottle - everything you need to show your commitment to the movement in style and comfort.',
  9999,
  'bundles',
  ARRAY['bundle', 'champion', 'hoodie', 'cap', 'totebag', 'waterbottle'],
  'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=600',
  'champion-bundle',
  4.9,
  89,
  'prod_ScXvVATO8FKCvG',
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Activist Bundle',
  'The ultimate bundle for dedicated Reform UK activists. This comprehensive collection includes everything you need to show your commitment to the movement - from clothing and accessories to practical items for daily use.',
  16999,
  'bundles',
  ARRAY['bundle', 'activist', 'hoodie', 'tshirt', 'cap', 'totebag', 'waterbottle', 'mug', 'stickers', 'mousepad', 'badges'],
  'https://images.pexels.com/photos/1124465/pexels-photo-1124465.jpeg?auto=compress&cs=tinysrgb&w=600',
  'activist-bundle',
  4.9,
  156,
  'prod_ScXuloowrz4FVk',
  NOW(),
  NOW()
);

-- down

-- Remove the stripe_product_id column
ALTER TABLE public.products DROP COLUMN IF EXISTS stripe_product_id;

-- Remove the index
DROP INDEX IF EXISTS public.idx_products_stripe_product_id;

-- Remove the bundle products
DELETE FROM public.products WHERE stripe_product_id IN (
  'prod_ScXwG3hpBhqNZW',
  'prod_ScXvVATO8FKCvG', 
  'prod_ScXuloowrz4FVk'
); 