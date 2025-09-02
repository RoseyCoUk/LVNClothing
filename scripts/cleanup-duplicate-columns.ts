import { createClient } from '@supabase/supabase-js';

// REMOTE Supabase connection
const SUPABASE_URL = 'https://nsmrxwnrtsllxvplazmm.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zbXJ4d25ydHNsbHh2cGxhem1tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTQ5NjQ1MiwiZXhwIjoyMDY3MDcyNDUyfQ.hmKiDQ2LocnHf59nVJYB5_YHnH3W6bdeMl2Px3xFpPw';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function cleanupDuplicateColumns() {
  console.log('=== CLEANING UP DUPLICATE COLUMNS ===');
  console.log(`Connected to: ${SUPABASE_URL}\n`);

  try {
    // Check if duplicate columns exist
    const { data: sampleVariant } = await supabase
      .from('product_variants')
      .select('*')
      .limit(1)
      .single();

    console.log('Current product_variants columns:');
    if (sampleVariant) {
      Object.keys(sampleVariant).forEach(col => {
        console.log(`  - ${col}`);
      });
    }

    // Identify duplicate columns
    const duplicateColumns = [];
    if ('color_hex_code' in sampleVariant) duplicateColumns.push('color_hex_code');
    if ('size_name_duplicate' in sampleVariant) duplicateColumns.push('size_name_duplicate');

    if (duplicateColumns.length === 0) {
      console.log('\n✅ No duplicate columns found');
      return;
    }

    console.log(`\n⚠️  Found duplicate columns: ${duplicateColumns.join(', ')}`);

    // For now, we'll just document what columns need to be dropped
    // In production, you'd create a migration file
    console.log('\nMigration SQL to execute:');
    duplicateColumns.forEach(col => {
      console.log(`ALTER TABLE product_variants DROP COLUMN IF EXISTS ${col};`);
    });

    // Check products table for duplicates
    const { data: sampleProduct } = await supabase
      .from('products')
      .select('*')
      .limit(1)
      .single();

    console.log('\nCurrent products columns:');
    if (sampleProduct) {
      const productDuplicates = [];
      Object.keys(sampleProduct).forEach(col => {
        console.log(`  - ${col}`);
        // Check for potential duplicates
        if (col === 'printful_product_id_light') productDuplicates.push(col);
        if (col === 'custom_price' && sampleProduct.retail_price) productDuplicates.push(col);
      });

      if (productDuplicates.length > 0) {
        console.log(`\n⚠️  Found potential duplicate columns in products: ${productDuplicates.join(', ')}`);
        console.log('\nMigration SQL to execute:');
        productDuplicates.forEach(col => {
          console.log(`ALTER TABLE products DROP COLUMN IF EXISTS ${col};`);
        });
      }
    }

  } catch (error) {
    console.error('Error checking columns:', error);
  }
}

cleanupDuplicateColumns().catch(console.error);