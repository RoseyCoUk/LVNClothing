#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function queryTableStructure() {
  console.log('🔍 Analyzing product_variants table structure...\n')

  // Query sample data to understand the current structure
  console.log('📦 Querying sample product_variants data...')
  
  const { data: sampleData, error: sampleError } = await supabase
    .from('product_variants')
    .select('*')
    .limit(5)

  if (sampleError) {
    console.error('❌ Error querying sample data:', sampleError)
    return
  }

  console.log('📋 Sample product_variants data:')
  if (sampleData && sampleData.length > 0) {
    console.log('First record structure:')
    console.log(JSON.stringify(sampleData[0], null, 2))
    
    console.log('\nAll sample records:')
    sampleData.forEach((record, index) => {
      console.log(`Record ${index + 1}:`, {
        id: record.id,
        product_id: record.product_id,
        printful_variant_id: record.printful_variant_id,
        color: record.color,
        size: record.size,
        retail_price: record.retail_price,
        in_stock: record.in_stock,
        is_available: record.is_available,
        available: record.available,
        stock: record.stock,
        printful_data: record.printful_data ? 'exists' : 'null'
      })
    })
  } else {
    console.log('No sample data found')
  }

  // Check for any existing catalog_variant_id column
  const { data: catalogColumnCheck, error: catalogError } = await supabase
    .from('product_variants')
    .select('catalog_variant_id')
    .limit(1)

  if (catalogError && catalogError.code === '42703') {
    console.log('\n📋 No catalog_variant_id column found (expected)')
  } else if (catalogError) {
    console.log('\n❌ Error checking catalog_variant_id column:', catalogError)
  } else {
    console.log('\n⚠️ catalog_variant_id column already exists!')
  }

  // Check current product variants count
  const { count, error: countError } = await supabase
    .from('product_variants')
    .select('*', { count: 'exact', head: true })

  if (countError) {
    console.error('❌ Error counting variants:', countError)
  } else {
    console.log(`\n📊 Total product variants: ${count}`)
  }

  console.log('\n✅ Analysis complete.')
}

// Run the function
queryTableStructure().catch(console.error)