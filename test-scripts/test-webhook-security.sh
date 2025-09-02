#!/bin/bash

echo "=== Testing Webhook Security ==="
echo ""

# Test 1: Invalid Stripe signature
echo "Test 1: Sending webhook with invalid Stripe signature"
RESPONSE=$(curl -X POST http://localhost:54321/functions/v1/stripe-webhook2 \
    -H "Content-Type: application/json" \
    -H "stripe-signature: invalid_signature" \
    -d '{"type":"payment_intent.succeeded","data":{"object":{"id":"pi_test"}}}' \
    -w "\nHTTP_STATUS:%{http_code}" \
    -s)

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
echo "Response: $(echo "$RESPONSE" | grep -v "HTTP_STATUS:")"
echo "HTTP Status: $HTTP_STATUS"

if [ "$HTTP_STATUS" = "400" ]; then
    echo "✅ PASS: Invalid signature rejected with 400"
else
    echo "❌ FAIL: Expected 400, got $HTTP_STATUS"
fi

echo ""
echo "Test 2: Missing Stripe signature header"
RESPONSE=$(curl -X POST http://localhost:54321/functions/v1/stripe-webhook2 \
    -H "Content-Type: application/json" \
    -d '{"type":"payment_intent.succeeded","data":{"object":{"id":"pi_test"}}}' \
    -w "\nHTTP_STATUS:%{http_code}" \
    -s)

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
echo "Response: $(echo "$RESPONSE" | grep -v "HTTP_STATUS:")"
echo "HTTP Status: $HTTP_STATUS"

if [ "$HTTP_STATUS" = "400" ]; then
    echo "✅ PASS: Missing signature rejected with 400"
else
    echo "❌ FAIL: Expected 400, got $HTTP_STATUS"
fi

echo ""
echo "=== Security Test Complete ==="