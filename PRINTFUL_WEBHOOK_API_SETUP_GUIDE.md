# 📡 Printful Webhook Setup via API - Complete Guide

## 🎯 **Overview**
Printful webhooks are configured via **API calls**, not through the dashboard UI. This gives us more control and automation capabilities.

## 🔑 **Step 1: Get Your Printful API Key**

### **Where to Find It**
1. Go to [Printful Dashboard](https://www.printful.com/dashboard)
2. Navigate to **Developers** → **Your tokens**
3. Find your token (e.g., "ReformUK" created Aug 23, 2025)
4. **Copy the token value** (not the name)

### **Token Details**
- **Name**: ReformUK
- **Created**: Aug 23, 2025
- **Expires**: Aug 22, 2027
- **Scopes**: Orders/read, Orders... (and more)

---

## 🚀 **Step 2: Set Up Webhooks via API**

### **Option A: Use the Automated Script (Recommended)**
```bash
# 1. Edit the script to add your API key
nano setup-printful-webhooks.sh

# 2. Replace YOUR_PRINTFUL_API_KEY_HERE with your actual token
# 3. Save and run
./setup-printful-webhooks.sh
```

### **Option B: Manual API Call**
```bash
curl -X POST 'https://api.printful.com/webhooks' \
  -H "Authorization: Bearer YOUR_ACTUAL_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "url": "https://nsmrxwnrtsllxvplazmm.supabase.co/functions/v1/printful-inventory-sync?webhook=true",
    "types": [
      "product_updated",
      "stock_updated",
      "product_synced"
    ]
  }'
```

---

## 📋 **Webhook Events We're Setting Up**

### **1. product_updated**
- Fires when products or variants are created/updated
- Perfect for inventory changes
- Includes all product data

### **2. stock_updated**
- Fires when stock availability changes
- Most important for real-time inventory
- Contains variant stock status

### **3. product_synced**
- Fires when products are imported/synced
- Good for initial product setup
- Ensures data consistency

---

## 🧪 **Step 3: Test Your Webhooks**

### **Test Current Configuration**
```bash
# View current webhook setup
curl -X GET 'https://api.printful.com/webhooks' \
  -H "Authorization: Bearer YOUR_ACTUAL_API_KEY"
```

### **Test Webhook Endpoint**
```bash
# Test with sample data
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
```

### **Use the Test Script**
```bash
# Run comprehensive tests
./test-printful-webhooks.sh
```

---

## 📊 **Expected API Responses**

### **Successful Webhook Setup**
```json
{
  "code": 200,
  "result": {
    "url": "https://nsmrxwnrtsllxvplazmm.supabase.co/functions/v1/printful-inventory-sync?webhook=true",
    "types": ["product_updated", "stock_updated", "product_synced"],
    "params": {}
  }
}
```

### **Current Webhook Status**
```json
{
  "code": 200,
  "result": {
    "url": "your_webhook_url",
    "types": ["event_types"],
    "params": {}
  }
}
```

---

## 🔧 **Webhook Management Commands**

### **View Current Configuration**
```bash
curl -X GET 'https://api.printful.com/webhooks' \
  -H "Authorization: Bearer YOUR_ACTUAL_API_KEY"
```

### **Update Webhook Configuration**
```bash
curl -X POST 'https://api.printful.com/webhooks' \
  -H "Authorization: Bearer YOUR_ACTUAL_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "url": "new_url",
    "types": ["new_event_types"]
  }'
```

### **Disable Webhooks**
```bash
curl -X DELETE 'https://api.printful.com/webhooks' \
  -H "Authorization: Bearer YOUR_ACTUAL_API_KEY"
```

---

## 🎯 **What Happens When Webhooks Fire**

### **Stock Updated Event**
```json
{
  "type": "stock_updated",
  "created": 1622456737,
  "retries": 0,
  "store": 1,
  "data": {
    "product_id": 9001,
    "variant_stock": {
      "68a9daac4dcb25": false,  // Variant out of stock
      "68a9daac4dcb79": true    // Variant in stock
    }
  }
}
```

### **Product Updated Event**
```json
{
  "type": "product_updated",
  "created": 1622456737,
  "retries": 0,
  "store": 1,
  "data": {
    "sync_product": {
      "id": 9001,
      "name": "Product Name",
      "variants": [...]
    }
  }
}
```

---

## 🚨 **Troubleshooting**

### **Common Issues**

#### **1. "Unauthorized" Error**
- Check your API key is correct
- Ensure the key hasn't expired
- Verify the key has proper permissions

#### **2. "Bad Request" Error**
- Check the webhook URL format
- Ensure event types are valid
- Verify JSON syntax

#### **3. Webhook Not Firing**
- Check if webhook is properly configured
- Verify the endpoint is accessible
- Monitor Supabase function logs

### **Debug Steps**
1. **Test API key**: Try a simple GET request
2. **Check webhook config**: View current setup
3. **Test endpoint**: Send test data manually
4. **Monitor logs**: Check Supabase function logs

---

## 🎉 **Success Indicators**

### **✅ Webhook Setup Complete When:**
- API returns `"code": 200`
- Webhook URL is correctly set
- Event types are properly configured
- Test webhook delivers successfully

### **✅ Real-Time Updates Working When:**
- Changes in Printful trigger webhooks immediately
- Database updates within seconds
- Customer sees real-time availability changes
- No manual sync needed for inventory changes

---

## 🔮 **Next Steps After Webhook Setup**

1. **✅ Phase 1**: Database Schema & Printful Sync Foundation
2. **🔄 Phase 2**: Variant Management System (95% Complete)
   - ✅ Cron job running every 15 minutes
   - 🔄 Webhooks configured via API
3. **⏳ Phase 3**: Admin Panel Integration (Ready to Start)

---

## 📞 **Support Commands**

### **Quick Status Check**
```bash
# Check cron job
crontab -l

# Test manual sync
curl -X POST 'https://nsmrxwnrtsllxvplazmm.supabase.co/functions/v1/printful-inventory-sync' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zbXJ4d25ydHNsbHh2cGxhem1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0OTY0NTIsImV4cCI6MjA2NzA3MjQ1Mn0.XyHiuQHXW_laGE4Caond1-8xK-2B4NzDzIOX8baD4UM'

# Check webhook config
curl -X GET 'https://api.printful.com/webhooks' \
  -H "Authorization: Bearer YOUR_ACTUAL_API_KEY"
```

---

**Once webhooks are working, Phase 2 will be 100% complete and we can move to Phase 3!** 🚀
