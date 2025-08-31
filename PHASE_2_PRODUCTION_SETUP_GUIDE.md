# 🚀 Phase 2 Production Setup Guide

## 🎯 **Overview**
This guide will help you complete Phase 2 by setting up:
1. **Automated 15-minute inventory sync** via cron job
2. **Real-time Printful webhooks** for immediate inventory updates

## ⏰ **Task 1: Set Up Cron Job for Automated Sync**

### **What This Does**
- Runs inventory sync every 15 minutes automatically
- Acts as a backup system for webhooks
- Ensures your inventory is never more than 15 minutes old

### **Step-by-Step Setup**

#### **1. Open Terminal and Run**
```bash
# Make the script executable (if not already done)
chmod +x setup-inventory-sync-cron.sh

# Run the setup script
./setup-inventory-sync-cron.sh
```

#### **2. Add the Cron Job**
```bash
# Open your crontab for editing
crontab -e
```

#### **3. Add This Line to Your Crontab**
```cron
*/15 * * * * curl -X POST 'https://nsmrxwnrtsllxvplazmm.supabase.co/functions/v1/printful-inventory-sync' -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zbXJ4d25ydHNsbHh2cGxhem1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0OTY0NTIsImV4cCI6MjA2NzA3MjQ1Mn0.XyHiuQHXW_laGE4Caond1-8xK-2B4NzDzIOX8baD4UM'
```

#### **4. Save and Exit**
- Press `Ctrl+X` to exit
- Press `Y` to save changes
- Press `Enter` to confirm

#### **5. Verify the Cron Job**
```bash
# List all cron jobs
crontab -l

# Check cron service status
sudo systemctl status cron
```

### **What the Cron Job Does**
- **`*/15`**: Every 15 minutes
- **`* * * *`**: Every hour, every day, every month, every day of week
- **Result**: Syncs inventory every 15 minutes automatically

---

## 📡 **Task 2: Configure Printful Webhooks for Production**

### **What This Does**
- Receives real-time inventory updates from Printful
- Updates your database immediately when inventory changes
- Provides instant availability updates to customers

### **Step-by-Step Setup**

#### **1. Log into Printful Dashboard**
- Go to [Printful Dashboard](https://www.printful.com/dashboard)
- Navigate to **Settings** → **Webhooks**

#### **2. Create New Webhook**
- Click **"Add webhook"**
- Set **Webhook URL** to:
```
https://nsmrxwnrtsllxvplazmm.supabase.co/functions/v1/printful-inventory-sync?webhook=true
```

#### **3. Configure Webhook Settings**
- **Name**: `ReformUK Inventory Sync`
- **Events**: Select these events:
  - ✅ `Product updated`
  - ✅ `Product variant updated`
  - ✅ `Product variant stock updated`
  - ✅ `Product variant availability updated`

#### **4. Set Webhook Headers**
Add this header for authentication:
- **Header Name**: `Authorization`
- **Header Value**: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zbXJ4d25ydHNsbHh2cGxhem1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0OTY0NTIsImV4cCI6MjA2NzA3MjQ1Mn0.XyHiuQHXW_laGE4Caond1-8xK-2B4NzDzIOX8baD4UM`

#### **5. Save and Test**
- Click **"Save webhook"**
- Printful will send a test webhook to verify the endpoint

---

## 🧪 **Testing Your Setup**

### **Test 1: Verify Cron Job is Working**
```bash
# Check if cron is running
sudo systemctl status cron

# View cron logs
sudo tail -f /var/log/syslog | grep CRON

# Test manual sync
curl -X POST 'https://nsmrxwnrtsllxvplazmm.supabase.co/functions/v1/printful-inventory-sync' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zbXJ4d25ydHNsbHh2cGxhem1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0OTY0NTIsImV4cCI6MjA2NzA3MjQ1Mn0.XyHiuQHXW_laGE4Caond1-8xK-2B4NzDzIOX8baD4UM'
```

### **Test 2: Verify Webhook is Working**
```bash
# Test webhook endpoint
curl -X POST 'https://nsmrxwnrtsllxvplazmm.supabase.co/functions/v1/printful-inventory-sync?webhook=true' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zbXJ4d25ydHNsbHh2cGxhem1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0OTY0NTIsImV4cCI6MjA2NzA3MjQ1Mn0.XyHiuQHXW_laGE4Caond1-8xK-2B4NzDzIOX8baD4UM' \
  -H 'Content-Type: application/json' \
  -d '{"variant_id":"68a9daac4dcb25","in_stock":true,"is_available":true}'
```

### **Test 3: Monitor Real-Time Updates**
1. Make a change in Printful (e.g., mark a variant as out of stock)
2. Check your Supabase logs to see the webhook being processed
3. Verify the database is updated immediately

---

## 📊 **Monitoring and Maintenance**

### **Check Cron Job Status**
```bash
# View all cron jobs
crontab -l

# Check cron service
sudo systemctl status cron

# View cron logs
sudo tail -f /var/log/syslog | grep CRON
```

### **Check Webhook Status**
- **Printful Dashboard**: Settings → Webhooks → View delivery status
- **Supabase Dashboard**: Functions → Logs → Check for webhook calls
- **Database**: Monitor `product_variants` table for real-time updates

### **Troubleshooting**

#### **Cron Job Issues**
```bash
# Restart cron service
sudo systemctl restart cron

# Check cron permissions
sudo chmod 644 /etc/crontab

# Verify the curl command works manually
curl -X POST 'https://nsmrxwnrtsllxvplazmm.supabase.co/functions/v1/printful-inventory-sync' \
  -H 'Authorization: Bearer YOUR_ANON_KEY'
```

#### **Webhook Issues**
- Check Printful webhook delivery status
- Verify the webhook URL is correct
- Check Supabase function logs for errors
- Ensure the Authorization header is set correctly

---

## 🎉 **Phase 2 Completion Checklist**

### **✅ What's Already Done**
- [x] Database schema and product import
- [x] Variant management system
- [x] Inventory sync function deployed
- [x] Webhook handling implemented
- [x] Duplicate prevention implemented

### **🔄 What We're Setting Up Now**
- [ ] **Cron job** for 15-minute automated sync
- [ ] **Printful webhooks** for real-time updates

### **🚀 What This Enables**
- **Real-time inventory updates** via webhooks
- **Reliable backup sync** every 15 minutes
- **Production-ready system** with automated maintenance
- **Ready for Phase 3** (Admin Panel Integration)

---

## 🔮 **Next Steps After Phase 2 Completion**

1. **✅ Phase 1**: Database Schema & Printful Sync Foundation
2. **🔄 Phase 2**: Variant Management System (In Progress)
3. **⏳ Phase 3**: Admin Panel Integration (Ready to Start)
4. **⏳ Phase 4**: Frontend-Backend Sync System
5. **⏳ Phase 5**: Printful Sync Automation

---

## 📞 **Support**

If you encounter any issues:
1. Check the troubleshooting section above
2. Review Supabase function logs
3. Verify Printful webhook delivery status
4. Test manual sync to isolate the issue

**Once both the cron job and webhooks are working, Phase 2 will be 100% complete and we can move to Phase 3!** 🚀
