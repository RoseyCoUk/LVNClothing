#!/bin/bash

# Printful Sync Setup Script
# This script helps you set up and run the Printful product sync

set -e

echo "🚀 Printful Product Sync Setup"
echo "=============================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "src" ]; then
    echo "❌ Error: Please run this script from your project root directory"
    exit 1
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local file..."
    cp env-template.txt .env.local
    echo "✅ Created .env.local from template"
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env.local and add your Printful credentials:"
    echo "   - PRINTFUL_TOKEN=your_private_token_here"
    echo "   - PRINTFUL_STORE_ID=your_store_id_here"
    echo ""
    read -p "Press Enter after you've updated .env.local..."
else
    echo "✅ .env.local already exists"
fi

# Check if Printful variables are set
source .env.local 2>/dev/null || true

if [ -z "$PRINTFUL_TOKEN" ] || [ "$PRINTFUL_TOKEN" = "your_printful_private_token_here" ]; then
    echo "❌ PRINTFUL_TOKEN not set in .env.local"
    echo "Please get your token from: Printful Dashboard → Settings → API → Create Private Token"
    exit 1
fi

if [ -z "$PRINTFUL_STORE_ID" ] || [ "$PRINTFUL_STORE_ID" = "your_printful_store_id_here" ]; then
    echo "❌ PRINTFUL_STORE_ID not set in .env.local"
    echo ""
    echo "To find your store ID, run:"
    echo "curl -H 'Authorization: Bearer $PRINTFUL_TOKEN' https://api.printful.com/v2/stores"
    echo ""
    echo "Or visit: Printful Dashboard → Stores → Your Store → Copy the Store ID"
    exit 1
fi

echo "✅ Environment variables configured"
echo "   Token: ${PRINTFUL_TOKEN:0:8}..."
echo "   Store ID: $PRINTFUL_STORE_ID"
echo ""

# Check if scripts directory exists
if [ ! -d "scripts" ]; then
    echo "❌ Error: scripts directory not found"
    echo "Please ensure you have the printful-sync.ts script in scripts/"
    exit 1
fi

# Check if the sync script exists
if [ ! -f "scripts/printful-sync.ts" ]; then
    echo "❌ Error: scripts/printful-sync.ts not found"
    echo "Please ensure you have the Printful sync script"
    exit 1
fi

echo "🔍 Verifying Printful access..."
echo ""

# Test API access
if curl -s -H "Authorization: Bearer $PRINTFUL_TOKEN" "https://api.printful.com/v2/stores" > /dev/null 2>&1; then
    echo "✅ Printful API access verified"
else
    echo "❌ Failed to access Printful API"
    echo "Please check your token and internet connection"
    exit 1
fi

echo ""
echo "🎯 Ready to sync! You can now run:"
echo ""
echo "   npm run printful:sync"
echo ""
echo "Or directly with:"
echo "   tsx scripts/printful-sync.ts"
echo ""

# Ask if user wants to run sync now
read -p "Would you like to run the sync now? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Starting Printful sync..."
    echo ""
    
    # Export variables for the script
    export PRINTFUL_TOKEN
    export PRINTFUL_STORE_ID
    
    # Run the sync script
    npm run printful:sync
    
    echo ""
    echo "🎉 Sync completed! Check the generated files in src/hooks/"
    echo ""
    echo "Next steps:"
    echo "1. Review the generated variant files"
    echo "2. Update your frontend code to use the new structure"
    echo "3. Test with real Printful catalog variant IDs"
    echo "4. Check the migration guide: scripts/MIGRATION_GUIDE.md"
else
    echo "📋 Setup complete! Run the sync when you're ready:"
    echo "   npm run printful:sync"
fi

echo ""
echo "📚 Documentation:"
echo "   - scripts/README.md - Complete usage guide"
echo "   - scripts/MIGRATION_GUIDE.md - Migration instructions"
echo "   - scripts/sample-updated-variants.ts - Example output"
echo ""
echo "🔧 Need help? Check the documentation or run the script with --help"
