-- Update product prices to match new pricing structure
-- up

-- Update individual product prices
UPDATE public.products 
SET 
  price = 39.99,
  updated_at = now()
WHERE name = 'Reform UK Hoodie' AND price != 39.99;

UPDATE public.products 
SET 
  price = 24.99,
  updated_at = now()
WHERE name = 'Reform UK T-Shirt';

UPDATE public.products 
SET 
  price = 19.99,
  updated_at = now()
WHERE name = 'Reform UK Cap';

UPDATE public.products 
SET 
  price = 24.99,
  updated_at = now()
WHERE name = 'Reform UK Tote Bag';

UPDATE public.products 
SET 
  price = 24.99,
  updated_at = now()
WHERE name = 'Reform UK Water Bottle';

UPDATE public.products 
SET 
  price = 14.99,
  updated_at = now()
WHERE name = 'Reform UK Mouse Pad';

UPDATE public.products 
SET 
  price = 9.99,
  updated_at = now()
WHERE name = 'Reform UK Mug';

-- Update bundle prices
UPDATE public.products 
SET 
  price = 49.99,
  updated_at = now()
WHERE name = 'Starter Bundle';

UPDATE public.products 
SET 
  price = 89.99,
  updated_at = now()
WHERE name = 'Champion Bundle';

UPDATE public.products 
SET 
  price = 127.99,
  updated_at = now()
WHERE name = 'Activist Bundle';

-- Verify the updates
SELECT 
  name,
  price,
  updated_at
FROM public.products 
WHERE name IN (
  'Reform UK Hoodie',
  'Reform UK T-Shirt', 
  'Reform UK Cap',
  'Reform UK Tote Bag',
  'Reform UK Water Bottle',
  'Reform UK Mouse Pad',
  'Reform UK Mug',
  'Starter Bundle',
  'Champion Bundle',
  'Activist Bundle'
)
ORDER BY name;

-- down
-- Revert to old prices if needed
UPDATE public.products 
SET 
  price = 49.99,
  updated_at = now()
WHERE name = 'Reform UK Hoodie';

UPDATE public.products 
SET 
  price = 24.99,
  updated_at = now()
WHERE name = 'Reform UK T-Shirt';

UPDATE public.products 
SET 
  price = 19.99,
  updated_at = now()
WHERE name = 'Reform UK Cap';

UPDATE public.products 
SET 
  price = 19.99,
  updated_at = now()
WHERE name = 'Reform UK Tote Bag';

UPDATE public.products 
SET 
  price = 14.99,
  updated_at = now()
WHERE name = 'Reform UK Water Bottle';

UPDATE public.products 
SET 
  price = 12.99,
  updated_at = now()
WHERE name = 'Reform UK Mouse Pad';

UPDATE public.products 
SET 
  price = 19.99,
  updated_at = now()
WHERE name = 'Reform UK Mug';

UPDATE public.products 
SET 
  price = 34.99,
  updated_at = now()
WHERE name = 'Starter Bundle';

UPDATE public.products 
SET 
  price = 99.99,
  updated_at = now()
WHERE name = 'Champion Bundle';

UPDATE public.products 
SET 
  price = 169.99,
  updated_at = now()
WHERE name = 'Activist Bundle';
