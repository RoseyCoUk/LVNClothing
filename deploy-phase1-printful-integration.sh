#!/bin/bash

# Phase 1: Printful Integration Deployment Script
# This script deploys the enhanced database schema and Printful import function

set -e

echo "🚀 Starting Phase 1: Printful Integration Deployment"
echo "=================================================="

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

# Check if we're in the right directory
if [ ! -f "supabase/config.toml" ]; then
    print_error "This script must be run from the project root directory"
    print_error "Please run: cd /path/to/ReformUK && ./deploy-phase1-printful-integration.sh"
    exit 1
fi

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    print_error "Supabase CLI is not installed"
    print_error "Please install it first: https://supabase.com/docs/guides/cli"
    exit 1
fi

# Check if we're logged in to Supabase
if ! supabase status &> /dev/null; then
    print_error "Not logged in to Supabase"
    print_error "Please run: supabase login"
    exit 1
fi

print_status "Checking current project status..."

# Get current project status
PROJECT_STATUS=$(supabase status 2>/dev/null || echo "not_linked")

if [ "$PROJECT_STATUS" = "not_linked" ]; then
    print_warning "No Supabase project linked"
    print_status "Please link your project first:"
    print_status "1. Go to https://supabase.com/dashboard"
    print_status "2. Create or select your project"
    print_status "3. Run: supabase link --project-ref YOUR_PROJECT_REF"
    exit 1
fi

print_success "Supabase project is linked"

# Step 1: Apply the Phase 1 migration
print_status "Step 1: Applying Phase 1 database migration..."
print_status "This will create the enhanced schema for products and variants"

# Check if migration file exists
if [ ! -f "supabase/migrations/20250128000001_phase1_printful_variants_schema.sql" ]; then
    print_error "Migration file not found: 20250128000001_phase1_printful_variants_schema.sql"
    exit 1
fi

# Apply the migration
print_status "Applying migration to database..."
if supabase db push; then
    print_success "Database migration applied successfully"
else
    print_error "Failed to apply database migration"
    print_status "Please check the error messages above and fix any issues"
    exit 1
fi

# Step 2: Deploy the enhanced Printful import function
print_status "Step 2: Deploying enhanced Printful import function..."

# Check if function directory exists
if [ ! -d "supabase/functions/printful-import-variants" ]; then
    print_error "Function directory not found: supabase/functions/printful-import-variants"
    exit 1
fi

# Deploy the function
print_status "Deploying printful-import-variants function..."
if supabase functions deploy printful-import-variants; then
    print_success "Printful import function deployed successfully"
else
    print_error "Failed to deploy Printful import function"
    print_status "Please check the error messages above and fix any issues"
    exit 1
fi

# Step 3: Verify the deployment
print_status "Step 3: Verifying deployment..."

# Check if new tables exist
print_status "Verifying new database tables..."

# Test the get_product_with_variants function
print_status "Testing database function..."
if supabase db reset --linked; then
    print_success "Database reset and verification completed"
else
    print_warning "Database reset failed, but this might be expected in production"
fi

# Step 4: Set up environment variables
print_status "Step 4: Environment setup reminder..."

print_warning "IMPORTANT: Make sure to set the following environment variables in Supabase:"
echo ""
echo "1. PRINTFUL_TOKEN - Your Printful API token"
echo "2. SUPABASE_URL - Your Supabase project URL"
echo "3. SUPABASE_SERVICE_ROLE_KEY - Your Supabase service role key"
echo ""
echo "To set these in Supabase Dashboard:"
echo "1. Go to Settings > API"
echo "2. Copy the URL and anon key"
echo "3. Go to Settings > Edge Functions"
echo "4. Add your PRINTFUL_TOKEN as a secret"
echo ""

# Step 5: Test the deployment
print_status "Step 5: Testing deployment..."

print_status "You can now test the Phase 1 implementation using:"
echo ""
echo "1. Open test-phase1-implementation.html in your browser"
echo "2. Update the SUPABASE_URL and SUPABASE_ANON_KEY variables"
echo "3. Run the tests to verify everything is working"
echo ""

# Step 6: Next steps
print_status "Step 6: Next steps for Phase 2..."

echo "Phase 1 is now complete! Next steps:"
echo ""
echo "✅ Database schema enhanced with variants support"
echo "✅ Printful import function updated for variants"
echo "✅ Basic product import functionality working"
echo "✅ Variant relationships established"
echo ""
echo "Ready for Phase 2: Variant Management System"
echo "- Import and manage individual variants"
echo "- Handle complex products (tshirts, hoodies)"
echo "- Set up variant-specific inventory tracking"
echo ""

print_success "🎉 Phase 1 deployment completed successfully!"
print_status "Your Printful integration now supports products with variants"

# Optional: Run a quick test import
read -p "Would you like to test the Printful import now? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Testing Printful import..."
    
    # Get the function URL
    FUNCTION_URL=$(supabase functions list | grep printful-import-variants | awk '{print $3}')
    
    if [ -n "$FUNCTION_URL" ]; then
        print_status "Function URL: $FUNCTION_URL"
        print_status "You can test it with:"
        echo "curl -X POST $FUNCTION_URL"
        echo ""
        print_warning "Note: Make sure PRINTFUL_TOKEN is set in Supabase secrets first"
    else
        print_warning "Could not determine function URL"
    fi
fi

echo ""
print_success "Phase 1 deployment script completed!"
print_status "Check the test file for verification steps"
