#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStructure() {
  try {
    console.log('🔍 Checking product_variants table structure...');
    
    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .limit(1);

    if (error) {
      throw error;
    }

    if (data && data.length > 0) {
      console.log('📋 Available columns:');
      Object.keys(data[0]).forEach(col => {
        console.log(`   - ${col}: ${typeof data[0][col as keyof typeof data[0]]}`);
      });
    } else {
      console.log('📋 No data found in table');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkTableStructure();
