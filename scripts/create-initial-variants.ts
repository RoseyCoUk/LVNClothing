import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

// Approximate variant counts based on the Printful data we saw earlier
const variantCounts = [
  { name: "Reform UK Sticker", variants: 1 },
  { name: "Reform UK Mug", variants: 1 },
  { name: "Reform UK Mouse Pad", variants: 1 },
  { name: "Reform UK Water Bottle", variants: 1 },
  { name: "Reform UK Cap", variants: 8 },
  { name: "Unisex t-shirt DARK", variants: 60 },
  { name: "Unisex t-shirt LIGHT", variants: 40 },
  { name: "Unisex Hoodie DARK", variants: 25 },
  { name: "Unisex Hoodie LIGHT", variants: 20 },
  { name: "Reform UK Tote Bag", variants: 1 }
];

async function createInitialVariants() {
  console.log('=== CREATING INITIAL PRODUCT VARIANTS ===\n');

  // Get all products
  const { data: products } = await supabase
    .from('products')
    .select('id, name')
    .order('name');

  if (!products) {
    console.error('No products found');
    return;
  }

  let totalVariantsCreated = 0;

  for (const product of products) {
    const variantInfo = variantCounts.find(v => v.name === product.name);
    if (!variantInfo) {
      console.log(`⚠️  No variant count found for ${product.name}`);
      continue;
    }

    console.log(`Creating ${variantInfo.variants} variants for ${product.name}...`);

    // Create placeholder variants that will be updated with real Printful data later
    for (let i = 0; i < variantInfo.variants; i++) {
      const { error } = await supabase
        .from('product_variants')
        .insert({
          product_id: product.id,
          name: `${product.name} - Variant ${i + 1}`,
          value: `placeholder-${i + 1}`,
          color: 'Default',
          size: 'One Size',
          price: null,
          color_hex: '#000000',
          printful_variant_id: null,
          in_stock: true,
          is_available: true,
          stock: 0
        });

      if (error) {
        console.error(`Error creating variant ${i + 1} for ${product.name}:`, error);
      } else {
        totalVariantsCreated++;
      }
    }

    console.log(`✅ Created ${variantInfo.variants} variants for ${product.name}`);
  }

  console.log(`\n✅ Total variants created: ${totalVariantsCreated}`);

  // Verify total
  const { count } = await supabase
    .from('product_variants')
    .select('*', { count: 'exact' });

  console.log(`✅ Total variants in database: ${count}`);
}

createInitialVariants().catch(console.error);