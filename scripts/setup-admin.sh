#!/bin/bash

# Reform UK Admin Dashboard Setup Script
# This script helps you set up the admin system and create your first admin user

echo "🚀 Setting up Reform UK Admin Dashboard..."
echo "=========================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Error: Supabase CLI is not installed"
    echo "Please install it first: https://supabase.com/docs/guides/cli"
    exit 1
fi

echo "✅ Supabase CLI found"

# Check if we're logged into Supabase
if ! supabase status &> /dev/null; then
    echo "❌ Error: Not logged into Supabase or project not linked"
    echo "Please run: supabase login && supabase link"
    exit 1
fi

echo "✅ Supabase project linked"

# Apply the admin migration
echo "📊 Applying admin database migration..."
supabase db push

if [ $? -eq 0 ]; then
    echo "✅ Database migration applied successfully"
else
    echo "❌ Error applying database migration"
    exit 1
fi

# Deploy the admin-auth Edge Function
echo "🔐 Deploying admin authentication Edge Function..."
supabase functions deploy admin-auth

if [ $? -eq 0 ]; then
    echo "✅ Edge Function deployed successfully"
else
    echo "❌ Error deploying Edge Function"
    exit 1
fi

echo ""
echo "🎉 Admin Dashboard Setup Complete!"
echo "=================================="
echo ""
echo "Next steps:"
echo "1. Create your first admin user by running:"
echo "   npm run create-admin"
echo ""
echo "2. Access the admin dashboard at:"
echo "   http://localhost:5173/admin/login"
echo ""
echo "3. Use your regular user credentials to log in"
echo ""
echo "Note: You'll need to manually assign admin roles in the database"
echo "until you create the first super admin user."
echo ""
echo "For help with database setup, see: ADMIN_DASHBOARD_README.md"
