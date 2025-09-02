import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('\n=== CHECKING DATABASE SCHEMA ===\n');

  // Query information schema to get table structures
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          table_name, 
          column_name, 
          data_type, 
          is_nullable,
          column_default
        FROM information_schema.columns 
        WHERE table_name IN ('products', 'product_images', 'product_variants')
        ORDER BY table_name, ordinal_position;
      `
    });

    if (error) {
      console.log('Using fallback method to check schema...');
      
      // Try direct table queries to see what columns exist
      console.log('\n--- product_images table columns ---');
      const { data: imageTest, error: imageError } = await supabase
        .from('product_images')
        .select('*')
        .limit(0);
      
      if (imageError) {
        console.log('product_images error:', imageError);
      } else {
        console.log('product_images columns exist (empty result expected)');
      }

      console.log('\n--- products table columns ---');
      const { data: productsTest, error: productsError } = await supabase
        .from('products')
        .select('*')
        .limit(0);
      
      if (productsError) {
        console.log('products error:', productsError);
      } else {
        console.log('products columns exist (empty result expected)');
      }

      console.log('\n--- product_variants table columns ---');
      const { data: variantsTest, error: variantsError } = await supabase
        .from('product_variants')
        .select('*')
        .limit(0);
      
      if (variantsError) {
        console.log('product_variants error:', variantsError);
      } else {
        console.log('product_variants columns exist (empty result expected)');
      }

    } else {
      console.log('Schema information:', JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.log('Error checking schema:', err);
  }
}

checkSchema().catch(console.error);