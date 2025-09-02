import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
  console.log('🔍 Checking what columns exist in product_variants...');
  
  // Get a sample record to see all columns
  const { data: sample, error } = await supabase
    .from('product_variants')
    .select('*')
    .limit(1)
    .single();
  
  if (error) {
    console.error('❌ Error fetching sample:', error);
    return;
  }
  
  console.log('📋 Available columns:');
  Object.keys(sample).forEach(key => {
    console.log(`  - ${key}: ${typeof sample[key]} (value: ${sample[key]})`);
  });
}

checkColumns().then(() => {
  console.log('Done.');
  process.exit(0);
});