import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function populateTestProducts() {
  console.log('=== POPULATING TEST PRODUCTS FOR MERGING INVESTIGATION ===\n');

  // Create test products that match what user mentioned
  const products = [
    {
      name: 'Unisex T-Shirt Light',
      description: 'Light variant of Reform UK T-Shirt',
      price: 24.99,
      category: 'apparel',
      slug: 'unisex-tshirt-light',
      printful_product_id: '390637999-light',
      rating: 4.7,
      reviews: 10
    },
    {
      name: 'Unisex T-Shirt Dark',
      description: 'Dark variant of Reform UK T-Shirt',
      price: 24.99,
      category: 'apparel',
      slug: 'unisex-tshirt-dark',
      printful_product_id: '390637999-dark',
      rating: 4.7,
      reviews: 10
    },
    {
      name: 'Unisex Hoodie Light',
      description: 'Light variant of Reform UK Hoodie',
      price: 39.99,
      category: 'apparel',
      slug: 'unisex-hoodie-light',
      printful_product_id: '390637888-light',
      rating: 4.8,
      reviews: 12
    },
    {
      name: 'Unisex Hoodie Dark',
      description: 'Dark variant of Reform UK Hoodie',
      price: 39.99,
      category: 'apparel',
      slug: 'unisex-hoodie-dark',
      printful_product_id: '390637888-dark',
      rating: 4.8,
      reviews: 12
    },
    {
      name: 'Reform UK Cap',
      description: 'Adjustable cap with embroidered Reform UK logo',
      price: 19.99,
      category: 'apparel',
      slug: 'reform-uk-cap',
      printful_product_id: '390637777',
      rating: 4.6,
      reviews: 8
    }
  ];

  // Insert products
  const { data: insertedProducts, error: productError } = await supabase
    .from('products')
    .insert(products)
    .select();

  if (productError) {
    console.error('Error inserting products:', productError);
    return;
  }

  console.log('✅ Inserted products:');
  insertedProducts?.forEach(p => {
    console.log(`  - ${p.name} (ID: ${p.id})`);
  });

  // Create variants for each product
  const variants: any[] = [];
  
  // Helper to create variant with value field
  const createVariant = (data: any) => ({
    ...data,
    value: `${data.color} / ${data.size}`
  });

  // T-Shirt Light variants
  const tshirtLight = insertedProducts?.find(p => p.name === 'Unisex T-Shirt Light');
  if (tshirtLight) {
    variants.push(
      createVariant({ product_id: tshirtLight.id, name: 'White S', color: 'White', color_hex: '#FFFFFF', size: 'S', price: 24.99, stock: 100, printful_variant_id: 101 }),
      createVariant({ product_id: tshirtLight.id, name: 'White M', color: 'White', color_hex: '#FFFFFF', size: 'M', price: 24.99, stock: 100, printful_variant_id: 102 }),
      createVariant({ product_id: tshirtLight.id, name: 'White L', color: 'White', color_hex: '#FFFFFF', size: 'L', price: 24.99, stock: 100, printful_variant_id: 103 }),
      createVariant({ product_id: tshirtLight.id, name: 'Light Blue S', color: 'Light Blue', color_hex: '#ADD8E6', size: 'S', price: 24.99, stock: 100, printful_variant_id: 104 }),
      createVariant({ product_id: tshirtLight.id, name: 'Light Blue M', color: 'Light Blue', color_hex: '#ADD8E6', size: 'M', price: 24.99, stock: 100, printful_variant_id: 105 }),
      createVariant({ product_id: tshirtLight.id, name: 'Light Blue L', color: 'Light Blue', color_hex: '#ADD8E6', size: 'L', price: 24.99, stock: 100, printful_variant_id: 106 })
    );
  }

  // T-Shirt Dark variants
  const tshirtDark = insertedProducts?.find(p => p.name === 'Unisex T-Shirt Dark');
  if (tshirtDark) {
    variants.push(
      createVariant({ product_id: tshirtDark.id, name: 'Black S', color: 'Black', color_hex: '#000000', size: 'S', price: 24.99, stock: 100, printful_variant_id: 201 }),
      createVariant({ product_id: tshirtDark.id, name: 'Black M', color: 'Black', color_hex: '#000000', size: 'M', price: 24.99, stock: 100, printful_variant_id: 202 }),
      createVariant({ product_id: tshirtDark.id, name: 'Black L', color: 'Black', color_hex: '#000000', size: 'L', price: 24.99, stock: 100, printful_variant_id: 203 }),
      createVariant({ product_id: tshirtDark.id, name: 'Navy S', color: 'Navy', color_hex: '#000080', size: 'S', price: 24.99, stock: 100, printful_variant_id: 204 }),
      createVariant({ product_id: tshirtDark.id, name: 'Navy M', color: 'Navy', color_hex: '#000080', size: 'M', price: 24.99, stock: 100, printful_variant_id: 205 }),
      createVariant({ product_id: tshirtDark.id, name: 'Navy L', color: 'Navy', color_hex: '#000080', size: 'L', price: 24.99, stock: 100, printful_variant_id: 206 })
    );
  }

  // Hoodie Light variants
  const hoodieLight = insertedProducts?.find(p => p.name === 'Unisex Hoodie Light');
  if (hoodieLight) {
    variants.push(
      createVariant({ product_id: hoodieLight.id, name: 'White S', color: 'White', color_hex: '#FFFFFF', size: 'S', price: 39.99, stock: 100, printful_variant_id: 301 }),
      createVariant({ product_id: hoodieLight.id, name: 'White M', color: 'White', color_hex: '#FFFFFF', size: 'M', price: 39.99, stock: 100, printful_variant_id: 302 }),
      createVariant({ product_id: hoodieLight.id, name: 'White L', color: 'White', color_hex: '#FFFFFF', size: 'L', price: 39.99, stock: 100, printful_variant_id: 303 }),
      createVariant({ product_id: hoodieLight.id, name: 'Gray S', color: 'Gray', color_hex: '#808080', size: 'S', price: 39.99, stock: 100, printful_variant_id: 304 }),
      createVariant({ product_id: hoodieLight.id, name: 'Gray M', color: 'Gray', color_hex: '#808080', size: 'M', price: 39.99, stock: 100, printful_variant_id: 305 }),
      createVariant({ product_id: hoodieLight.id, name: 'Gray L', color: 'Gray', color_hex: '#808080', size: 'L', price: 39.99, stock: 100, printful_variant_id: 306 })
    );
  }

  // Hoodie Dark variants
  const hoodieDark = insertedProducts?.find(p => p.name === 'Unisex Hoodie Dark');
  if (hoodieDark) {
    variants.push(
      createVariant({ product_id: hoodieDark.id, name: 'Black S', color: 'Black', color_hex: '#000000', size: 'S', price: 39.99, stock: 100, printful_variant_id: 401 }),
      createVariant({ product_id: hoodieDark.id, name: 'Black M', color: 'Black', color_hex: '#000000', size: 'M', price: 39.99, stock: 100, printful_variant_id: 402 }),
      createVariant({ product_id: hoodieDark.id, name: 'Black L', color: 'Black', color_hex: '#000000', size: 'L', price: 39.99, stock: 100, printful_variant_id: 403 }),
      createVariant({ product_id: hoodieDark.id, name: 'Dark Blue S', color: 'Dark Blue', color_hex: '#00008B', size: 'S', price: 39.99, stock: 100, printful_variant_id: 404 }),
      createVariant({ product_id: hoodieDark.id, name: 'Dark Blue M', color: 'Dark Blue', color_hex: '#00008B', size: 'M', price: 39.99, stock: 100, printful_variant_id: 405 }),
      createVariant({ product_id: hoodieDark.id, name: 'Dark Blue L', color: 'Dark Blue', color_hex: '#00008B', size: 'L', price: 39.99, stock: 100, printful_variant_id: 406 })
    );
  }

  // Cap variants - using the actual colors from cap-variants.ts
  const cap = insertedProducts?.find(p => p.name === 'Reform UK Cap');
  if (cap) {
    variants.push(
      createVariant({ product_id: cap.id, name: 'Cap - Black', color: 'Black', color_hex: '#181717', size: 'One Size', price: 19.99, stock: 100, printful_variant_id: 7854 }),
      createVariant({ product_id: cap.id, name: 'Cap - Navy', color: 'Navy', color_hex: '#182031', size: 'One Size', price: 19.99, stock: 100, printful_variant_id: 7857 }),
      createVariant({ product_id: cap.id, name: 'Cap - Dark Grey', color: 'Dark Grey', color_hex: '#39353a', size: 'One Size', price: 19.99, stock: 100, printful_variant_id: 12736 }),
      createVariant({ product_id: cap.id, name: 'Cap - Khaki', color: 'Khaki', color_hex: '#b49771', size: 'One Size', price: 19.99, stock: 100, printful_variant_id: 7855 }),
      createVariant({ product_id: cap.id, name: 'Cap - Stone', color: 'Stone', color_hex: '#d6bdad', size: 'One Size', price: 19.99, stock: 100, printful_variant_id: 7859 }),
      createVariant({ product_id: cap.id, name: 'Cap - Pink', color: 'Pink', color_hex: '#fab2ba', size: 'One Size', price: 19.99, stock: 100, printful_variant_id: 7858 }),
      createVariant({ product_id: cap.id, name: 'Cap - Light Blue', color: 'Light Blue', color_hex: '#b5cbda', size: 'One Size', price: 19.99, stock: 100, printful_variant_id: 7856 }),
      createVariant({ product_id: cap.id, name: 'Cap - White', color: 'White', color_hex: '#ffffff', size: 'One Size', price: 19.99, stock: 100, printful_variant_id: 7853 })
    );
  }

  // Insert all variants
  const { data: insertedVariants, error: variantError } = await supabase
    .from('product_variants')
    .insert(variants)
    .select();

  if (variantError) {
    console.error('Error inserting variants:', variantError);
    return;
  }

  console.log(`\n✅ Inserted ${insertedVariants?.length} variants`);

  // Now run the check script again
  console.log('\n=== VERIFYING DATA ===\n');
  await checkMergingIssue();
}

async function checkMergingIssue() {
  // Check what products exist now
  const { data: products } = await supabase
    .from('products')
    .select('id, name, category, printful_product_id')
    .order('name');

  console.log('PRODUCTS IN DATABASE:');
  products?.forEach(p => {
    console.log(`  - ${p.name} (ID: ${p.id})`);
  });

  // Check T-Shirt products and their variants
  console.log('\nT-SHIRT PRODUCTS AND VARIANTS:');
  const { data: tshirtProducts } = await supabase
    .from('products')
    .select('id, name')
    .or('name.ilike.%t-shirt%,name.ilike.%tshirt%');

  for (const product of tshirtProducts || []) {
    const { data: variants } = await supabase
      .from('product_variants')
      .select('color, color_hex, size')
      .eq('product_id', product.id)
      .limit(3);
    
    console.log(`  ${product.name}:`);
    variants?.forEach(v => {
      console.log(`    - ${v.color} (${v.color_hex}) / ${v.size}`);
    });
  }

  // Check Hoodie products and their variants
  console.log('\nHOODIE PRODUCTS AND VARIANTS:');
  const { data: hoodieProducts } = await supabase
    .from('products')
    .select('id, name')
    .ilike('name', '%hoodie%');

  for (const product of hoodieProducts || []) {
    const { data: variants } = await supabase
      .from('product_variants')
      .select('color, color_hex, size')
      .eq('product_id', product.id)
      .limit(3);
    
    console.log(`  ${product.name}:`);
    variants?.forEach(v => {
      console.log(`    - ${v.color} (${v.color_hex}) / ${v.size}`);
    });
  }

  // Check Cap variants
  console.log('\nCAP VARIANTS:');
  const { data: capProduct } = await supabase
    .from('products')
    .select('id, name')
    .ilike('name', '%cap%')
    .maybeSingle();

  if (capProduct) {
    const { data: capVariants } = await supabase
      .from('product_variants')
      .select('color, color_hex')
      .eq('product_id', capProduct.id);

    console.log(`  ${capProduct.name}:`);
    capVariants?.forEach(v => {
      console.log(`    - ${v.color}: ${v.color_hex}`);
    });
  }
}

populateTestProducts().catch(console.error);