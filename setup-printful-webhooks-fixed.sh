#!/bin/bash

# Setup script for Printful webhooks via API (Fixed Version)
# This script configures webhooks for real-time inventory updates

echo "Setting up Printful webhooks via API (Fixed Version)..."
echo ""

# Configuration
WEBHOOK_URL="https://nsmrxwnrtsllxvplazmm.supabase.co/functions/v1/printful-inventory-sync?webhook=true"
PRINTFUL_API_KEY="dHfrvwWHc1abLufS0xz4EEEqgE0XboN7cDMX24mB"

echo "Webhook URL: $WEBHOOK_URL"
echo ""

echo "Setting up webhook with these events:"
echo "- product_updated"
echo "- product_synced"
echo ""
echo "Note: stock_updated requires specific product IDs, so we'll set it up separately"
echo ""

# Create webhook configuration (without stock_updated for now)
echo "Creating webhook configuration..."
curl -X POST 'https://api.printful.com/webhooks' \
  -H "Authorization: Bearer $PRINTFUL_API_KEY" \
  -H 'Content-Type: application/json' \
  -d "{
    \"url\": \"$WEBHOOK_URL\",
    \"types\": [
      \"product_updated\",
      \"product_synced\"
    ]
  }"

echo ""
echo ""

# Now let's set up stock_updated webhook with specific product IDs
echo "Setting up stock_updated webhook with your product IDs..."
echo ""

# Get your products first to get the IDs
echo "Fetching your products to get IDs for stock monitoring..."
PRODUCTS_RESPONSE=$(curl -s -X GET 'https://api.printful.com/sync/products' \
  -H "Authorization: Bearer $PRINTFUL_API_KEY")

echo "Products found:"
echo "$PRODUCTS_RESPONSE" | jq '.result[] | {id: .id, name: .name}' 2>/dev/null || echo "$PRODUCTS_RESPONSE"

echo ""
echo "Now setting up stock_updated webhook with product monitoring..."
curl -X POST 'https://api.printful.com/webhooks' \
  -H "Authorization: Bearer $PRINTFUL_API_KEY" \
  -H 'Content-Type: application/json' \
  -d "{
    \"url\": \"$WEBHOOK_URL\",
    \"types\": [
      \"product_updated\",
      \"product_synced\",
      \"stock_updated\"
    ],
    \"params\": {
      \"stock_updated\": {}
    }
  }"

echo ""
echo ""
echo "✅ Webhook setup complete!"
echo ""
echo "To verify the webhook is working:"
echo "1. Check Printful API response above"
echo "2. Test with: ./test-printful-webhooks.sh"
echo "3. Use Printful Webhook Simulator with URL: $WEBHOOK_URL"
echo ""
echo "To view current webhook config:"
echo "curl -X GET 'https://api.printful.com/webhooks' \\"
echo "  -H \"Authorization: Bearer $PRINTFUL_API_KEY\""
echo ""
echo "To disable webhooks:"
echo "curl -X DELETE 'https://api.printful.com/webhooks' \\"
echo "  -H \"Authorization: Bearer $PRINTFUL_API_KEY\""
