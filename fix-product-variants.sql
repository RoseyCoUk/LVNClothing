-- Fix product_variants table structure
-- This ensures the table exists with the correct columns for the frontend

-- Drop and recreate the product_variants table with proper structure
DROP TABLE IF EXISTS product_variants CASCADE;

CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  value TEXT DEFAULT '',  -- This was causing the null constraint issue
  color TEXT,
  size TEXT,
  printful_variant_id TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  in_stock BOOLEAN DEFAULT true,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Create indexes for performance
CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_product_variants_printful_id ON product_variants(printful_variant_id);

-- Enable RLS
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "product_variants_select" ON product_variants FOR SELECT USING (true);
CREATE POLICY "product_variants_authenticated" ON product_variants FOR ALL USING (auth.role() = 'authenticated');

COMMENT ON TABLE product_variants IS 'Product variants with sizes, colors, and Printful integration';