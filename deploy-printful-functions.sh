#!/bin/bash

echo "🚀 Deploying new Printful functions to Supabase..."

# Deploy the direct import function
echo "📦 Deploying printful-direct-import function..."
supabase functions deploy printful-direct-import --project-ref nsmrxwnrtsllxvplazmm

# Deploy the availability sync function
echo "📦 Deploying printful-sync-availability function..."
supabase functions deploy printful-sync-availability --project-ref nsmrxwnrtsllxvplazmm

echo "✅ Deployment complete!"
echo ""
echo "🎯 New functions available:"
echo "  - /functions/v1/printful-direct-import"
echo "  - /functions/v1/printful-sync-availability"
echo ""
echo "💡 You can now use these functions from the Admin Products page:"
echo "  1. Click 'Direct Import' to import all products from manual data"
echo "  2. Click 'Sync Availability' to update product availability"
echo "  3. Use 'Pull All from Printful' for API-based imports (if CORS is fixed)"
