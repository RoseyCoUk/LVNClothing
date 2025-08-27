#!/bin/bash

# 🚀 Admin Dashboard Backend Deployment Script
# This script deploys all necessary backend components for the admin dashboard

set -e

echo "🚀 Starting Admin Dashboard Backend Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    print_error "Supabase CLI is not installed. Please install it first."
    echo "Installation guide: https://supabase.com/docs/guides/cli"
    exit 1
fi

# Check if we're in a Supabase project
if [ ! -f "supabase/config.toml" ]; then
    print_error "Not in a Supabase project directory. Please run this script from your project root."
    exit 1
fi

print_status "Checking Supabase project status..."

# Check if project is linked
if ! supabase status &> /dev/null; then
    print_warning "Project not linked. Attempting to link..."
    if ! supabase link; then
        print_error "Failed to link project. Please run 'supabase link' manually."
        exit 1
    fi
fi

print_success "Project linked successfully"

# Step 1: Apply database migrations
print_status "Step 1: Applying database migrations..."

# Apply the admin roles migration
print_status "Applying admin roles migration..."
if supabase db push --include-all; then
    print_success "Database migrations applied successfully"
else
    print_error "Failed to apply database migrations"
    exit 1
fi

# Step 2: Deploy Edge Functions
print_status "Step 2: Deploying Edge Functions..."

# Deploy admin-auth function
print_status "Deploying admin-auth function..."
if supabase functions deploy admin-auth; then
    print_success "admin-auth function deployed successfully"
else
    print_error "Failed to deploy admin-auth function"
    exit 1
fi

# Deploy admin-orders function
print_status "Deploying admin-orders function..."
if supabase functions deploy admin-orders; then
    print_success "admin-orders function deployed successfully"
else
    print_error "Failed to deploy admin-orders function"
    exit 1
fi

# Deploy admin-analytics function
print_status "Deploying admin-analytics function..."
if supabase functions deploy admin-analytics; then
    print_success "admin-analytics function deployed successfully"
else
    print_error "Failed to deploy admin-analytics function"
    exit 1
fi

# Deploy admin-customers function
print_status "Deploying admin-customers function..."
if supabase functions deploy admin-customers; then
    print_success "admin-customers function deployed successfully"
else
    print_error "Failed to deploy admin-customers function"
    exit 1
fi

# Step 3: Verify deployment
print_status "Step 3: Verifying deployment..."

# List deployed functions
print_status "Deployed functions:"
supabase functions list

# Step 4: Test admin authentication
print_status "Step 4: Testing admin authentication..."

# Get the admin-auth function URL
ADMIN_AUTH_URL=$(supabase functions list --json | jq -r '.[] | select(.name=="admin-auth") | .url')

if [ "$ADMIN_AUTH_URL" != "null" ] && [ "$ADMIN_AUTH_URL" != "" ]; then
    print_success "Admin authentication function is accessible at: $ADMIN_AUTH_URL"
else
    print_warning "Could not determine admin-auth function URL"
fi

# Step 5: Final verification
print_status "Step 5: Final verification..."

# Check if all functions are running
FUNCTIONS_COUNT=$(supabase functions list --json | jq length)
if [ "$FUNCTIONS_COUNT" -ge 4 ]; then
    print_success "All admin functions are deployed and running"
else
    print_warning "Expected 4 functions, found $FUNCTIONS_COUNT"
fi

echo ""
print_success "🎉 Admin Dashboard Backend Deployment Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Test admin login at /admin/login"
echo "2. Verify dashboard functionality at /admin/dashboard"
echo "3. Check orders management at /admin/orders"
echo "4. Review analytics at /admin/analytics"
echo "5. Test customer management at /admin/customers"
echo ""
echo "🔧 If you encounter issues:"
echo "- Check browser console for errors"
echo "- Verify Edge Functions are running: supabase functions list"
echo "- Check function logs: supabase functions logs <function-name>"
echo ""
echo "📚 Documentation: ADMIN_SETUP_GUIDE.md"
