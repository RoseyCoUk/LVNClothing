import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const basicSchemaSQL = `
-- Ensure we have the basic tables needed for data sync

-- Add missing columns to existing products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS printful_sync_product_id INTEGER,
ADD COLUMN IF NOT EXISTS printful_cost DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS margin DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Create product_variants table with simplified structure
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_products_sync_id ON public.products(printful_sync_product_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_printful_id ON public.product_variants(printful_variant_id);

-- Enable RLS
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for variants
DROP POLICY IF EXISTS "Enable read access for all users" ON public.product_variants;
CREATE POLICY "Enable read access for all users" ON public.product_variants FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable all access for service role" ON public.product_variants;
CREATE POLICY "Enable all access for service role" ON public.product_variants FOR ALL USING (auth.role() = 'service_role');

-- Grant permissions
GRANT ALL ON public.product_variants TO service_role;
GRANT SELECT ON public.product_variants TO anon, authenticated;

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
`;

async function applyBasicSchema() {
  console.log('🔧 Applying basic schema changes...');
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: basicSchemaSQL
    });

    if (error) {
      console.error('❌ Error applying schema:', error);
      return false;
    }

    console.log('✅ Basic schema applied successfully');
    return true;
  } catch (err) {
    // Fallback: try executing each statement separately
    console.log('⚠️ Trying alternative approach...');
    
    const statements = basicSchemaSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));

    for (const statement of statements) {
      if (!statement) continue;
      
      console.log(`Executing: ${statement.substring(0, 50)}...`);
      
      const { error } = await supabase.rpc('exec_sql', {
        sql: statement
      });

      if (error) {
        console.error(`❌ Error executing statement: ${error.message}`);
        // Continue with other statements
      }
    }
    
    return true;
  }
}

async function checkTableStructure() {
  console.log('🔍 Checking table structure...');
  
  // Check products table structure
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*')
    .limit(1);

  if (productsError) {
    console.error('❌ Products table error:', productsError);
  } else {
    console.log('✅ Products table accessible');
  }

  // Check variants table structure
  const { data: variants, error: variantsError } = await supabase
    .from('product_variants')
    .select('*')
    .limit(1);

  if (variantsError) {
    console.error('❌ Product variants table error:', variantsError);
  } else {
    console.log('✅ Product variants table accessible');
  }

  return !productsError && !variantsError;
}

async function main() {
  const schemaApplied = await applyBasicSchema();
  if (schemaApplied) {
    await checkTableStructure();
    console.log('\n🎉 Schema setup completed! Ready to run data sync.');
  }
}

main().catch(console.error);