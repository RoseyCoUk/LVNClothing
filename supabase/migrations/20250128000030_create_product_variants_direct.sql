-- Create product_variants table directly
-- up
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

-- Add foreign key constraint
ALTER TABLE public.product_variants 
ADD CONSTRAINT product_variants_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

-- Create basic indexes
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_printful_id ON public.product_variants(printful_variant_id);

-- Enable RLS
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policy
CREATE POLICY "Allow all on product_variants" ON public.product_variants
  FOR ALL USING (true);

-- Grant permissions
GRANT ALL ON public.product_variants TO authenticated;
GRANT ALL ON public.product_variants TO service_role;

-- Verify table creation
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'product_variants') THEN
        RAISE NOTICE '✅ product_variants table created successfully';
    ELSE
        RAISE EXCEPTION '❌ product_variants table was not created';
    END IF;
END $$;

-- down
DROP TABLE IF EXISTS public.product_variants CASCADE;
