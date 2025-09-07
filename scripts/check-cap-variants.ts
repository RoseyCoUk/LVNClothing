import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://nsmrxwnrtsllxvplazmm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zbXJ4d25ydHNsbHh2cGxhem1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2OTE0MzAsImV4cCI6MjA3MTI2NzQzMH0.DJehB4-N2JUMvl-S_Hhwveb89ur3lRVYlzh7u5jlQIE'
);

async function checkCapVariants() {
  const { data } = await supabase
    .from('product_variants')
    .select('printful_variant_id, color_name, name')
    .ilike('name', '%cap%')
    .order('color_name');
  
  console.log('Cap variants from database:');
  data?.forEach(v => {
    console.log(`  ${v.color_name}: ${v.printful_variant_id} (${v.name})`);
  });
  
  // Also check the mapping in cap-variants.ts
  console.log('\nCap color mapping in cap-variants.ts:');
  const capColors = [
    { value: 'Black', catalogVariantId: 7854, syncVariantId: 4938937571 },
    { value: 'Navy', catalogVariantId: 7857, syncVariantId: 4938937572 },
    { value: 'White', catalogVariantId: 12736, syncVariantId: 4938937573 },
    { value: 'Red', catalogVariantId: 7855, syncVariantId: 4938937574 },
    { value: 'Grey', catalogVariantId: 7859, syncVariantId: 4938937575 },
    { value: 'Khaki', catalogVariantId: 7858, syncVariantId: 4938937576 },
    { value: 'Green', catalogVariantId: 7856, syncVariantId: 4938937577 },
    { value: 'Blue', catalogVariantId: 7853, syncVariantId: 4938937578 }
  ];
  
  capColors.forEach(c => {
    console.log(`  ${c.value}: syncVariantId=${c.syncVariantId}`);
  });
}

checkCapVariants();