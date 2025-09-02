#!/bin/bash

# Test Stripe Duplicate Webhook Delivery
echo "=== Testing Stripe Duplicate Webhook Delivery ==="
echo "Date: $(date)"
echo ""

# Start local Supabase if not running
supabase status > /dev/null 2>&1 || supabase start

# Create a test payment intent ID
TEST_PI_ID="pi_test_$(date +%s)"
TEST_EVENT_ID="evt_test_$(date +%s)"

# Create webhook payload
WEBHOOK_PAYLOAD=$(cat <<EOF
{
  "id": "$TEST_EVENT_ID",
  "object": "event",
  "api_version": "2024-11-20.acacia",
  "created": $(date +%s),
  "data": {
    "object": {
      "id": "$TEST_PI_ID",
      "object": "payment_intent",
      "amount": 2000,
      "amount_received": 2000,
      "currency": "gbp",
      "status": "succeeded",
      "metadata": {
        "order_id": "test_order_$(date +%s)",
        "customer_email": "test@example.com",
        "items": "[{\"id\":\"test_item\",\"name\":\"Test Product\",\"price\":20,\"quantity\":1,\"printful_variant_id\":\"14276\"}]",
        "shipping_address": "{\"name\":\"Test User\",\"address1\":\"123 Test St\",\"city\":\"London\",\"country_code\":\"GB\",\"zip\":\"SW1A 1AA\"}"
      }
    }
  },
  "livemode": false,
  "pending_webhooks": 1,
  "request": {
    "id": null,
    "idempotency_key": null
  },
  "type": "payment_intent.succeeded"
}
EOF
)

# Function to send webhook
send_webhook() {
    local attempt=$1
    echo "Attempt $attempt: Sending webhook with event_id=$TEST_EVENT_ID, payment_intent=$TEST_PI_ID"
    
    # Calculate signature (using test webhook secret)
    WEBHOOK_SECRET="whsec_test_secret"
    TIMESTAMP=$(date +%s)
    SIGNATURE_PAYLOAD="${TIMESTAMP}.${WEBHOOK_PAYLOAD}"
    
    curl -X POST http://localhost:54321/functions/v1/stripe-webhook2 \
        -H "Content-Type: application/json" \
        -H "stripe-signature: t=${TIMESTAMP},v1=test_signature,v0=test_signature" \
        -d "$WEBHOOK_PAYLOAD" \
        -w "\nHTTP Status: %{http_code}\n" \
        -s
    
    echo ""
}

# Send webhook twice
echo "=== Sending duplicate webhooks ==="
send_webhook 1
sleep 2
send_webhook 2

echo ""
echo "=== Checking database ==="

# Check orders table
echo "Orders table (should have exactly 1 row):"
echo "SELECT COUNT(*) as order_count, stripe_payment_intent_id FROM orders WHERE stripe_payment_intent_id = '$TEST_PI_ID' GROUP BY stripe_payment_intent_id;" | supabase db execute 2>/dev/null | grep -A 2 "order_count"

# Check webhook_events table
echo ""
echo "Webhook events table (should have 2 rows, one processed, one duplicate):"
echo "SELECT event_id, processed, error FROM webhook_events WHERE event_id = '$TEST_EVENT_ID';" | supabase db execute 2>/dev/null | grep -A 3 "event_id"

echo ""
echo "=== Test Complete ==="