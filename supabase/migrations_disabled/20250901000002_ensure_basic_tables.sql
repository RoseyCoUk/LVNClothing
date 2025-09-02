-- Ensure we have the basic tables needed for data sync

-- Create products table with all required columns
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  printful_cost DECIMAL(10,2),
  margin DECIMAL(10,2),
  printful_sync_product_id INTEGER,
  category VARCHAR(100) NOT NULL,
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product_variants table with simplified structure
CREATE TABLE IF NOT EXISTS public.product_variants (
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
  updated_at timestamptz DEFAULT timezone('utc', now())
);

-- Add foreign key constraint if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'product_variants_product_id_fkey'
  ) THEN
    ALTER TABLE public.product_variants 
    ADD CONSTRAINT product_variants_product_id_fkey 
    FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_products_sync_id ON public.products(printful_sync_product_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_printful_id ON public.product_variants(printful_variant_id);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for products
DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;
CREATE POLICY "Enable read access for all users" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable all access for service role" ON public.products;
CREATE POLICY "Enable all access for service role" ON public.products FOR ALL USING (auth.role() = 'service_role');

-- Add RLS policies for variants
DROP POLICY IF EXISTS "Enable read access for all users" ON public.product_variants;
CREATE POLICY "Enable read access for all users" ON public.product_variants FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable all access for service role" ON public.product_variants;
CREATE POLICY "Enable all access for service role" ON public.product_variants FOR ALL USING (auth.role() = 'service_role');

-- Grant permissions
GRANT ALL ON public.products TO service_role;
GRANT SELECT ON public.products TO anon, authenticated;

GRANT ALL ON public.product_variants TO service_role;
GRANT SELECT ON public.product_variants TO anon, authenticated;

-- Add update trigger for products
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add update trigger for variants
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

-- Log success
DO $$
BEGIN
    RAISE NOTICE 'Basic tables created successfully';
END $$;