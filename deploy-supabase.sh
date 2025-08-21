#!/bin/bash

# Supabase + Stripe Integration Deployment Script
# This script automates the deployment of all components

set -e  # Exit on any error

echo "🚀 Starting Supabase + Stripe Integration Deployment"
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

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    print_error "Supabase CLI is not installed. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

print_success "Supabase CLI found"

# Check if we're in a Supabase project
if [ ! -f "supabase/config.toml" ]; then
    print_error "Not in a Supabase project directory. Please run 'supabase init' first."
    exit 1
fi

print_success "Supabase project detected"

# Step 1: Deploy database migrations
print_status "Deploying database migrations..."
if supabase db push; then
    print_success "Database migrations deployed successfully"
else
    print_error "Failed to deploy database migrations"
    exit 1
fi

# Step 2: Deploy Edge Functions
print_status "Deploying Edge Functions..."

# Deploy each function individually for better error handling
functions=("stripe-webhook2" "send-order-email" "manual-test-insert")

for func in "${functions[@]}"; do
    print_status "Deploying $func..."
    if supabase functions deploy "$func"; then
        print_success "$func deployed successfully"
    else
        print_error "Failed to deploy $func"
        exit 1
    fi
done

# Step 3: Verify deployment
print_status "Verifying deployment..."

# Check if functions are accessible
project_url=$(supabase status --output json | jq -r '.api.url' 2>/dev/null || echo "")

if [ -n "$project_url" ]; then
    print_success "Project URL: $project_url"
    
    # Test function endpoints
    for func in "${functions[@]}"; do
        print_status "Testing $func endpoint..."
        if curl -s -o /dev/null -w "%{http_code}" "$project_url/functions/v1/$func" | grep -q "200\|401\|403"; then
            print_success "$func endpoint is accessible"
        else
            print_warning "$func endpoint may not be accessible (this is normal for POST-only functions)"
        fi
    done
else
    print_warning "Could not determine project URL. Please check manually."
fi

# Step 4: Environment variables check
print_status "Checking environment variables..."

required_vars=(
    "STRIPE_SECRET_KEY"
    "STRIPE_WEBHOOK_SECRET"
    "RESEND_API_KEY"
    "SUPABASE_URL"
    "SUPABASE_SERVICE_ROLE_KEY"
)

missing_vars=()

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -eq 0 ]; then
    print_success "All required environment variables are set"
else
    print_warning "Missing environment variables:"
    for var in "${missing_vars[@]}"; do
        echo "  - $var"
    done
    echo ""
    print_status "Please set these in your Supabase dashboard:"
    echo "  Settings > API > Environment Variables"
fi

# Step 5: Final instructions
echo ""
echo "🎉 Deployment completed!"
echo "========================"
echo ""
echo "Next steps:"
echo "1. Configure Stripe webhook endpoint:"
echo "   URL: $project_url/functions/v1/stripe-webhook2"
echo "   Events: checkout.session.completed"
echo ""
echo "2. Test the integration:"
echo "   - Use the TestPaymentFlow component in your frontend"
echo "   - Check Supabase logs for any errors"
echo "   - Verify email delivery"
echo ""
echo "3. Monitor the system:"
echo "   - Check Edge Function logs: supabase functions logs"
echo "   - Monitor database triggers"
echo "   - Track email delivery rates"
echo ""
echo "For detailed setup instructions, see SUPABASE_SETUP.md"
echo ""

print_success "Deployment script completed successfully!" 