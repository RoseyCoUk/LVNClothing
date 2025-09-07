import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function findDefaultVariants() {
  console.log('Finding default variants for bundles...\n');

  // Find default T-shirt (Black, M from Unisex t-shirt DARK)
  const { data: tshirt } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', '814074c6-e88d-4505-9089-6ac04124ea23') // Unisex t-shirt DARK
    .eq('size', 'M')
    .eq('color', 'Black')
    .single();

  console.log('T-shirt (Black, M):', tshirt?.printful_variant_id || 'NOT FOUND');

  // Find default Hoodie (Black, L from Unisex Hoodie DARK)
  const { data: hoodie } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', '5889188a-e6c9-4161-96fa-c370a2a3c89b') // Unisex Hoodie DARK
    .eq('size', 'L')
    .eq('color', 'Black')
    .single();

  console.log('Hoodie (Black, L):', hoodie?.printful_variant_id || 'NOT FOUND');

  // Find default Cap (Black)
  const { data: cap } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', '29b2e16a-39e8-4322-aaf1-0529b3973212') // Reform UK Cap
    .eq('color', 'Black')
    .single();

  console.log('Cap (Black):', cap?.printful_variant_id || 'NOT FOUND');

  // Find default Mug
  const { data: mug } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', '0274bc92-4d93-47a2-a613-6fc2182de5c8') // Reform UK Mug
    .single();

  console.log('Mug:', mug?.printful_variant_id || 'NOT FOUND');

  // Find default Tote Bag
  const { data: tote } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', '103b8eaf-4ef5-44a1-9c9e-f49c8367f220') // Reform UK Tote Bag
    .single();

  console.log('Tote Bag:', tote?.printful_variant_id || 'NOT FOUND');

  // Find default Water Bottle
  const { data: water } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', '2e7c2ccd-9b4e-413e-aac6-d2be53db9663') // Reform UK Water Bottle
    .single();

  console.log('Water Bottle:', water?.printful_variant_id || 'NOT FOUND');

  // Find default Mouse Pad
  const { data: mousepad } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', '48341979-9106-4d56-b71a-732c41f7aa6e') // Reform UK Mouse Pad
    .single();

  console.log('Mouse Pad:', mousepad?.printful_variant_id || 'NOT FOUND');

  console.log('\nBundle variant IDs for webhook:');
  console.log('tshirt:', tshirt?.printful_variant_id || '4938821283');
  console.log('hoodie:', hoodie?.printful_variant_id || '4938800534');
  console.log('cap:', cap?.printful_variant_id || '4938937571');
  console.log('mug:', mug?.printful_variant_id || '4938946337');
  console.log('tote:', tote?.printful_variant_id || '4937855201');
  console.log('water:', water?.printful_variant_id || '4938941055');
  console.log('mousepad:', mousepad?.printful_variant_id || 'NOT FOUND');
}

findDefaultVariants().catch(console.error);
