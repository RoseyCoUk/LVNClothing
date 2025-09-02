import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeSQL(sql: string) {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
      },
      body: JSON.stringify({ sql })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ SQL execution failed:', response.status, errorData);
      return false;
    }

    const result = await response.text();
    console.log('✅ SQL executed successfully');
    return true;
  } catch (error) {
    console.error('❌ Error executing SQL:', error);
    return false;
  }
}

async function alterTablesDirectly() {
  console.log('🔧 Altering tables directly...');
  
  const alterCommands = [
    'ALTER TABLE public.products ADD COLUMN IF NOT EXISTS printful_sync_product_id INTEGER',
    'ALTER TABLE public.products ADD COLUMN IF NOT EXISTS printful_cost DECIMAL(10,2)',
    'ALTER TABLE public.products ADD COLUMN IF NOT EXISTS margin DECIMAL(10,2)',
    'ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true',
    'CREATE INDEX IF NOT EXISTS idx_products_sync_id ON public.products(printful_sync_product_id)',
    'CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active)'
  ];

  for (const command of alterCommands) {
    console.log(`Executing: ${command.substring(0, 50)}...`);
    
    // Try using the internal Supabase REST API
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Accept': 'application/vnd.pgrst.object+json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ sql: command })
      });

      if (response.ok) {
        console.log('  ✅ Command executed');
      } else {
        console.log('  ⚠️ Command may have failed, continuing...');
      }
    } catch (error) {
      console.log('  ⚠️ Error with command, continuing...');
    }
  }
}

// Let's try a more direct approach - create the variant table manually using table operations
async function setupVariantTable() {
  console.log('🔧 Setting up product_variants table...');
  
  // First, try to create a test variant to see table structure
  const testVariant = {
    id: '00000000-0000-0000-0000-000000000001',
    product_id: '00000000-0000-0000-0000-000000000001',
    printful_variant_id: 'test',
    name: 'test',
    value: 'test',
    color: 'test',
    size: 'test',
    price: 0,
    in_stock: true,
    is_available: true
  };

  const { error: insertError } = await supabase
    .from('product_variants')
    .insert([testVariant]);

  if (insertError) {
    console.error('❌ Cannot insert into product_variants:', insertError.message);
    
    if (insertError.message.includes('does not exist')) {
      console.log('⚠️ product_variants table does not exist. This is expected from the migration issues.');
      return false;
    }
  } else {
    // Clean up test data
    await supabase
      .from('product_variants')
      .delete()
      .eq('id', testVariant.id);
    
    console.log('✅ product_variants table structure is working');
    return true;
  }

  return false;
}

async function checkProductsTable() {
  console.log('🔍 Checking products table structure...');
  
  // Try to get table info by attempting an insert with all fields
  const testProduct = {
    name: 'Test Product',
    price: 10.99,
    category: 'test',
    printful_sync_product_id: 123456,
    printful_cost: 5.99,
    margin: 5.00,
    is_active: false
  };

  const { data, error } = await supabase
    .from('products')
    .insert([testProduct])
    .select()
    .single();

  if (error) {
    console.error('❌ Products table structure issue:', error.message);
    
    if (error.message.includes('printful_sync_product_id')) {
      console.log('⚠️ Missing printful_sync_product_id column');
    }
    if (error.message.includes('printful_cost')) {
      console.log('⚠️ Missing printful_cost column');  
    }
    if (error.message.includes('margin')) {
      console.log('⚠️ Missing margin column');
    }
    if (error.message.includes('is_active')) {
      console.log('⚠️ Missing is_active column');
    }
    return false;
  } else {
    // Clean up test product
    await supabase
      .from('products')
      .delete()
      .eq('id', data.id);
    
    console.log('✅ Products table structure is complete');
    return true;
  }
}

async function main() {
  const productsReady = await checkProductsTable();
  
  if (!productsReady) {
    console.log('❌ Products table needs schema updates');
    await alterTablesDirectly();
    
    // Check again
    const productsReadyAfter = await checkProductsTable();
    if (!productsReadyAfter) {
      console.log('❌ Unable to fix products table structure');
      return;
    }
  }

  const variantsReady = await setupVariantTable();
  
  if (productsReady && variantsReady) {
    console.log('\n🎉 Database schema is ready for data sync!');
  } else {
    console.log('\n⚠️ Schema has some issues but we can try to proceed with data sync');
  }
}

main().catch(console.error);