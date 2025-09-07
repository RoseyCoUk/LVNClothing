/**
 * Check Orders Table Schema
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://nsmrxwnrtsllxvplazmm.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zbXJ4d25ydHNsbHh2cGxhem1tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTQ5NjQ1MiwiZXhwIjoyMDY3MDcyNDUyfQ.hmKiDQ2LocnHf59nVJYB5_YHnH3W6bdeMl2Px3xFpPw';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkOrdersSchema() {
  console.log('🔄 Checking orders table schema...');
  
  // Try to get column information
  const { data, error } = await supabase
    .rpc('exec_sql', {
      query: `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'orders' 
        ORDER BY ordinal_position;
      `
    });

  if (error) {
    console.log('Using alternative method...');
    
    // Try a simple select to see what columns exist
    const { data: sampleData, error: selectError } = await supabase
      .from('orders')
      .select('*')
      .limit(1);
      
    if (selectError) {
      console.error('❌ Error querying orders table:', selectError);
    } else {
      console.log('✅ Orders table exists');
      if (sampleData && sampleData.length > 0) {
        console.log('Sample order columns:', Object.keys(sampleData[0]));
      } else {
        console.log('Table is empty, trying to insert a test record to see the expected schema...');
      }
    }
  } else {
    console.log('✅ Orders table schema:');
    console.table(data);
  }
}

checkOrdersSchema().catch(console.error);