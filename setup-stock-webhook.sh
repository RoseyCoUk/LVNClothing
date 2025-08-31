#!/bin/bash

# Setup script for stock_updated webhook with specific product IDs

echo "Setting up stock_updated webhook with specific product IDs..."
echo ""

# Configuration
WEBHOOK_URL="https://nsmrxwnrtsllxvplazmm.supabase.co/functions/v1/printful-inventory-sync?webhook=true"
PRINTFUL_API_KEY="dHfrvwWHc1abLufS0xz4EEEqgE0XboN7cDMX24mB"

# Product IDs from your store
PRODUCT_IDS=(
  390637627  # Reform UK Sticker
  390637302  # Reform UK Mug
  390637071  # Reform UK Mouse Pad
  390636972  # Reform UK Water Bottle
  390636644  # Reform UK Cap
  390630122  # Unisex t-shirt DARK
  390629811  # Unisex t-shirt LIGHT
  390628740  # Unisex Hoodie DARK
  390628620  # Unisex Hoodie LIGHT
  390552402  # Reform UK Tote Bag
)

echo "Setting up stock monitoring for these products:"
for id in "${PRODUCT_IDS[@]}"; do
  echo "- Product ID: $id"
done
echo ""

# Create the stock_updated webhook with product IDs
echo "Creating stock_updated webhook..."
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
      \"stock_updated\": {
        \"product_ids\": [$(IFS=,; echo "${PRODUCT_IDS[*]}")]
      }
    }
  }"

echo ""
echo ""
echo "✅ Stock webhook setup complete!"
echo ""
echo "Now you can test with the Printful Webhook Simulator:"
echo "URL: $WEBHOOK_URL"
echo "Webhook Type: stock_updated"
echo ""
echo "To verify current webhook config:"
echo "curl -X GET 'https://api.printful.com/webhooks' \\"
echo "  -H \"Authorization: Bearer $PRINTFUL_API_KEY\""
