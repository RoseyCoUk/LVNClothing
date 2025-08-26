-- Migration: Fix RLS policies for products table to allow public read access
-- This fixes the 401 errors that are blocking accessibility testing

-- 1. Enable RLS on products table if not already enabled
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 2. Create policy to allow public read access to products
-- This is necessary for e-commerce functionality where product information should be publicly accessible
CREATE POLICY "Allow public read access to products" ON public.products
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- 3. Create policy to allow authenticated users to insert products (for admin functionality)
CREATE POLICY "Allow authenticated users to insert products" ON public.products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 4. Create policy to allow authenticated users to update products (for admin functionality)
CREATE POLICY "Allow authenticated users to update products" ON public.products
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 5. Create policy to allow authenticated users to delete products (for admin functionality)
CREATE POLICY "Allow authenticated users to delete products" ON public.products
  FOR DELETE
  TO authenticated
  USING (true);

-- 6. Enable RLS on product_variants table if not already enabled
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- 7. Create policy to allow public read access to product variants
CREATE POLICY "Allow public read access to product variants" ON public.product_variants
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- 8. Create policy to allow authenticated users to manage product variants
CREATE POLICY "Allow authenticated users to manage product variants" ON public.product_variants
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
