#!/bin/bash

# Deploy the stripe-webhook2 function with the bundle variant fix

echo "🚀 Deploying stripe-webhook2 with bundle variant fix..."
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Error: Must run from project root directory"
    exit 1
fi

# Deploy the webhook function
echo "📦 Deploying stripe-webhook2 function..."
supabase functions deploy stripe-webhook2

if [ $? -eq 0 ]; then
    echo "✅ Webhook deployed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Test with a real bundle order"
    echo "2. Monitor logs for 'Using customer-selected variant ID' messages"
    echo "3. Verify Printful receives correct variant IDs"
    echo ""
    echo "🔍 To view logs:"
    echo "   supabase functions logs stripe-webhook2 --tail"
else
    echo "❌ Deployment failed!"
    exit 1
fi