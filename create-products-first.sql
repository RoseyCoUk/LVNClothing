-- Create Products First (if they don't exist)
-- Run this BEFORE the main migration if products are missing

-- 1. Create products if they don't exist
INSERT INTO public.products (name, description, price, category, tags, image_url, slug, rating, reviews)
SELECT 
  'Reform UK T-Shirt',
  'Classic T-shirt with Reform UK logo',
  24.99,
  'apparel',
  ARRAY['bestseller'],
  '/Tshirt/Men/ReformMenTshirtCharcoal1.webp',
  'reform-uk-tshirt',
  4.7,
  10
WHERE NOT EXISTS (
  SELECT 1 FROM public.products WHERE name = 'Reform UK T-Shirt'
);

INSERT INTO public.products (name, description, price, category, tags, image_url, slug, rating, reviews)
SELECT 
  'Reform UK Cap',
  'Adjustable cap with Reform UK logo',
  19.99,
  'apparel',
  ARRAY['bestseller'],
  '/Cap/ReformCapBlue1.webp',
  'reform-uk-cap',
  4.6,
  8
WHERE NOT EXISTS (
  SELECT 1 FROM public.products WHERE name = 'Reform UK Cap'
);

INSERT INTO public.products (name, description, price, category, tags, image_url, slug, rating, reviews)
SELECT 
  'Reform UK Mug',
  'Ceramic mug with Reform UK logo',
  19.99,
  'gear',
  ARRAY['bestseller'],
  '/MugMouse/ReformMug1.webp',
  'reform-uk-mug',
  4.1,
  2
WHERE NOT EXISTS (
  SELECT 1 FROM public.products WHERE name = 'Reform UK Mug'
);

INSERT INTO public.products (name, description, price, category, tags, image_url, slug, rating, reviews)
SELECT 
  'Starter Bundle',
  'Starter bundle with T-shirt, cap, and mug',
  34.99,
  'bundle',
  ARRAY['bundle'],
  '/Tshirt/Men/ReformMenTshirtCharcoal1.webp',
  'starter-bundle',
  5,
  10
WHERE NOT EXISTS (
  SELECT 1 FROM public.products WHERE name = 'Starter Bundle'
);

-- 2. Verify products were created
SELECT 'Products Created:' as status;
SELECT 
  id,
  name,
  category,
  price
FROM public.products 
WHERE name IN ('Reform UK T-Shirt', 'Reform UK Cap', 'Reform UK Mug', 'Starter Bundle')
ORDER BY name;
