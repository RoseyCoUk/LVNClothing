-- Starter Bundle Printful Integration Migration
-- Run this script in your Supabase Dashboard > SQL Editor

-- 1. Add Printful integration fields to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS printful_product_id integer,
ADD COLUMN IF NOT EXISTS printful_sync_product_id integer;

-- 2. Update product_variants table to include Printful fields
ALTER TABLE public.product_variants 
ADD COLUMN IF NOT EXISTS printful_variant_id integer,
ADD COLUMN IF NOT EXISTS color text,
ADD COLUMN IF NOT EXISTS size text,
ADD COLUMN IF NOT EXISTS color_code text,
ADD COLUMN IF NOT EXISTS in_stock boolean DEFAULT true;

-- 3. Create index for faster Printful lookups
CREATE INDEX IF NOT EXISTS idx_product_variants_printful_id ON public.product_variants(printful_variant_id);
CREATE INDEX IF NOT EXISTS idx_products_printful_id ON public.products(printful_product_id);

-- 4. Update products with Printful IDs (these are the actual Printful product IDs)
UPDATE public.products SET 
  printful_product_id = CASE 
    WHEN name = 'Reform UK T-Shirt' THEN 1
    WHEN name = 'Reform UK Hoodie' THEN 2
    WHEN name = 'Reform UK Cap' THEN 3
    WHEN name = 'Reform UK Mug' THEN 4
    WHEN name = 'Reform UK Tote Bag' THEN 5
    WHEN name = 'Reform UK Water Bottle' THEN 6
    WHEN name = 'Reform UK Mouse Pad' THEN 7
    WHEN name = 'Reform UK Stickers' THEN 8
    WHEN name = 'Reform UK Badge Set' THEN 9
    ELSE NULL
  END
WHERE name IN (
  'Reform UK T-Shirt',
  'Reform UK Hoodie', 
  'Reform UK Cap',
  'Reform UK Mug',
  'Reform UK Tote Bag',
  'Reform UK Water Bottle',
  'Reform UK Mouse Pad',
  'Reform UK Stickers',
  'Reform UK Badge Set'
);

-- 5. Insert product variants with Printful variant IDs
-- T-Shirt variants (Product ID 1)
INSERT INTO public.product_variants (product_id, name, value, price, image_url, printful_variant_id, color, size, color_code, in_stock) 
SELECT p.id, 'Black T-Shirt - S', 'Black-S', 24.99, '/Tshirt/Men/ReformMenTshirtBlack1.webp', 4016, 'Black', 'S', '#000000', true
FROM public.products p WHERE p.name = 'Reform UK T-Shirt';

INSERT INTO public.product_variants (product_id, name, value, price, image_url, printful_variant_id, color, size, color_code, in_stock) 
SELECT p.id, 'Black T-Shirt - M', 'Black-M', 24.99, '/Tshirt/Men/ReformMenTshirtBlack2.webp', 4017, 'Black', 'M', '#000000', true
FROM public.products p WHERE p.name = 'Reform UK T-Shirt';

INSERT INTO public.product_variants (product_id, name, value, price, image_url, printful_variant_id, color, size, color_code, in_stock) 
SELECT p.id, 'Black T-Shirt - L', 'Black-L', 24.99, '/Tshirt/Men/ReformMenTshirtBlack3.webp', 4018, 'Black', 'L', '#000000', true
FROM public.products p WHERE p.name = 'Reform UK T-Shirt';

INSERT INTO public.product_variants (product_id, name, value, price, image_url, printful_variant_id, color, size, color_code, in_stock) 
SELECT p.id, 'Black T-Shirt - XL', 'Black-XL', 24.99, '/Tshirt/Men/ReformMenTshirtBlack4.webp', 4019, 'Black', 'XL', '#000000', true
FROM public.products p WHERE p.name = 'Reform UK T-Shirt';

INSERT INTO public.product_variants (product_id, name, value, price, image_url, printful_variant_id, color, size, color_code, in_stock) 
SELECT p.id, 'Black T-Shirt - 2XL', 'Black-2XL', 26.99, '/Tshirt/Men/ReformMenTshirtBlack5.webp', 4020, 'Black', '2XL', '#000000', true
FROM public.products p WHERE p.name = 'Reform UK T-Shirt';

-- White T-Shirt variants
INSERT INTO public.product_variants (product_id, name, value, price, image_url, printful_variant_id, color, size, color_code, in_stock) 
SELECT p.id, 'White T-Shirt - S', 'White-S', 24.99, '/Tshirt/Men/ReformMenTshirtWhite1.webp', 4021, 'White', 'S', '#FFFFFF', true
FROM public.products p WHERE p.name = 'Reform UK T-Shirt';

INSERT INTO public.product_variants (product_id, name, value, price, image_url, printful_variant_id, color, size, color_code, in_stock) 
SELECT p.id, 'White T-Shirt - M', 'White-M', 24.99, '/Tshirt/Men/ReformMenTshirtWhite2.webp', 4022, 'White', 'M', '#FFFFFF', true
FROM public.products p WHERE p.name = 'Reform UK T-Shirt';

INSERT INTO public.product_variants (product_id, name, value, price, image_url, printful_variant_id, color, size, color_code, in_stock) 
SELECT p.id, 'White T-Shirt - L', 'White-L', 24.99, '/Tshirt/Men/ReformMenTshirtWhite3.webp', 4023, 'White', 'L', '#FFFFFF', true
FROM public.products p WHERE p.name = 'Reform UK T-Shirt';

INSERT INTO public.product_variants (product_id, name, value, price, image_url, printful_variant_id, color, size, color_code, in_stock) 
SELECT p.id, 'White T-Shirt - XL', 'White-XL', 24.99, '/Tshirt/Men/ReformMenTshirtWhite4.webp', 4024, 'White', 'XL', '#FFFFFF', true
FROM public.products p WHERE p.name = 'Reform UK T-Shirt';

INSERT INTO public.product_variants (product_id, name, value, price, image_url, printful_variant_id, color, size, color_code, in_stock) 
SELECT p.id, 'White T-Shirt - 2XL', 'White-2XL', 26.99, '/Tshirt/Men/ReformMenTshirtWhite5.webp', 4025, 'White', '2XL', '#FFFFFF', true
FROM public.products p WHERE p.name = 'Reform UK T-Shirt';

-- Cap variants (Product ID 3) - No size variants, only colors
INSERT INTO public.product_variants (product_id, name, value, price, image_url, printful_variant_id, color, size, color_code, in_stock) 
SELECT p.id, 'Black Cap', 'Black', 19.99, '/Cap/ReformCapBlack1.webp', 6001, 'Black', 'One Size', '#000000', true
FROM public.products p WHERE p.name = 'Reform UK Cap';

INSERT INTO public.product_variants (product_id, name, value, price, image_url, printful_variant_id, color, size, color_code, in_stock) 
SELECT p.id, 'White Cap', 'White', 19.99, '/Cap/ReformCapWhite1.webp', 6002, 'White', 'One Size', '#FFFFFF', true
FROM public.products p WHERE p.name = 'Reform UK Cap';

INSERT INTO public.product_variants (product_id, name, value, price, image_url, printful_variant_id, color, size, color_code, in_stock) 
SELECT p.id, 'Navy Cap', 'Navy', 19.99, '/Cap/ReformCapNavy1.webp', 6003, 'Navy', 'One Size', '#1c2330', true
FROM public.products p WHERE p.name = 'Reform UK Cap';

INSERT INTO public.product_variants (product_id, name, value, price, image_url, printful_variant_id, color, size, color_code, in_stock) 
SELECT p.id, 'Red Cap', 'Red', 19.99, '/Cap/ReformCapRed1.webp', 6004, 'Red', 'One Size', '#8e0a1f', true
FROM public.products p WHERE p.name = 'Reform UK Cap';

-- Mug variants (Product ID 4) - No size/color variants, just one product
INSERT INTO public.product_variants (product_id, name, value, price, image_url, printful_variant_id, color, size, color_code, in_stock) 
SELECT p.id, 'Reform UK Mug', 'Default', 19.99, '/MugMouse/ReformMug1.webp', 7001, 'White', 'One Size', '#FFFFFF', true
FROM public.products p WHERE p.name = 'Reform UK Mug';

-- 6. Create a bundle_variants table to link bundles with their component variants
CREATE TABLE IF NOT EXISTS public.bundle_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  product_variant_id uuid REFERENCES public.product_variants(id) ON DELETE CASCADE,
  quantity integer DEFAULT 1,
  created_at timestamptz DEFAULT timezone('utc', now())
);

-- 7. Seed starter bundle with default variants
INSERT INTO public.bundle_variants (bundle_id, product_variant_id, quantity)
SELECT 
  b.id as bundle_id,
  pv.id as product_variant_id,
  1 as quantity
FROM public.products b
CROSS JOIN LATERAL (
  SELECT pv.id, pv.printful_variant_id
  FROM public.product_variants pv
  JOIN public.products p ON p.id = pv.product_id
  WHERE p.name = 'Reform UK T-Shirt' AND pv.printful_variant_id = 4017 -- Default to Medium Black T-shirt
  LIMIT 1
) tshirt
CROSS JOIN LATERAL (
  SELECT pv.id, pv.printful_variant_id
  FROM public.product_variants pv
  JOIN public.products p ON p.id = pv.product_id
  WHERE p.name = 'Reform UK Cap' AND pv.printful_variant_id = 6001 -- Default to Black Cap
  LIMIT 1
) cap
CROSS JOIN LATERAL (
  SELECT pv.id, pv.printful_variant_id
  FROM public.product_variants pv
  JOIN public.products p ON p.id = pv.product_id
  WHERE p.name = 'Reform UK Mug' AND pv.printful_variant_id = 7001 -- Default Mug
  LIMIT 1
) mug
WHERE b.name = 'Starter Bundle';

-- 8. Verify the migration was successful
SELECT 'Migration completed successfully!' as status;

-- 9. Show what was created
SELECT 'Products with Printful IDs:' as info;
SELECT name, printful_product_id FROM public.products WHERE printful_product_id IS NOT NULL;

SELECT 'Product Variants with Printful IDs:' as info;
SELECT p.name as product_name, pv.name as variant_name, pv.printful_variant_id, pv.color, pv.size
FROM public.product_variants pv
JOIN public.products p ON p.id = pv.product_id
WHERE pv.printful_variant_id IS NOT NULL
ORDER BY p.name, pv.name;

SELECT 'Bundle Variants:' as info;
SELECT b.name as bundle_name, p.name as product_name, pv.printful_variant_id
FROM public.bundle_variants bv
JOIN public.products b ON b.id = bv.bundle_id
JOIN public.product_variants pv ON pv.id = bv.product_variant_id
JOIN public.products p ON p.id = pv.product_id
ORDER BY b.name, p.name;
