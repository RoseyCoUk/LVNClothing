#!/bin/bash

# Setup script for Printful webhooks via API
# This script configures webhooks for real-time inventory updates

echo "Setting up Printful webhooks via API..."
echo ""

# Configuration
WEBHOOK_URL="https://nsmrxwnrtsllxvplazmm.supabase.co/functions/v1/printful-inventory-sync?webhook=true"
PRINTFUL_API_KEY="dHfrvwWHc1abLufS0xz4EEEqgE0XboN7cDMX24mB"

echo "Webhook URL: $WEBHOOK_URL"
echo ""

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

echo "Setting up webhook with these events:"
echo "- product_updated"
echo "- stock_updated"
echo "- product_synced"
echo ""

# Create webhook configuration
echo "Creating webhook configuration..."
curl -X POST 'https://api.printful.com/webhooks' \
  -H "Authorization: Bearer $PRINTFUL_API_KEY" \
  -H 'Content-Type: application/json' \
  -d "{
    \"url\": \"$WEBHOOK_URL\",
    \"types\": [
      \"product_updated\",
      \"stock_updated\",
      \"product_synced\"
    ]
  }"

echo ""
echo ""
echo "✅ Webhook setup complete!"
echo ""
echo "To verify the webhook is working:"
echo "1. Check Printful API response above"
echo "2. Test with: ./test-printful-webhooks.sh"
echo ""
echo "To view current webhook config:"
echo "curl -X GET 'https://api.printful.com/webhooks' \\"
echo "  -H \"Authorization: Bearer $PRINTFUL_API_KEY\""
echo ""
echo "To disable webhooks:"
echo "curl -X DELETE 'https://api.printful.com/webhooks' \\"
echo "  -H \"Authorization: Bearer $PRINTFUL_API_KEY\""
