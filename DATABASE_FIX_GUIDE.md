# Database Fix Guide

The error you encountered indicates that the `products` table doesn't have the `printful_product_id` column that our seeding script expects. This guide will help you fix this step by step.

## 🚨 **The Problem**

```
ERROR: 42703: column "printful_product_id" of relation "products" does not exist
```

This means the `products` table exists but doesn't have the expected structure.

## 🔧 **Solution Steps**

### **Step 1: Check Current Database Structure**

First, run this diagnostic script in your Supabase SQL editor:

```sql
-- Copy and paste this into your Supabase SQL editor
-- File: scripts/check-database-structure.sql

-- Check what tables exist
SELECT 
  'Tables' as info_type,
  table_name,
  'exists' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'products', 'product_overrides', 'product_images', 
  'bundles', 'bundle_items', 'sync_status', 
  'inventory_changes', 'sync_errors', 'data_conflicts',
  'webhook_logs', 'notifications'
)
ORDER BY table_name;

-- Check products table structure
SELECT 
  'Products Table Columns' as info_type,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'products'
ORDER BY ordinal_position;
```

**Run this first and tell me what you see!**

### **Step 2: Fix the Products Table (if needed)**

If the `printful_product_id` column is missing, run this fix script:

```sql
-- Copy and paste this into your Supabase SQL editor
-- File: scripts/fix-products-table.sql

-- Add the missing column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'printful_product_id'
  ) THEN
    -- Add the missing column
    ALTER TABLE public.products ADD COLUMN printful_product_id text;
    
    -- Add a unique constraint
    ALTER TABLE public.products ADD CONSTRAINT unique_printful_product_id UNIQUE (printful_product_id);
    
    -- Create an index for performance
    CREATE INDEX IF NOT EXISTS idx_products_printful_id ON public.products(printful_product_id);
    
    RAISE NOTICE 'Added printful_product_id column to products table';
  ELSE
    RAISE NOTICE 'printful_product_id column already exists in products table';
  END IF;
END $$;
```

### **Step 3: Use the Fixed Seeding Script**

Now use the corrected seeding script that works with the current database structure:

```sql
-- Copy and paste this into your Supabase SQL editor
-- File: scripts/seed-admin-products-data-fixed.sql

-- This script will work with the current database structure
-- It doesn't require the printful_product_id column for initial seeding
```

## 🎯 **Alternative Approach: Quick Fix**

If you want to get started quickly without the `printful_product_id` column, you can:

1. **Skip the problematic column** for now
2. **Seed the database** with the basic structure
3. **Add the column later** when you need it

## 📋 **What to Do Next**

1. **Run the diagnostic script** (Step 1) and tell me what you see
2. **Based on the results**, I'll give you the exact fix you need
3. **Then we can seed the database** successfully

## 🔍 **Common Scenarios**

### **Scenario 1: Table doesn't exist at all**
- We need to run the full migration first

### **Scenario 2: Table exists but missing columns**
- We need to add the missing columns

### **Scenario 3: Table exists with different structure**
- We need to either modify the table or adapt our seeding script

## 💡 **Quick Test**

Try this simple query to see what's in your products table:

```sql
-- Simple test query
SELECT * FROM products LIMIT 1;
```

If this works, tell me what columns you see. If it fails, tell me the exact error message.

---

**🎯 Goal**: Get your database properly structured so we can seed it with sample data and test the admin products system.

**📞 Next**: Run the diagnostic script and let me know what you see!

