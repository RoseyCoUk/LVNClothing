#!/bin/bash

curl -X POST https://nsmrxwnrtsllxvplazmm.supabase.co/functions/v1/create-payment-intent \
  -H "Content-Type: application/json" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zbXJ4d25ydHNsbHh2cGxhem1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2OTE0MzAsImV4cCI6MjA3MTI2NzQzMH0.DJehB4-N2JUMvl-S_Hhwveb89ur3lRVYlzh7u5jlQIE" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zbXJ4d25ydHNsbHh2cGxhem1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2OTE0MzAsImV4cCI6MjA3MTI2NzQzMH0.DJehB4-N2JUMvl-S_Hhwveb89ur3lRVYlzh7u5jlQIE" \
  -d '{
  "items": [
    {
      "id": "b0e9082b-44fd-4a5a-b25c-172d0039f437",
      "name": "Reform UK Hoodie",
      "price": 39.99,
      "quantity": 1,
      "printful_variant_id": "4938800544",
      "product_type": "single",
      "image": "https://nsmrxwnrtsllxvplazmm.supabase.co/storage/v1/object/public/product-images/products/5889188a-e6c9-4161-96fa-c370a2a3c89b/1756759857025_gocmmxrova8.jpg",
      "color": "Red",
      "size": "M"
    },
    {
      "id": "9f0c4f2a-1c02-4bb9-8731-d1b898e1cc2b",
      "name": "Reform UK T-Shirt",
      "price": 24.99,
      "quantity": 1,
      "printful_variant_id": "4938821298",
      "product_type": "single",
      "image": "https://nsmrxwnrtsllxvplazmm.supabase.co/storage/v1/object/public/product-images/products/814074c6-e88d-4505-9089-6ac04124ea23/1756775215394_r8wz5ay46p.jpg",
      "color": "Red",
      "size": "M"
    },
    {
      "id": "663a9af4-89da-4c69-8d69-c5ce6dfaf402",
      "name": "Reform UK Cap",
      "price": 19.99,
      "quantity": 1,
      "printful_variant_id": "4938937574",
      "product_type": "single",
      "image": "https://nsmrxwnrtsllxvplazmm.supabase.co/storage/v1/object/public/product-images/products/29b2e16a-39e8-4322-aaf1-0529b3973212/1756756932725_815p9lble.jpg",
      "color": "Khaki"
    },
    {
      "id": "deef0391-ab7a-42c4-b8f0-1602a3fb5164",
      "name": "Reform UK Tote Bag",
      "price": 24.99,
      "quantity": 1,
      "printful_variant_id": "4937855201",
      "product_type": "single",
      "image": "https://nsmrxwnrtsllxvplazmm.supabase.co/storage/v1/object/public/product-images/products/103b8eaf-4ef5-44a1-9c9e-f49c8367f220/1756754777994_c6clbvivc4s.jpg",
      "color": "Black"
    },
    {
      "id": "f260db20-2573-4507-bbf1-6bbe79b80f03",
      "name": "Reform UK Water Bottle",
      "price": 24.99,
      "quantity": 1,
      "printful_variant_id": "4938941055",
      "product_type": "single",
      "image": "/StickerToteWater/ReformWaterBottleWhite1.webp",
      "color": "White"
    },
    {
      "id": "619402c0-7292-42af-b2b0-b7b50b92cfe4",
      "name": "Reform UK Mug",
      "price": 9.99,
      "quantity": 1,
      "printful_variant_id": "4938946337",
      "product_type": "single",
      "image": "https://nsmrxwnrtsllxvplazmm.supabase.co/storage/v1/object/public/product-images/products/0274bc92-4d93-47a2-a613-6fc2182de5c8/1756756619519_hplhkukqaps.jpg",
      "color": "White"
    },
    {
      "id": "bbe702ab-fe1a-4246-91bb-b36f6ff0e8e4",
      "name": "Reform UK Mouse Pad",
      "price": 14.99,
      "quantity": 1,
      "printful_variant_id": "4938942751",
      "product_type": "single",
      "image": "/MugMouse/ReformMousePadWhite1.webp",
      "color": "White"
    },
    {
      "id": "activist-bundle-discount",
      "name": "Activist Bundle Discount (20%)",
      "price": -31.940000000000012,
      "quantity": 1,
      "printful_variant_id": "BUNDLE_DISCOUNT_ACTIVIST",
      "product_type": "single",
      "image": "/BackReformLogo.png",
      "isDiscount": true
    }
  ],
  "shipping_address": {
    "name": "Arnis Piekus",
    "address1": "75 Forest Hills",
    "city": "Newry",
    "country_code": "GB",
    "zip": "BT34 2FL"
  },
  "customer_email": "apiekus20@gmail.com",
  "guest_checkout": true,
  "metadata": {
    "checkout_type": "dynamic_payment_intent",
    "timestamp": "2025-09-07T17:39:13.769Z"
  }
}' 2>&1
