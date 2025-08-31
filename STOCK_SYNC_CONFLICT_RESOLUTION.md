# 🚨 Stock Sync Conflict Resolution Guide

## **🎯 PROBLEM IDENTIFIED**

**Your manual stock/availability changes are being overridden by a 15-minute cron job that syncs with Printful.**

### **Root Cause:**
```bash
# This cron job runs every 15 minutes:
*/15 * * * * curl -X POST 'https://nsmrxwnrtsllxvplazmm.supabase.co/functions/v1/printful-inventory-sync'
```

**What happens:**
1. You manually set variants to `available` and `in_stock`
2. Within 15 minutes, the cron job pulls data from Printful
3. If Printful data shows items as out of stock, your changes get overwritten
4. This creates the "reverting" behavior you're experiencing

---

## **🔧 IMMEDIATE SOLUTIONS**

### **Option 1: Quick Fix - Bulk Update All Variants** ⚡

**File:** `bulk-update-stock-available.sql`

**Steps:**
1. Open [Supabase SQL Editor](https://supabase.com/dashboard/project/nsmrxwnrtsllxvplazmm/sql/1)
2. Copy and run the SQL script from `bulk-update-stock-available.sql`
3. This sets ALL variants to `is_available=true` and `in_stock=true`

**⚠️ Important:** Changes will revert in ~15 minutes unless you fix the sync

### **Option 2: Disable Auto-Sync (Temporary)** ⏸️

**To stop the overrides while you fix the data:**

```bash
# Run the interactive script
./fix-stock-sync-conflict.sh

# OR manually disable:
crontab -e
# Add # at start of the sync line:
# */15 * * * * curl -X POST 'https://nsmrxwnrtsllxvplazmm.supabase.co/functions/v1/printful-inventory-sync'...
```

### **Option 3: Fix Printful Data** 🎯

**Check what Printful actually returns:**

1. **Log into [Printful Dashboard](https://www.printful.com/dashboard)**
2. **Go to Products → Your Products**
3. **Verify stock status** - ensure variants show as "In Stock"
4. **If Printful shows in stock** but sync is setting out of stock → sync function has a bug

---

## **🛠️ TOOLS CREATED FOR YOU**

### **1. Interactive Resolution Script**
```bash
./fix-stock-sync-conflict.sh
```
- Guided menu to fix the conflict
- Options to bulk update, disable sync, test, or monitor

### **2. Bulk Update SQL Script**
- **File:** `bulk-update-stock-available.sql`
- Sets all variants to available and in stock
- Shows before/after counts
- Provides detailed results

### **3. Status Investigation Tool**
- **File:** `check-printful-sync-status.html`
- Comprehensive diagnostic interface
- Shows sync timing, logs, and monitoring commands

---

## **🔍 DIAGNOSTIC COMMANDS**

### **Check Current Cron Status**
```bash
crontab -l                           # Show all cron jobs
sudo systemctl status cron          # Check cron service
sudo tail -f /var/log/syslog | grep CRON  # Monitor executions
```

### **Test Manual Sync**
```bash
curl -X POST 'https://nsmrxwnrtsllxvplazmm.supabase.co/functions/v1/printful-inventory-sync' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

### **Monitor Variant Changes**
```sql
SELECT 
    p.name as product_name,
    pv.name as variant_name,
    pv.is_available,
    pv.in_stock,
    pv.updated_at
FROM product_variants pv
JOIN products p ON p.id = pv.product_id
ORDER BY pv.updated_at DESC
LIMIT 20;
```

---

## **📋 RECOMMENDED ACTION PLAN**

### **Step 1: Immediate Fix (Choose One)**
- **For quick results:** Run `bulk-update-stock-available.sql`
- **For investigation:** Disable cron job temporarily

### **Step 2: Root Cause Analysis**
1. Check Printful dashboard - verify actual stock status
2. Test manual sync and see what data it returns
3. Check Supabase function logs for sync details

### **Step 3: Long-term Solution (Choose One)**

#### **Option A: Fix Printful Data**
- If Printful shows wrong stock status, fix it there
- Re-enable sync to keep data in sync

#### **Option B: Modify Sync Logic**
- Update sync function to respect manual overrides
- Add a "manual_override" flag to prevent auto-sync changes

#### **Option C: Scheduled Manual Management**
- Keep sync disabled
- Manually manage stock status
- Set up alerts for when you need to update

---

## **🚀 NEXT STEPS**

1. **Run the interactive script:** `./fix-stock-sync-conflict.sh`
2. **Choose Option 1** to bulk update all variants
3. **Monitor for reverts** (should happen within 15 minutes if sync is still active)
4. **If reverts occur:** Disable sync and investigate Printful data
5. **If no reverts:** Your Printful data is now correct!

---

## **📞 SUPPORT**

### **Files Created:**
- ✅ `fix-stock-sync-conflict.sh` - Interactive resolution tool
- ✅ `bulk-update-stock-available.sql` - Bulk update script
- ✅ `check-printful-sync-status.html` - Status investigation interface

### **Quick Links:**
- [Supabase SQL Editor](https://supabase.com/dashboard/project/nsmrxwnrtsllxvplazmm/sql/1)
- [Supabase Function Logs](https://supabase.com/dashboard/project/nsmrxwnrtsllxvplazmm/functions/printful-inventory-sync/logs)
- [Printful Dashboard](https://www.printful.com/dashboard)

**🎉 You now have everything needed to resolve the stock sync conflict!**
