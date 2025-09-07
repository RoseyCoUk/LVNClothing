#!/bin/bash

curl -X POST https://nsmrxwnrtsllxvplazmm.supabase.co/functions/v1/create-payment-intent \
  -H "Content-Type: application/json" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zbXJ4d25ydHNsbHh2cGxhem1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2OTE0MzAsImV4cCI6MjA3MTI2NzQzMH0.DJehB4-N2JUMvl-S_Hhwveb89ur3lRVYlzh7u5jlQIE" \
  -d '{
    "items": [{
      "id": "test-item",
      "name": "Test Product",
      "price": 10.00,
      "quantity": 1,
      "printful_variant_id": "4938800544",
      "product_type": "single"
    }],
    "shipping_address": {
      "name": "Test User",
      "address1": "123 Test St",
      "city": "London",
      "country_code": "GB",
      "zip": "SW1A 1AA"
    },
    "customer_email": "test@example.com",
    "guest_checkout": true
  }' -v
