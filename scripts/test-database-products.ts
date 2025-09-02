#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';

// Environment variables (these should match your .env file)
const supabaseUrl = 'https://nsmrxwnrtsllxvplazmm.supabase.co'; // Replace with your actual URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zbXJ4d25ydHNsbHh2cGxhem1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUwNDMwMzQsImV4cCI6MjA1MDYxOTAzNH0.JH4Y7gKyHDuZQ3eL4HyiX8xJ_TIL3oXV5bIUvTJmwTM'; // Replace with your actual anon key

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDatabase() {
  console.log('🔍 Testing database connection...\n');
  
  try {
    // Test products table
    console.log('📦 Checking products table...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, category')
      .limit(5);
      
    if (productsError) {
      console.error('❌ Products error:', productsError.message);
    } else {
      console.log(`✅ Found ${products?.length || 0} products:`);
      products?.forEach(p => console.log(`  - ${p.name} (${p.category})`));
    }
    
    console.log('');
    
    // Test product_variants table
    console.log('🎯 Checking product_variants table...');
    const { data: variants, error: variantsError } = await supabase
      .from('product_variants')
      .select('id, name, printful_variant_id, price, color, size')
      .limit(5);
      
    if (variantsError) {
      console.error('❌ Variants error:', variantsError.message);
    } else {
      console.log(`✅ Found ${variants?.length || 0} variants:`);
      variants?.forEach(v => console.log(`  - ${v.name} | ID: ${v.printful_variant_id} | £${v.price} | ${v.color} ${v.size}`));
    }
    
  } catch (error) {
    console.error('❌ Connection error:', error);
  }
}

testDatabase();