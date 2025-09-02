import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixSchema() {
  console.log('\n=== FIXING DATABASE SCHEMA ===\n');

  try {
    // 1. Add color, size, variant_type columns to product_images
    console.log('1. Adding missing columns to product_images...');
    
    const imageColumns = [
      "ALTER TABLE public.product_images ADD COLUMN IF NOT EXISTS color VARCHAR(100);",
      "ALTER TABLE public.product_images ADD COLUMN IF NOT EXISTS size VARCHAR(10);",
      "ALTER TABLE public.product_images ADD COLUMN IF NOT EXISTS variant_type VARCHAR(50) DEFAULT 'product';",
      "ALTER TABLE public.product_images ADD COLUMN IF NOT EXISTS alt_text TEXT;",
      "ALTER TABLE public.product_images ADD COLUMN IF NOT EXISTS is_thumbnail BOOLEAN DEFAULT false;"
    ];

    for (const sql of imageColumns) {
      const { error } = await supabase.rpc('exec_sql', { sql });
      if (error) {
        console.log('SQL execution error:', error);
      } else {
        console.log('✅ Executed:', sql);
      }
    }

    // 2. Add missing columns to product_variants
    console.log('2. Adding missing columns to product_variants...');
    
    const variantColumns = [
      "ALTER TABLE public.product_variants ADD COLUMN IF NOT EXISTS available BOOLEAN DEFAULT true;",
      "ALTER TABLE public.product_variants ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0;",
      "ALTER TABLE public.product_variants ADD COLUMN IF NOT EXISTS color_code TEXT;"
    ];

    for (const sql of variantColumns) {
      const { error } = await supabase.rpc('exec_sql', { sql });
      if (error) {
        console.log('SQL execution error:', error);
      } else {
        console.log('✅ Executed:', sql);
      }
    }

    // 3. Add indexes
    console.log('3. Adding missing indexes...');
    
    const indexes = [
      "CREATE INDEX IF NOT EXISTS idx_product_images_color ON public.product_images(color);",
      "CREATE INDEX IF NOT EXISTS idx_product_images_variant_type ON public.product_images(variant_type);",
      "CREATE INDEX IF NOT EXISTS idx_product_images_product_color ON public.product_images(product_id, color);",
      "CREATE INDEX IF NOT EXISTS idx_product_variants_available ON public.product_variants(available);",
      "CREATE INDEX IF NOT EXISTS idx_product_variants_stock ON public.product_variants(stock);"
    ];

    for (const sql of indexes) {
      const { error } = await supabase.rpc('exec_sql', { sql });
      if (error) {
        console.log('Index creation error:', error);
      } else {
        console.log('✅ Created index:', sql.split(' ')[4]);
      }
    }

    // 4. Add constraints
    console.log('4. Adding constraints...');
    
    const constraints = [
      "ALTER TABLE public.product_images ADD CONSTRAINT IF NOT EXISTS check_variant_type CHECK (variant_type IN ('product', 'color', 'size'));",
      "ALTER TABLE public.product_variants ADD CONSTRAINT IF NOT EXISTS check_positive_stock CHECK (stock >= 0);"
    ];

    for (const sql of constraints) {
      const { error } = await supabase.rpc('exec_sql', { sql });
      if (error) {
        console.log('Constraint error:', error);
      } else {
        console.log('✅ Added constraint');
      }
    }

    console.log('\n✅ Schema fixed successfully!');

  } catch (error) {
    console.error('Error fixing schema:', error);
  }
}

fixSchema();