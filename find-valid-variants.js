import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function findValidVariants() {
  console.log('🔍 Looking for any variants with valid printful_variant_id values...');
  
  // Check for numeric printful_variant_id  
  const { data: numericVariants } = await supabase
    .from('product_variants')
    .select('id, name, color, size, printful_variant_id, product_id')
    .gte('printful_variant_id', 4000)
    .limit(10);
    
  if (numericVariants && numericVariants.length > 0) {
    console.log(`✅ Found ${numericVariants.length} variants with printful_variant_id:`);
    numericVariants.forEach(variant => {
      console.log(`  - ${variant.name} (${variant.color}/${variant.size}): ${variant.printful_variant_id}`);
    });
  } else {
    console.log('❌ No variants found with valid printful_variant_id');
  }
  
  // Check what the actual data structure looks like for a t-shirt or hoodie
  console.log('\n🔍 Looking for t-shirt or hoodie products...');
  const { data: apparelVariants } = await supabase
    .from('product_variants')
    .select('id, name, color, size, printful_variant_id, product_id')
    .ilike('name', '%shirt%')
    .limit(5);
    
  if (apparelVariants && apparelVariants.length > 0) {
    console.log(`📋 Found ${apparelVariants.length} apparel variants:`);
    apparelVariants.forEach(variant => {
      console.log(`  - ${variant.name} (${variant.color}/${variant.size}): printful_id=${variant.printful_variant_id}`);
    });
  }
}

findValidVariants().then(() => {
  console.log('Done.');
  process.exit(0);
});