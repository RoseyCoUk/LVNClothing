#!/bin/bash

# Deploy Printful Sync Edge Function
# This script deploys the printful-sync function to Supabase

echo "🚀 Deploying Printful Sync Edge Function..."

# Check if we're in the right directory
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Error: Supabase CLI is not installed"
    echo "Please install it first: https://supabase.com/docs/guides/cli"
    exit 1
fi

# Check if we're logged in to Supabase
if ! supabase status &> /dev/null; then
    echo "❌ Error: Not logged in to Supabase"
    echo "Please run: supabase login"
    exit 1
fi

# Deploy the function
echo "📦 Deploying printful-sync function..."
supabase functions deploy printful-sync

if [ $? -eq 0 ]; then
    echo "✅ Printful Sync function deployed successfully!"
    echo ""
    echo "🔧 Next steps:"
    echo "1. Set the PRINTFUL_TOKEN secret in Supabase:"
    echo "   supabase secrets set PRINTFUL_TOKEN=your_token_here"
    echo ""
    echo "2. Test the function:"
    echo "   curl -X POST https://your-project.supabase.co/functions/v1/printful-sync \\"
    echo "     -H 'Content-Type: application/json' \\"
    echo "     -H 'Authorization: Bearer your_anon_key' \\"
    echo "     -d '{\"productId\": \"test-product\", \"action\": \"full_sync\"}'"
    echo ""
    echo "3. The function is now available at:"
    echo "   https://your-project.supabase.co/functions/v1/printful-sync"
else
    echo "❌ Error: Failed to deploy printful-sync function"
    exit 1
fi

echo ""
echo "🎉 Deployment complete!"
