# 📡 Printful Webhook Setup - Quick Reference

## 🎯 **Webhook Configuration Details**

### **Webhook URL**
```
https://nsmrxwnrtsllxvplazmm.supabase.co/functions/v1/printful-inventory-sync?webhook=true
```

### **Authentication Header**
- **Header Name**: `Authorization`
- **Header Value**: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zbXJ4d25ydHNsbHh2cGxhem1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0OTY0NTIsImV4cCI6MjA2NzA3MjQ1Mn0.XyHiuQHXW_laGE4Caond1-8xK-2B4NzDzIOX8baD4UM`

## 🚀 **Quick Setup Steps**

### **1. Printful Dashboard**
- Go to: [Printful Dashboard](https://www.printful.com/dashboard)
- Navigate: **Settings** → **Webhooks**

### **2. Create Webhook**
- Click **"Add webhook"**
- **Name**: `ReformUK Inventory Sync`
- **URL**: Copy the webhook URL above

### **3. Select Events**
- ✅ `Product updated`
- ✅ `Product variant updated`
- ✅ `Product variant stock updated`
- ✅ `Product variant availability updated`

### **4. Add Headers**
- **Header Name**: `Authorization`
- **Header Value**: Copy the Bearer token above

### **5. Save & Test**
- Click **"Save webhook"**
- Printful will send a test webhook automatically

## 🧪 **Test Commands**

### **Test Webhook Endpoint**
```bash
curl -X POST 'https://nsmrxwnrtsllxvplazmm.supabase.co/functions/v1/printful-inventory-sync?webhook=true' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zbXJ4d25ydHNsbHh2cGxhem1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0OTY0NTIsImV4cCI6MjA2NzA3MjQ1Mn0.XyHiuQHXW_laGE4Caond1-8xK-2B4NzDzIOX8baD4UM' \
  -H 'Content-Type: application/json' \
  -d '{"variant_id":"68a9daac4dcb25","in_stock":true,"is_available":true}'
```

### **Test Manual Sync**
```bash
curl -X POST 'https://nsmrxwnrtsllxvplazmm.supabase.co/functions/v1/printful-inventory-sync' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zbXJ4d25ydHNsbHh2cGxhem1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0OTY0NTIsImV4cCI6MjA2NzA3MjQ1Mn0.XyHiuQHXW_laGE4Caond1-8xK-2B4NzDzIOX8baD4UM'
```

## 📊 **Monitoring**

### **Check Webhook Status**
- **Printful**: Settings → Webhooks → View delivery status
- **Supabase**: Functions → Logs → Check for webhook calls
- **Database**: Monitor `product_variants` table updates

### **Expected Behavior**
- Webhook fires immediately when inventory changes in Printful
- Database updates within seconds
- Customer sees real-time availability updates

## 🎉 **Success Indicators**

- ✅ Webhook shows as "Active" in Printful
- ✅ Test webhook delivers successfully
- ✅ Database updates when you change inventory in Printful
- ✅ Real-time sync working without manual intervention

---

**Once this is working, Phase 2 will be 100% complete!** 🚀
