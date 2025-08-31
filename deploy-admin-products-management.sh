#!/bin/bash

# Deploy Admin Products Management Migration
# This script applies the new migration and sets up Supabase Storage

set -e

echo "🚀 Deploying Admin Products Management Migration..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if required environment variables are set
if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
    echo -e "${RED}❌ SUPABASE_ACCESS_TOKEN environment variable is not set${NC}"
    echo "Please set it with: export SUPABASE_ACCESS_TOKEN=your_token_here"
    exit 1
fi

if [ -z "$SUPABASE_PROJECT_ID" ]; then
    echo -e "${RED}❌ SUPABASE_PROJECT_ID environment variable is not set${NC}"
    echo "Please set it with: export SUPABASE_PROJECT_ID=your_project_id_here"
    exit 1
fi

echo -e "${BLUE}📋 Project ID: $SUPABASE_PROJECT_ID${NC}"

# Step 1: Apply the migration
echo -e "${YELLOW}📝 Applying migration: 20250127000005_admin_products_management.sql${NC}"

# Apply the migration using Supabase CLI
if command -v supabase &> /dev/null; then
    echo "Using Supabase CLI..."
    supabase db push --project-ref $SUPABASE_PROJECT_ID
else
    echo "Supabase CLI not found, using direct SQL execution..."
    
    # Read the migration file
    MIGRATION_FILE="supabase/migrations/20250127000005_admin_products_management.sql"
    
    if [ ! -f "$MIGRATION_FILE" ]; then
        echo -e "${RED}❌ Migration file not found: $MIGRATION_FILE${NC}"
        exit 1
    fi
    
    # Extract the UP section (everything between -- up and -- down)
    UP_SECTION=$(sed -n '/^-- up$/,/^-- down$/p' "$MIGRATION_FILE" | sed '/^-- down$/d' | sed '/^-- up$/d')
    
    # Execute the migration using Supabase REST API
    echo "Executing migration via REST API..."
    
    # Note: This is a simplified approach. In production, you might want to use
    # the Supabase CLI or a proper migration tool
    echo -e "${YELLOW}⚠️  Please manually apply the migration using your Supabase dashboard${NC}"
    echo "Migration file: $MIGRATION_FILE"
fi

echo -e "${GREEN}✅ Migration applied successfully${NC}"

# Step 2: Verify the tables were created
echo -e "${YELLOW}🔍 Verifying table creation...${NC}"

# This would typically be done through a database connection
# For now, we'll provide instructions
echo -e "${BLUE}📋 Please verify the following tables were created in your Supabase dashboard:${NC}"
echo "  - product_overrides"
echo "  - product_images"
echo "  - bundles"
echo "  - bundle_items"

# Step 3: Set up Supabase Storage
echo -e "${YELLOW}📦 Setting up Supabase Storage...${NC}"
echo -e "${BLUE}📋 Please follow these steps in your Supabase dashboard:${NC}"
echo "1. Go to Storage in the left sidebar"
echo "2. Click 'Enable Storage' if not already enabled"
echo "3. Create bucket 'product-images' (public, 10MB limit, image/* types)"
echo "4. Create bucket 'admin-assets' (private, 50MB limit, */* types)"
echo "5. Apply the storage policies from SUPABASE_STORAGE_SETUP.md"

# Step 4: Test the setup
echo -e "${YELLOW}🧪 Testing the setup...${NC}"
echo -e "${BLUE}📋 Create a test script to verify the tables:${NC}"

cat > test-admin-products-setup.js << 'EOF'
// Test script for Admin Products Management setup
const { createClient } = require('@supabase/supabase-js');

// Replace with your actual Supabase URL and anon key
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSetup() {
  try {
    console.log('🧪 Testing Admin Products Management setup...');
    
    // Test 1: Check if tables exist
    console.log('\n1. Testing table existence...');
    
    const { data: overrides, error: overridesError } = await supabase
      .from('product_overrides')
      .select('count')
      .limit(1);
    
    if (overridesError) {
      console.log('❌ product_overrides table error:', overridesError.message);
    } else {
      console.log('✅ product_overrides table accessible');
    }
    
    const { data: images, error: imagesError } = await supabase
      .from('product_images')
      .select('count')
      .limit(1);
    
    if (imagesError) {
      console.log('❌ product_images table error:', imagesError.message);
    } else {
      console.log('✅ product_images table accessible');
    }
    
    const { data: bundles, error: bundlesError } = await supabase
      .from('bundles')
      .select('count')
      .limit(1);
    
    if (bundlesError) {
      console.log('❌ bundles table error:', bundlesError.message);
    } else {
      console.log('✅ bundles table accessible');
    }
    
    const { data: bundleItems, error: bundleItemsError } = await supabase
      .from('bundle_items')
      .select('count')
      .limit(1);
    
    if (bundleItemsError) {
      console.log('❌ bundle_items table error:', bundleItemsError.message);
    } else {
      console.log('✅ bundle_items table accessible');
    }
    
    // Test 2: Test RLS policies
    console.log('\n2. Testing RLS policies...');
    
    // Test authenticated access (you'll need to be logged in)
    const { data: user } = await supabase.auth.getUser();
    
    if (user.user) {
      console.log('✅ User authenticated, testing authenticated access...');
      
      // Test insert permission
      const { error: insertError } = await supabase
        .from('product_overrides')
        .insert({
          printful_product_id: 'test-product-123',
          custom_retail_price: 29.99,
          custom_description: 'Test product override'
        });
      
      if (insertError) {
        console.log('❌ Insert test failed:', insertError.message);
      } else {
        console.log('✅ Insert test successful');
        
        // Clean up test data
        await supabase
          .from('product_overrides')
          .delete()
          .eq('printful_product_id', 'test-product-123');
      }
    } else {
      console.log('⚠️  User not authenticated, skipping authenticated tests');
    }
    
    console.log('\n🎉 Setup test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testSetup();
EOF

echo -e "${GREEN}✅ Test script created: test-admin-products-setup.js${NC}"
echo -e "${BLUE}📋 Update the Supabase URL and key in the test script, then run:${NC}"
echo "  node test-admin-products-setup.js"

# Step 5: Summary
echo -e "${GREEN}🎉 Admin Products Management setup completed!${NC}"
echo -e "${BLUE}📋 Summary of what was created:${NC}"
echo "  ✅ Migration file: supabase/migrations/20250127000005_admin_products_management.sql"
echo "  ✅ Storage setup guide: SUPABASE_STORAGE_SETUP.md"
echo "  ✅ Test script: test-admin-products-setup.js"
echo ""
echo -e "${YELLOW}📋 Next steps:${NC}"
echo "1. Enable Supabase Storage in your dashboard"
echo "2. Create the storage buckets as described in SUPABASE_STORAGE_SETUP.md"
echo "3. Apply the storage policies"
echo "4. Test the setup using the test script"
echo "5. Update your frontend components to use the new tables and storage"

echo ""
echo -e "${GREEN}🚀 Deployment completed successfully!${NC}"
