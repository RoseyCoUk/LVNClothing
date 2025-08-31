-- Create product_variants table with all necessary columns
CREATE TABLE IF NOT EXISTS public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  name text NOT NULL,
  value text NOT NULL,
  printful_variant_id text,
  price numeric(10,2),
  in_stock boolean DEFAULT true,
  is_available boolean DEFAULT true,
  color text,
  color_hex text,
  design text,
  size text,
  created_at timestamptz DEFAULT timezone('utc', now()),
  updated_at timestamptz DEFAULT timezone('utc', now())
);

-- Add foreign key constraint (without IF NOT EXISTS for constraints)
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
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_printful_id ON public.product_variants(printful_variant_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_available ON public.product_variants(is_available);
CREATE INDEX IF NOT EXISTS idx_product_variants_stock ON public.product_variants(in_stock);

-- Enable RLS
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Allow all on product_variants" ON public.product_variants;
CREATE POLICY "Allow all on product_variants" ON public.product_variants
  FOR ALL USING (true);

-- Grant permissions
GRANT ALL ON public.product_variants TO authenticated;
GRANT ALL ON public.product_variants TO service_role;
GRANT ALL ON public.product_variants TO anon;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_product_variants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_product_variants_updated_at ON public.product_variants;
CREATE TRIGGER update_product_variants_updated_at
  BEFORE UPDATE ON public.product_variants
  FOR EACH ROW
  EXECUTE FUNCTION update_product_variants_updated_at();
