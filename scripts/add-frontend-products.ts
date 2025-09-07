#!/usr/bin/env npx tsx

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
);

async function addFrontendProducts() {
  console.log('🚀 Adding frontend-expected products to database\n');

  // Clear existing products first
  await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // Add all products the frontend expects
  const products = [
    // Individual Products
    {
      name: 'Reform UK T-Shirt',
      slug: 'reform-uk-tshirt',
      description: 'Premium quality T-shirt with Reform UK branding',
      price: 24.99,
      category: 'apparel',
      tags: ['bestseller'],
      image_url: '/Tshirt/Men/ReformMenTshirtCharcoal1.webp',
      printful_product_id: '390637999',
      is_available: true,
      in_stock: true,
      stock_count: 100
    },
    {
      name: 'Reform UK Hoodie',
      slug: 'reform-uk-hoodie',
      description: 'Comfortable hoodie with Reform UK logo',
      price: 39.99,
      category: 'apparel',
      tags: ['bestseller'],
      image_url: '/Hoodie/Men/ReformMenHoodieBlack1.webp',
      printful_product_id: '390637302',
      is_available: true,
      in_stock: true,
      stock_count: 100
    },
    {
      name: 'Reform UK Cap',
      slug: 'reform-uk-cap',
      description: 'Adjustable cap with Reform UK branding',
      price: 19.99,
      category: 'apparel',
      tags: ['bestseller'],
      image_url: '/Cap/ReformCapBlue1.webp',
      printful_product_id: '390637627',
      is_available: true,
      in_stock: true,
      stock_count: 100
    },
    {
      name: 'Reform UK Tote Bag',
      slug: 'reform-uk-tote-bag',
      description: 'Eco-friendly tote bag',
      price: 14.99,
      category: 'gear',
      tags: ['bestseller'],
      image_url: '/StickerToteWater/ReformToteBagBlack1.webp',
      printful_product_id: '390637628',
      is_available: true,
      in_stock: true,
      stock_count: 100
    },
    {
      name: 'Reform UK Water Bottle',
      slug: 'reform-uk-water-bottle',
      description: 'Reusable water bottle',
      price: 24.99,
      category: 'gear',
      tags: ['bestseller'],
      image_url: '/StickerToteWater/ReformWaterBottleWhite1.webp',
      printful_product_id: '390637629',
      is_available: true,
      in_stock: true,
      stock_count: 100
    },
    {
      name: 'Reform UK Mug',
      slug: 'reform-uk-mug',
      description: 'Ceramic mug with Reform UK logo',
      price: 14.99,
      category: 'gear',
      tags: ['bestseller'],
      image_url: '/MugMouse/ReformMug1.webp',
      printful_product_id: '390637630',
      is_available: true,
      in_stock: true,
      stock_count: 100
    },
    {
      name: 'Reform UK Mouse Pad',
      slug: 'reform-uk-mouse-pad',
      description: 'Mouse pad with Reform UK branding',
      price: 12.99,
      category: 'gear',
      tags: ['bestseller'],
      image_url: '/MugMouse/ReformMousePadWhite1.webp',
      printful_product_id: '390637631',
      is_available: true,
      in_stock: true,
      stock_count: 100
    },
    // Bundle Products
    {
      name: 'Starter Bundle',
      slug: 'starter-bundle',
      description: 'Perfect starter pack - T-shirt, Cap & Mug',
      price: 49.99,
      category: 'bundle',
      tags: ['bundle', 'discount'],
      image_url: '/bundles/starter-bundle.webp',
      printful_product_id: null,
      is_available: true,
      in_stock: true,
      stock_count: 100
    },
    {
      name: 'Champion Bundle',
      slug: 'champion-bundle',
      description: 'Champion pack - Hoodie, T-shirt, Cap & Tote Bag',
      price: 89.99,
      category: 'bundle',
      tags: ['bundle', 'bestseller', 'discount'],
      image_url: '/bundles/champion-bundle.webp',
      printful_product_id: null,
      is_available: true,
      in_stock: true,
      stock_count: 100
    },
    {
      name: 'Activist Bundle',
      slug: 'activist-bundle',
      description: 'Complete activist pack - All essentials included',
      price: 149.99,
      category: 'bundle',
      tags: ['bundle', 'premium', 'discount'],
      image_url: '/bundles/activist-bundle.webp',
      printful_product_id: null,
      is_available: true,
      in_stock: true,
      stock_count: 100
    }
  ];

  // Insert products
  const { data: insertedProducts, error } = await supabase
    .from('products')
    .insert(products)
    .select();

  if (error) {
    console.error('❌ Error inserting products:', error);
    return;
  }

  console.log('✅ Successfully added', insertedProducts?.length, 'products\n');

  // List all products
  const { data: allProducts } = await supabase
    .from('products')
    .select('name, slug, price, category, is_available')
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  if (allProducts) {
    console.log('📦 Products in database:\n');
    let currentCategory = '';
    allProducts.forEach(p => {
      if (p.category !== currentCategory) {
        currentCategory = p.category;
        console.log(`\n${currentCategory.toUpperCase()}:`);
      }
      console.log(`  - ${p.name} (${p.slug}) - £${p.price} ${p.is_available ? '✅' : '❌'}`);
    });
  }

  console.log('\n✨ Database populated successfully!');
}

addFrontendProducts().catch(console.error);