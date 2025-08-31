#!/bin/bash

# Test script for Printful webhooks
# This script tests the webhook endpoint and shows current webhook status

echo "🧪 Testing Printful Webhooks..."
echo ""

# Configuration
PRINTFUL_API_KEY="dHfrvwWHc1abLufS0xz4EEEqgE0XboN7cDMX24mB"

# Check if API key is set
if [ "$PRINTFUL_API_KEY" = "YOUR_PRINTFUL_API_KEY_HERE" ]; then
    echo "❌ ERROR: Please set your Printful API key in this script first!"
    echo ""
    echo "To get your API key:"
    echo "1. Go to Printful Dashboard → Developers → Your tokens"
    echo "2. Copy the token value (not the name)"
    echo "3. Replace 'YOUR_PRINTFUL_API_KEY_HERE' in this script"
    echo ""
    exit 1
fi

echo "📡 Testing 1: Current Webhook Configuration"
echo "----------------------------------------"
curl -s -X GET 'https://api.printful.com/webhooks' \
  -H "Authorization: Bearer $PRINTFUL_API_KEY" | jq '.'

echo ""
echo ""

echo "🧪 Testing 2: Webhook Endpoint Response"
echo "--------------------------------------"
curl -X POST 'https://nsmrxwnrtsllxvplazmm.supabase.co/functions/v1/printful-inventory-sync?webhook=true' \
  -H 'Content-Type: application/json' \
  -d '{
    "type": "stock_updated",
    "created": 1622456737,
    "retries": 0,
    "store": 1,
    "data": {
      "product_id": 9001,
      "variant_stock": {
        "68a9daac4dcb25": false
      }
    }
  }'

echo ""
echo ""

echo "🧪 Testing 3: Manual Inventory Sync"
echo "----------------------------------"
curl -X POST 'https://nsmrxwnrtsllxvplazmm.supabase.co/functions/v1/printful-inventory-sync' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zbXJ4d25ydHNsbHh2cGxhem1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0OTY0NTIsImV4cCI6MjA2NzA3MjQ1Mn0.XyHiuQHXW_laGE4Caond1-8xK-2B4NzDzIOX8baD4UM'

echo ""
echo ""
echo "✅ Webhook testing complete!"
echo ""
echo "Expected results:"
echo "1. Current webhook config should show your webhook URL"
echo "2. Webhook endpoint should respond with success"
echo "3. Manual sync should update 158 variants"
echo ""
echo "If any test fails, check:"
echo "- Printful API key is correct"
echo "- Webhook URL is accessible"
echo "- Supabase function is deployed"
