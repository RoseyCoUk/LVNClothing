-- Fix schema for data synchronization
-- Add missing columns to products table and create proper product_variants table

-- Add missing columns to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS printful_sync_product_id INTEGER,
ADD COLUMN IF NOT EXISTS printful_cost DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS margin DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_products_sync_id ON public.products(printful_sync_product_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);

-- Drop and recreate product_variants table to ensure correct structure
DROP TABLE IF EXISTS public.product_variants CASCADE;

CREATE TABLE public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  printful_variant_id text,
  name text NOT NULL,
  value text NOT NULL,
  color text,
  size text,
  price numeric(10,2),
  in_stock boolean DEFAULT true,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT timezone('utc', now()),
  updated_at timestamptz DEFAULT timezone('utc', now()),
  CONSTRAINT product_variants_product_id_fkey 
    FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE
);

-- Create indexes for product_variants
CREATE INDEX idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX idx_product_variants_printful_id ON public.product_variants(printful_variant_id);
CREATE INDEX idx_product_variants_available ON public.product_variants(is_available);

-- Enable RLS on product_variants
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for product_variants
CREATE POLICY "Enable read access for all users" ON public.product_variants
  FOR SELECT USING (true);

CREATE POLICY "Enable all access for service role" ON public.product_variants
  FOR ALL USING (auth.role() = 'service_role');

-- Grant permissions
GRANT ALL ON public.product_variants TO service_role;
GRANT SELECT ON public.product_variants TO anon, authenticated;

-- Create update trigger for product_variants
CREATE OR REPLACE FUNCTION update_product_variants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_product_variants_updated_at ON public.product_variants;
CREATE TRIGGER update_product_variants_updated_at
    BEFORE UPDATE ON public.product_variants
    FOR EACH ROW
    EXECUTE FUNCTION update_product_variants_updated_at();

-- Verify the migration completed
DO $$
BEGIN
    RAISE NOTICE 'Schema fix migration completed successfully';
END $$;