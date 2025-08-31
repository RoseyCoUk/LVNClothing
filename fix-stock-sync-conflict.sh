#!/bin/bash

# ================================================
# Fix Stock Sync Conflict Script
# ================================================
# This script provides options to resolve the Printful sync conflict

echo "🔧 Stock Sync Conflict Resolution"
echo "=================================="
echo ""
echo "PROBLEM: 15-minute cron job overrides manual stock changes"
echo "CRON JOB: $(crontab -l | grep printful-inventory-sync)"
echo ""

show_menu() {
    echo "Choose your solution:"
    echo "1) 📋 Bulk update all variants to available/in stock (Quick fix)"
    echo "2) ⏸️  Temporarily disable auto-sync (Prevents overrides)"
    echo "3) 🔄 Check what Printful actually returns (Debug)"
    echo "4) 📊 Monitor sync activity (Logs)"
    echo "5) ❌ Exit"
    echo ""
}

bulk_update() {
    echo "📋 Running bulk update script..."
    echo "This will set ALL variants to available and in stock"
    echo ""
    read -p "Continue? (y/N): " confirm
    
    if [[ $confirm =~ ^[Yy]$ ]]; then
        echo "Opening Supabase SQL editor instructions..."
        echo ""
        echo "🗄️ COPY AND RUN THIS SQL IN SUPABASE DASHBOARD:"
        echo "=================================================="
        cat bulk-update-stock-available.sql
        echo "=================================================="
        echo ""
        echo "⚠️  WARNING: Changes will revert in ~15 minutes unless you fix the sync!"
        open "https://supabase.com/dashboard/project/nsmrxwnrtsllxvplazmm/sql/1" 2>/dev/null || echo "Manual: Go to Supabase → SQL Editor"
    fi
}

disable_sync() {
    echo "⏸️ Disabling automatic sync..."
    echo ""
    echo "Current cron jobs:"
    crontab -l
    echo ""
    read -p "Disable the printful sync cron job? (y/N): " confirm
    
    if [[ $confirm =~ ^[Yy]$ ]]; then
        # Backup current crontab
        crontab -l > crontab_backup_$(date +%Y%m%d_%H%M%S).txt
        echo "✅ Crontab backed up"
        
        # Comment out the sync line
        crontab -l | sed 's|^\(\*/15.*printful-inventory-sync.*\)|# \1|' | crontab -
        
        echo "✅ Printful sync disabled"
        echo ""
        echo "New crontab:"
        crontab -l
        echo ""
        echo "🔄 To re-enable later, remove the # from the commented line"
    fi
}

test_printful_response() {
    echo "🔄 Testing what Printful returns..."
    echo ""
    echo "This will trigger a manual sync (may override your changes!)"
    read -p "Continue? (y/N): " confirm
    
    if [[ $confirm =~ ^[Yy]$ ]]; then
        echo "Calling Printful sync endpoint..."
        curl -X POST 'https://nsmrxwnrtsllxvplazmm.supabase.co/functions/v1/printful-inventory-sync' \
          -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zbXJ4d25ydHNsbHh2cGxhem1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0OTY0NTIsImV4cCI6MjA2NzA3MjQ1Mn0.XyHiuQHXW_laGE4Caond1-8xK-2B4NzDzIOX8baD4UM' \
          -w "\nHTTP Status: %{http_code}\nTime: %{time_total}s\n"
        echo ""
        echo "✅ Check Supabase Function logs for details"
        echo "📊 Check variant status in your database"
    fi
}

monitor_activity() {
    echo "📊 Monitoring sync activity..."
    echo ""
    echo "1. Check cron job status:"
    echo "   crontab -l"
    echo ""
    echo "2. Monitor cron execution:"
    echo "   tail -f /var/log/syslog | grep CRON"
    echo ""
    echo "3. Check Supabase logs:"
    echo "   https://supabase.com/dashboard/project/nsmrxwnrtsllxvplazmm/functions/printful-inventory-sync/logs"
    echo ""
    echo "4. SQL to check recent variant changes:"
    echo "   SELECT p.name, pv.name, pv.is_available, pv.in_stock, pv.updated_at"
    echo "   FROM product_variants pv JOIN products p ON p.id = pv.product_id"
    echo "   ORDER BY pv.updated_at DESC LIMIT 20;"
    echo ""
    
    read -p "Open Supabase logs? (y/N): " confirm
    if [[ $confirm =~ ^[Yy]$ ]]; then
        open "https://supabase.com/dashboard/project/nsmrxwnrtsllxvplazmm/functions/printful-inventory-sync/logs" 2>/dev/null || echo "Manual: Go to Supabase → Functions → Logs"
    fi
}

# Main menu loop
while true; do
    show_menu
    read -p "Enter choice [1-5]: " choice
    echo ""
    
    case $choice in
        1) bulk_update ;;
        2) disable_sync ;;
        3) test_printful_response ;;
        4) monitor_activity ;;
        5) echo "👋 Goodbye!"; exit 0 ;;
        *) echo "❌ Invalid option. Please choose 1-5." ;;
    esac
    
    echo ""
    echo "Press Enter to continue..."
    read
    echo ""
done
