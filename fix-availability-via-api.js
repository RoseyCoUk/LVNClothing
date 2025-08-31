// Fix Availability Data via API
// This script corrects the availability status that was incorrectly set during testing

const SUPABASE_URL = 'https://nsmrxwnrtsllxvplazmm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zbXJ4d25ydHlsbHh2cGxhem1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0OTY0NTIsImV4cCI6MjA2NzA3MjQ1Mn0.XyHiuQHXW_laGE4Caond1-8xK-2B4NzDzIOX8baD4UM';

async function fixAvailabilityData() {
    try {
        console.log('🔧 Starting availability data fix...');
        
        // Step 1: Get current status
        console.log('📊 Step 1: Checking current availability status...');
        const statusResponse = await fetch(`${SUPABASE_URL}/rest/v1/product_variants?select=id,is_available,in_stock`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!statusResponse.ok) {
            throw new Error(`Failed to fetch status: ${statusResponse.status}`);
        }
        
        const variants = await statusResponse.json();
        console.log(`📊 Total variants: ${variants.length}`);
        
        const availableVariants = variants.filter(v => v.is_available === true).length;
        const unavailableVariants = variants.filter(v => v.is_available === false).length;
        const inStockVariants = variants.filter(v => v.in_stock === true).length;
        const outOfStockVariants = variants.filter(v => v.in_stock === false).length;
        
        console.log(`📊 Before fix:`);
        console.log(`   - Available: ${availableVariants}`);
        console.log(`   - Unavailable: ${unavailableVariants}`);
        console.log(`   - In Stock: ${inStockVariants}`);
        console.log(`   - Out of Stock: ${outOfStockVariants}`);
        
        // Step 2: Find variants that need fixing
        const needsFix = variants.filter(v => 
            (v.is_available === false && v.in_stock === true) ||
            (v.is_available === true && v.in_stock === false)
        );
        
        console.log(`🔧 Variants that need fixing: ${needsFix.length}`);
        
        if (needsFix.length === 0) {
            console.log('✅ No variants need fixing!');
            return;
        }
        
        // Step 3: Fix variants that are incorrectly marked as unavailable but are in stock
        const incorrectlyUnavailable = variants.filter(v => v.is_available === false && v.in_stock === true);
        console.log(`🔧 Fixing ${incorrectlyUnavailable.length} variants marked as unavailable but in stock...`);
        
        if (incorrectlyUnavailable.length > 0) {
            const fixResponse = await fetch(`${SUPABASE_URL}/rest/v1/product_variants`, {
                method: 'PATCH',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'resolution=merge-duplicates'
                },
                body: JSON.stringify({
                    is_available: true,
                    updated_at: new Date().toISOString()
                })
            });
            
            if (!fixResponse.ok) {
                throw new Error(`Failed to fix availability: ${fixResponse.status}`);
            }
            
            console.log('✅ Availability fixed successfully!');
        }
        
        // Step 4: Fix variants that are incorrectly marked as out of stock but are available
        const incorrectlyOutOfStock = variants.filter(v => v.is_available === true && v.in_stock === false);
        console.log(`🔧 Fixing ${incorrectlyOutOfStock.length} variants marked as out of stock but available...`);
        
        if (incorrectlyOutOfStock.length > 0) {
            const fixResponse = await fetch(`${SUPABASE_URL}/rest/v1/product_variants`, {
                method: 'PATCH',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'resolution=merge-duplicates'
                },
                body: JSON.stringify({
                    in_stock: true,
                    updated_at: new Date().toISOString()
                })
            });
            
            if (!fixResponse.ok) {
                throw new Error(`Failed to fix stock status: ${fixResponse.status}`);
            }
            
            console.log('✅ Stock status fixed successfully!');
        }
        
        // Step 5: Verify the fixes
        console.log('📊 Step 5: Verifying fixes...');
        const verifyResponse = await fetch(`${SUPABASE_URL}/rest/v1/product_variants?select=id,is_available,in_stock`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!verifyResponse.ok) {
            throw new Error(`Failed to verify: ${verifyResponse.status}`);
        }
        
        const fixedVariants = await verifyResponse.json();
        const fixedAvailableVariants = fixedVariants.filter(v => v.is_available === true).length;
        const fixedUnavailableVariants = fixedVariants.filter(v => v.is_available === false).length;
        const fixedInStockVariants = fixedVariants.filter(v => v.in_stock === true).length;
        const fixedOutOfStockVariants = fixedVariants.filter(v => v.in_stock === false).length;
        
        console.log(`📊 After fix:`);
        console.log(`   - Available: ${fixedAvailableVariants}`);
        console.log(`   - Unavailable: ${fixedUnavailableVariants}`);
        console.log(`   - In Stock: ${fixedInStockVariants}`);
        console.log(`   - Out of Stock: ${fixedOutOfStockVariants}`);
        
        // Step 6: Check for remaining issues
        const remainingIssues = fixedVariants.filter(v => 
            (v.is_available === false && v.in_stock === true) ||
            (v.is_available === true && v.in_stock === false)
        );
        
        if (remainingIssues.length === 0) {
            console.log('🎉 All availability issues fixed successfully!');
        } else {
            console.log(`⚠️  ${remainingIssues.length} issues remain. Manual review may be needed.`);
        }
        
    } catch (error) {
        console.error('❌ Error fixing availability data:', error);
    }
}

// Run the fix
fixAvailabilityData();
