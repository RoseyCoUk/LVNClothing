-- Fix product prices to correct decimal values
-- This migration updates all product prices to have the correct decimal precision

-- up

-- Update all product prices to correct decimal values (new pricing structure)
UPDATE public.products SET price = 39.99 WHERE name = 'Reform UK Hoodie';
UPDATE public.products SET price = 24.99 WHERE name = 'Reform UK T-Shirt';
UPDATE public.products SET price = 19.99 WHERE name = 'Reform UK Cap';
UPDATE public.products SET price = 24.99 WHERE name = 'Reform UK Tote Bag';
UPDATE public.products SET price = 24.99 WHERE name = 'Reform UK Water Bottle';
UPDATE public.products SET price = 9.99 WHERE name = 'Reform UK Badge Set';
UPDATE public.products SET price = 14.99 WHERE name = 'Reform UK Mouse Pad';
UPDATE public.products SET price = 9.99 WHERE name = 'Reform UK Stickers';
UPDATE public.products SET price = 9.99 WHERE name = 'Reform UK Mug';
UPDATE public.products SET price = 49.99 WHERE name = 'Starter Bundle';
UPDATE public.products SET price = 89.99 WHERE name = 'Champion Bundle';
UPDATE public.products SET price = 127.99 WHERE name = 'Activist Bundle';

-- down
-- No down migration needed as this is just a data fix 