#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkProductVariantsSchema() {
  console.log('🔍 Checking product_variants table schema...\n');

  // Query using SQL to get column details
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'product_variants'
        AND table_schema = 'public'
      ORDER BY ordinal_position;
    `
  });

  if (error) {
    console.error('❌ Error querying schema:', error);
    return;
  }

  console.log('📊 product_variants table columns:');
  console.table(data);
}

// Run the check
checkProductVariantsSchema().catch(console.error);