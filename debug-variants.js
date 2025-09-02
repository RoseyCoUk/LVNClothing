import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkVariants() {
  console.log('🔍 Checking product_variants table for printful_variant_id values...');
  
  const { data: variants, error } = await supabase
    .from('product_variants')
    .select('id, product_id, color, size, printful_variant_id')
    .not('printful_variant_id', 'is', null)
    .limit(10);
    
  if (error) {
    console.error('❌ Error fetching variants:', error);
    return;
  }
  
  console.log(`✅ Found ${variants.length} variants with printful_variant_id:`);
  variants.forEach(variant => {
    console.log(`  - ID: ${variant.id}, Color: ${variant.color}, Size: ${variant.size}, Printful ID: ${variant.printful_variant_id}`);
  });
  
  // Check total variants
  const { count: totalCount } = await supabase
    .from('product_variants')
    .select('*', { count: 'exact', head: true });
    
  console.log(`📊 Total variants in database: ${totalCount}`);
  
  if (totalCount > 0) {
    // Sample some variants
    const { data: sampleVariants } = await supabase
      .from('product_variants')
      .select('id, product_id, color, size, printful_variant_id')
      .limit(5);
      
    console.log('📋 Sample variants:');
    sampleVariants?.forEach(v => {
      console.log(`  - ID: ${v.id}, Color: ${v.color}, Size: ${v.size}, Printful ID: ${v.printful_variant_id || 'NULL'}`);
    });
  }
}

checkVariants().then(() => {
  console.log('Done.');
  process.exit(0);
});