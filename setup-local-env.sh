#!/bin/bash

echo "Setting up local environment for Reform UK development..."

# Check if Supabase is running
if ! supabase status > /dev/null 2>&1; then
    echo "❌ Supabase is not running. Please start it first with: supabase start"
    exit 1
fi

echo "✅ Supabase is running"

# Create local environment file for functions
echo "Creating local environment file for Supabase functions..."

# Get the current secrets from Supabase
echo "Fetching current secrets from Supabase..."

# Create a local .env file for the functions
cat > supabase/.env.local << EOF
# Local development environment variables
# These will be used by Supabase functions when running locally

# Supabase Configuration
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZXZ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU

# Stripe Configuration (you'll need to add your actual Stripe test key)
STRIPE_SECRET_KEY=sk_test_your_stripe_test_key_here

# Printful Configuration (you'll need to add your actual Printful token)
PRINTFUL_TOKEN=your_printful_token_here

# Other Configuration
APP_NAME=Reform UK Store
APP_VERSION=1.0.0
EOF

echo "✅ Created supabase/.env.local"
echo ""
echo "⚠️  IMPORTANT: You need to edit supabase/.env.local and add your actual:"
echo "   - STRIPE_SECRET_KEY (get from https://dashboard.stripe.com/test/apikeys)"
echo "   - PRINTFUL_TOKEN (get from https://www.printful.com/dashboard/api)"
echo ""
echo "After editing the file, restart the functions with:"
echo "   supabase functions serve --env-file supabase/.env.local"
echo ""
echo "Or test with the current setup using the test page."
