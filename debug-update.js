import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugUpdate() {
  console.log('🔧 Testing a single update...');
  
  // Get one variant
  const { data: variants } = await supabase
    .from('product_variants')
    .select('id, name, printful_variant_id')
    .limit(1);
    
  if (!variants || variants.length === 0) {
    console.log('❌ No variants found');
    return;
  }
  
  const variant = variants[0];
  console.log('📋 Testing with variant:', variant);
  
  // Try to update it
  const { data, error } = await supabase
    .from('product_variants')
    .update({ printful_variant_id: 9999 })
    .eq('id', variant.id)
    .select();
    
  if (error) {
    console.error('❌ Update error:', error);
  } else {
    console.log('✅ Update result:', data);
  }
}

debugUpdate().then(() => {
  console.log('Done.');
  process.exit(0);
});