import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function populateTestVariantIds() {
  console.log('🔧 Populating test printful_variant_id values...');
  
  // Get some variants to update
  const { data: variants } = await supabase
    .from('product_variants')
    .select('id, name, color, size')
    .limit(20);
    
  if (!variants || variants.length === 0) {
    console.log('❌ No variants found to update');
    return;
  }
  
  console.log(`📋 Found ${variants.length} variants to update`);
  
  let updateCount = 0;
  for (let i = 0; i < variants.length; i++) {
    const variant = variants[i];
    
    // Assign a test printful_variant_id (using 4011 + offset as valid test IDs)
    const testPrintfulId = 4011 + i;
    
    const { error } = await supabase
      .from('product_variants')
      .update({ printful_variant_id: testPrintfulId })
      .eq('id', variant.id);
      
    if (error) {
      console.error(`❌ Failed to update ${variant.name}:`, error);
    } else {
      console.log(`✅ Updated ${variant.name} (${variant.color}/${variant.size}) → printful_variant_id: ${testPrintfulId}`);
      updateCount++;
    }
  }
  
  console.log(`🎉 Successfully updated ${updateCount} variants with test printful_variant_id values`);
}

populateTestVariantIds().then(() => {
  console.log('Done.');
  process.exit(0);
});