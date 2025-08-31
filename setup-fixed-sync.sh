#!/bin/bash

# ================================================
# Setup Fixed Sync Function with Real Printful API
# ================================================

echo "🚀 SETTING UP FIXED SYNC FUNCTION"
echo "================================="
echo ""

# Step 1: Add the new cron job for fixed function
echo "📅 Setting up NEW cron job with FIXED function..."

FIXED_CRON_JOB="*/15 * * * * curl -X POST 'https://nsmrxwnrtsllxvplazmm.supabase.co/functions/v1/printful-inventory-sync-fixed' -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zbXJ4d25ydHNsbHh2cGxhem1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0OTY0NTIsImV4cCI6MjA2NzA3MjQ1Mn0.XyHiuQHXW_laGE4Caond1-8xK-2B4NzDzIOX8baD4UM'"

# Add the new cron job
(crontab -l 2>/dev/null; echo "$FIXED_CRON_JOB") | crontab -

echo "✅ NEW cron job added (uses REAL Printful API)"
echo ""
echo "📋 Current crontab:"
crontab -l
echo ""
echo "🎯 The fixed function will now:"
echo "   ✅ Call REAL Printful API"
echo "   ✅ Get accurate inventory data"
echo "   ✅ Stop random stock changes"
echo ""

# Step 2: Show environment variable setup
echo "🔧 NEXT: Set Printful API token in Supabase"
echo "=========================================="
echo ""
echo "1. Go to: https://supabase.com/dashboard/project/nsmrxwnrtsllxvplazmm/settings/environment-variables"
echo ""
echo "2. Add new environment variable:"
echo "   Name: PRINTFUL_API_TOKEN"
echo "   Value: dHfrvwWHc1abLufS0xz4EEEqgE0XboN7cDMX24mB"
echo ""
echo "3. Click 'Add variable' and restart functions"
echo ""

# Step 3: Test the fixed function
echo "🧪 To test the FIXED function manually:"
echo "======================================"
echo ""
echo "curl -X POST 'https://nsmrxwnrtsllxvplazmm.supabase.co/functions/v1/printful-inventory-sync-fixed' \\"
echo "  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zbXJ4d25ydHNsbHh2cGxhem1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0OTY0NTIsImV4cCI6MjA2NzA3MjQ1Mn0.XyHiuQHXW_laGE4Caond1-8xK-2B4NzDzIOX8baD4UM'"
echo ""

echo "🎉 SUMMARY:"
echo "==========="
echo "✅ Broken sync disabled"
echo "✅ Fixed sync function deployed"  
echo "✅ New cron job using REAL Printful API"
echo "⏳ Waiting for you to set API token in Supabase"
echo ""
echo "📋 Next: Run the SQL bulk update script in Supabase"
