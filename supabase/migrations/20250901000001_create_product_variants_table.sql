-- Create missing product_variants table
-- This table was supposed to be created by earlier migrations but failed

CREATE TABLE IF NOT EXISTS public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  printful_variant_id text,
  name text, -- e.g., "Size", "Color" 
  value text, -- e.g., "Large", "Black"
  color text, -- Color variant
  size text, -- Size variant
  retail_price numeric(10,2),
  printful_cost numeric(10,2), -- Cost from Printful
  margin numeric(10,2), -- Profit margin
  in_stock boolean DEFAULT true,
  is_available boolean DEFAULT true,
  image_url text,
  printful_data jsonb, -- Store full Printful variant data
  created_at timestamptz DEFAULT timezone('utc', now()),
  updated_at timestamptz DEFAULT timezone('utc', now())
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_printful_id ON public.product_variants(printful_variant_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_available ON public.product_variants(is_available);
CREATE INDEX IF NOT EXISTS idx_product_variants_stock ON public.product_variants(in_stock);

-- Enable Row Level Security
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for product_variants
CREATE POLICY "Users can view available product variants" ON public.product_variants
  FOR SELECT USING (is_available = true);

CREATE POLICY "Service role can manage product variants" ON public.product_variants
  FOR ALL USING (auth.role() = 'service_role');

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_variants TO service_role;
GRANT SELECT ON public.product_variants TO anon;
GRANT SELECT ON public.product_variants TO authenticated;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
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
    EXECUTE FUNCTION public.update_updated_at_column();