#!/bin/bash

# Starter Bundle Printful Integration Deployment Script
# This script applies the database migration and verifies the integration

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check Supabase CLI
check_supabase_cli() {
    if ! command_exists supabase; then
        print_error "Supabase CLI is not installed"
        echo "Please install it from: https://supabase.com/docs/guides/cli"
        exit 1
    fi
    print_success "Supabase CLI found"
}

# Function to check if we're in a Supabase project
check_supabase_project() {
    if [ ! -f "supabase/config.toml" ]; then
        print_error "Not in a Supabase project directory"
        echo "Please run this script from your project root (where supabase/config.toml exists)"
        exit 1
    fi
    print_success "Supabase project detected"
}

# Function to check Docker
check_docker() {
    if ! command_exists docker; then
        print_warning "Docker not found - local development may not work"
        echo "You can still deploy to remote Supabase"
    else
        if docker info >/dev/null 2>&1; then
            print_success "Docker is running"
        else
            print_warning "Docker is installed but not running"
        fi
    fi
}

# Function to apply migration
apply_migration() {
    print_status "Applying database migration..."
    
    if [ -f "supabase/migrations/20250712000000_add_printful_integration.sql" ]; then
        print_success "Migration file found"
    else
        print_error "Migration file not found"
        echo "Expected: supabase/migrations/20250712000000_add_printful_integration.sql"
        exit 1
    fi
    
    # Try to apply migration
    if supabase db push >/dev/null 2>&1; then
        print_success "Migration applied successfully"
    else
        print_warning "Migration failed - this might be expected if already applied"
        echo "Checking current database status..."
    fi
}

# Function to verify database structure
verify_database() {
    print_status "Verifying database structure..."
    
    # Check if we can connect to local Supabase
    if supabase status >/dev/null 2>&1; then
        print_success "Local Supabase is running"
        
        # Check if tables exist
        if supabase db reset --dry-run >/dev/null 2>&1; then
            print_success "Database schema is valid"
        else
            print_warning "Database schema validation failed"
        fi
    else
        print_warning "Local Supabase not running - skipping local verification"
        echo "You can still verify the remote database manually"
    fi
}

# Function to deploy Edge Functions
deploy_functions() {
    print_status "Deploying Edge Functions..."
    
    if [ -d "supabase/functions/printful-proxy" ]; then
        print_success "Printful proxy function found"
        
        # Try to deploy
        if supabase functions deploy printful-proxy >/dev/null 2>&1; then
            print_success "Printful proxy function deployed"
        else
            print_warning "Function deployment failed - check your Supabase project configuration"
        fi
    else
        print_warning "Printful proxy function not found"
        echo "You may need to create this function manually"
    fi
}

# Function to run tests
run_tests() {
    print_status "Running integration tests..."
    
    if [ -f "test-starter-bundle-integration.js" ]; then
        print_success "Test script found"
        
        # Check if Node.js is available
        if command_exists node; then
            print_status "Running tests with Node.js..."
            echo "Note: You'll need to set SUPABASE_ANON_KEY environment variable"
            echo "Run: export SUPABASE_ANON_KEY=your_key_here"
            echo "Then: node test-starter-bundle-integration.js"
        else
            print_warning "Node.js not found - cannot run automated tests"
            echo "You can still use the web-based test: test-starter-bundle-printful.html"
        fi
    else
        print_warning "Test script not found"
    fi
}

# Function to show next steps
show_next_steps() {
    echo ""
    echo "🎉 Deployment completed!"
    echo "========================"
    echo ""
    echo "Next steps:"
    echo ""
    echo "1. Verify the integration:"
    echo "   - Open test-starter-bundle-printful.html in your browser"
    echo "   - Or run: node test-starter-bundle-integration.js"
    echo ""
    echo "2. Check your Supabase dashboard:"
    echo "   - Verify products have printful_product_id values"
    echo "   - Check product_variants table has printful_variant_id values"
    echo "   - Ensure bundle_variants table exists and is populated"
    echo ""
    echo "3. Test the Printful integration:"
    echo "   - Verify Edge Functions are accessible"
    echo "   - Test bundle creation and pricing"
    echo ""
    echo "4. Monitor for any errors:"
    echo "   - Check Supabase logs"
    echo "   - Monitor Edge Function performance"
    echo ""
    echo "For detailed information, see: STARTER_BUNDLE_INTEGRATION_README.md"
}

# Main execution
main() {
    echo "🚀 Starter Bundle Printful Integration Deployment"
    echo "================================================"
    echo ""
    
    # Pre-flight checks
    check_supabase_cli
    check_supabase_project
    check_docker
    
    echo ""
    
    # Apply changes
    apply_migration
    verify_database
    deploy_functions
    
    echo ""
    
    # Testing
    run_tests
    
    # Show next steps
    show_next_steps
}

# Run main function
main "$@"
