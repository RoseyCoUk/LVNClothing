#!/bin/bash

# Deploy Variant JSONB Fields Fix Migration
# This script runs the migration to convert JSONB color, color_hex, and size fields to proper string fields

set -e

echo "🚀 Deploying Variant JSONB Fields Fix Migration..."

# Check if we're in the right directory
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if Supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "❌ Error: Supabase CLI is not installed or not in PATH"
    echo "Please install it first: https://supabase.com/docs/reference/cli"
    exit 1
fi

# Check if we're logged in to Supabase
if ! supabase status &> /dev/null; then
    echo "❌ Error: Not logged in to Supabase or project not linked"
    echo "Please run: supabase login"
    echo "Then: supabase link --project-ref YOUR_PROJECT_REF"
    exit 1
fi

echo "📋 Current project status:"
supabase status

echo ""
echo "🔍 Checking current table structure..."
echo "Running migration to fix JSONB fields..."

# Run the migration
echo "📝 Applying migration: 20250129000000_fix_variant_jsonb_fields.sql"
supabase db push

echo ""
echo "✅ Migration completed successfully!"
echo ""
echo "📊 The following changes were made:"
echo "  • Added temporary columns: color_name, color_hex_code, size_name"
echo "  • Extracted values from JSONB color, color_hex, and size fields"
echo "  • Updated existing columns with extracted string values"
echo "  • Added performance indexes on new columns"
echo "  • Maintained backward compatibility"
echo ""
echo "🎯 Benefits:"
echo "  • Frontend no longer needs complex JSONB parsing"
echo "  • Cleaner, more efficient database queries"
echo "  • Better performance with proper indexes"
echo "  • Consistent data format across all variants"
echo ""
echo "🧪 To verify the migration:"
echo "  1. Check the admin products page"
echo "  2. Go to Variants tab for any product"
echo "  3. Verify that color and size display correctly"
echo "  4. Check that Images button tooltips show proper values"
echo ""
echo "📝 Note: The temporary columns (color_name, color_hex_code, size_name) are kept"
echo "   for reference. You can remove them later if desired by uncommenting the"
echo "   DROP COLUMN statements in the migration file."
echo ""
echo "🚀 Migration deployment complete!"
