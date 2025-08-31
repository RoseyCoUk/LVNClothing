#!/bin/bash

# ================================================
# Disable Broken Sync and Deploy Fixed Version
# ================================================

echo "🚨 DISABLING BROKEN SYNC FUNCTION"
echo "=================================="
echo ""
echo "ISSUE: Current sync function uses RANDOM data instead of real Printful API!"
echo ""
echo "Current problematic code:"
echo "  return {"
echo "    in_stock: Math.random() > 0.3, // 70% chance"
echo "    is_available: Math.random() > 0.2 // 80% chance" 
echo "  }"
echo ""

# Show current cron
echo "📋 Current cron job (THE PROBLEM):"
crontab -l | grep printful-inventory-sync || echo "No sync cron found"
echo ""

# Ask what to do
echo "Choose your action:"
echo "1) 🛑 Disable broken cron job (RECOMMENDED)"
echo "2) 📋 Bulk update all variants to available (quick fix)"
echo "3) 🔧 Deploy fixed sync function (requires Printful API token)"
echo "4) 📊 Just show the problem (no changes)"
echo "5) ❌ Exit"
echo ""

read -p "Enter choice [1-5]: " choice

case $choice in
    1)
        echo ""
        echo "🛑 Disabling broken cron job..."
        
        # Backup crontab
        crontab -l > "crontab_backup_$(date +%Y%m%d_%H%M%S).txt" 2>/dev/null
        echo "✅ Crontab backed up"
        
        # Disable the sync job
        if crontab -l 2>/dev/null | grep -q "printful-inventory-sync"; then
            crontab -l | sed 's|^\(\*/15.*printful-inventory-sync.*\)|# DISABLED (uses random data): \1|' | crontab -
            echo "✅ Broken sync job DISABLED"
            echo ""
            echo "📋 New crontab:"
            crontab -l
            echo ""
            echo "🎉 SUCCESS: Random data sync is now disabled!"
            echo "   Your manual changes will no longer be overridden"
            echo ""
            echo "🔧 Next steps:"
            echo "   1. Run: ./fix-stock-sync-conflict.sh"
            echo "   2. Choose option 1 to bulk update all variants"
            echo "   3. Or manually set variants as needed"
        else
            echo "❌ No printful-inventory-sync cron job found"
        fi
        ;;
        
    2)
        echo ""
        echo "📋 Opening bulk update instructions..."
        echo ""
        echo "🗄️ BULK UPDATE SQL (copy to Supabase SQL Editor):"
        echo "=================================================="
        echo "-- Set ALL variants to available and in stock"
        echo "UPDATE public.product_variants"
        echo "SET "
        echo "    is_available = true,"
        echo "    in_stock = true,"
        echo "    updated_at = NOW()"
        echo "WHERE "
        echo "    is_available = false"
        echo "    OR is_available IS NULL"
        echo "    OR in_stock = false"
        echo "    OR in_stock IS NULL;"
        echo "=================================================="
        echo ""
        echo "🔗 Supabase SQL Editor:"
        echo "https://supabase.com/dashboard/project/nsmrxwnrtsllxvplazmm/sql/1"
        echo ""
        open "https://supabase.com/dashboard/project/nsmrxwnrtsllxvplazmm/sql/1" 2>/dev/null || echo "Please open the URL above manually"
        ;;
        
    3)
        echo ""
        echo "🔧 To deploy the fixed sync function:"
        echo ""
        echo "1. Set your Printful API token in Supabase:"
        echo "   Dashboard → Settings → Environment Variables"
        echo "   Add: PRINTFUL_API_TOKEN = your_token"
        echo ""
        echo "2. Deploy the fixed function:"
        echo "   supabase functions deploy printful-inventory-sync-fixed"
        echo ""
        echo "3. Update your cron to use the fixed version:"
        echo "   */15 * * * * curl -X POST '.../printful-inventory-sync-fixed'"
        echo ""
        echo "📁 Fixed function created at:"
        echo "   supabase/functions/printful-inventory-sync-fixed/index.ts"
        ;;
        
    4)
        echo ""
        echo "📊 PROBLEM ANALYSIS:"
        echo "==================="
        echo ""
        echo "🐛 BUG FOUND: The sync function doesn't call Printful API"
        echo ""
        echo "❌ Current broken code (line 258-261):"
        echo "   return {"
        echo "     in_stock: Math.random() > 0.3,"
        echo "     is_available: Math.random() > 0.2"
        echo "   }"
        echo ""
        echo "🎲 This generates RANDOM stock status every 15 minutes!"
        echo "   30% chance of being out of stock"
        echo "   20% chance of being unavailable"
        echo ""
        echo "🎯 Why your manual changes revert:"
        echo "   1. You set variants to available/in stock"
        echo "   2. 15 minutes later, cron runs"
        echo "   3. Random function might return false"
        echo "   4. Your changes get overwritten"
        echo ""
        echo "✅ Solution: Use the REAL Printful API instead of random data"
        ;;
        
    5)
        echo "👋 Goodbye!"
        exit 0
        ;;
        
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo ""
echo "🔍 Current cron status:"
crontab -l | grep printful || echo "No printful cron jobs found"
echo ""
echo "📊 To check variant status:"
echo "SELECT name, is_available, in_stock, updated_at FROM product_variants ORDER BY updated_at DESC LIMIT 10;"
