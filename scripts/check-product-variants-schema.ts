import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProductVariantsSchema() {
  console.log('=== CHECKING PRODUCT_VARIANTS SCHEMA ===\n');

  try {
    // Get a sample record to see actual schema
    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error querying product_variants:', error);
      return;
    }

    if (data && data.length > 0) {
      console.log('Current columns in product_variants:');
      const columns = Object.keys(data[0]);
      columns.forEach(col => {
        console.log(`  - ${col}: ${typeof data[0][col]} (${data[0][col]})`);
      });
      
      console.log('\nLooking for missing columns:');
      const expectedColumns = ['color_hex', 'printful_variant_id', 'price'];
      expectedColumns.forEach(col => {
        if (columns.includes(col)) {
          console.log(`  ✅ ${col} exists`);
        } else {
          console.log(`  ❌ ${col} MISSING`);
        }
      });
    } else {
      console.log('No records found in product_variants table');
    }

  } catch (error) {
    console.error('Error checking schema:', error);
  }
}

checkProductVariantsSchema().catch(console.error);