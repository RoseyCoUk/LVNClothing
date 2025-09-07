#!/usr/bin/env -S deno run --allow-env --allow-net

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Initialize Supabase client
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function queryTableStructure() {
  console.log('🔍 Analyzing product_variants table structure...\n')

  // Query table structure
  const { data: columns, error: columnError } = await supabase.rpc('get_table_columns', {
    table_name: 'product_variants'
  })

  if (columnError) {
    // Alternative approach - directly query information_schema
    console.log('📋 Querying table structure from information_schema...')
    
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'product_variants')
      .eq('table_schema', 'public')
      .order('ordinal_position')

    if (error) {
      console.error('❌ Error querying table structure:', error)
      return
    }

    console.log('📊 Current product_variants table structure:')
    console.table(data)
  }

  // Query sample data to understand the current structure
  console.log('\n📦 Querying sample product_variants data...')
  
  const { data: sampleData, error: sampleError } = await supabase
    .from('product_variants')
    .select('*')
    .limit(5)

  if (sampleError) {
    console.error('❌ Error querying sample data:', error)
    return
  }

  console.log('📋 Sample product_variants data:')
  if (sampleData && sampleData.length > 0) {
    console.log('First record structure:')
    console.log(JSON.stringify(sampleData[0], null, 2))
    
    console.log('\nAll sample records:')
    console.table(sampleData.map(record => ({
      id: record.id,
      product_id: record.product_id,
      printful_variant_id: record.printful_variant_id,
      color: record.color,
      size: record.size,
      retail_price: record.retail_price,
      in_stock: record.in_stock,
      is_available: record.is_available
    })))
  } else {
    console.log('No sample data found')
  }

  // Check for any existing catalog_variant_id column
  const { data: catalogColumnCheck, error: catalogError } = await supabase
    .from('product_variants')
    .select('catalog_variant_id')
    .limit(1)

  if (catalogError) {
    console.log('\n📋 No catalog_variant_id column found (expected)')
  } else {
    console.log('\n⚠️ catalog_variant_id column already exists!')
  }

  console.log('\n✅ Analysis complete.')
}

// Run the function
if (import.meta.main) {
  await queryTableStructure()
}