# Starter Bundle Printful Integration Guide

This guide explains how the starter bundle is integrated with Printful and how to test the integration to ensure everything is working correctly.

## 🎯 Overview

The starter bundle includes three products:
- **T-Shirt**: Black, Medium size (Printful Variant ID: 4017)
- **Cap**: Black (Printful Variant ID: 6001)  
- **Mug**: White (Printful Variant ID: 7001)

The bundle is priced at £34.99, offering significant savings compared to purchasing items individually.

## 🏗️ Architecture

### Database Schema

The integration uses several key tables:

1. **`products`** - Main product catalog with Printful product IDs
2. **`product_variants`** - Individual product variants with Printful variant IDs
3. **`bundle_variants`** - Links bundles to their component variants

### Printful Integration

- Each product has a `printful_product_id` linking to Printful's catalog
- Each variant has a `printful_variant_id` for order fulfillment
- The `printful-proxy` Edge Function provides secure access to Printful's API

## 🚀 Setup Instructions

### 1. Apply Database Migration

Run the migration to set up the Printful integration:

```bash
# If using Supabase CLI locally
supabase db push

# Or manually apply the migration
supabase/migrations/20250712000000_add_printful_integration.sql
```

### 2. Verify Environment Variables

Ensure these environment variables are set in your Supabase project:

```bash
# Supabase (auto-configured)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Printful (if using direct API calls)
PRINTFUL_TOKEN=your_printful_token_here
```

### 3. Deploy Edge Functions

Deploy the Printful proxy function:

```bash
supabase functions deploy printful-proxy
```

## 🧪 Testing the Integration

### Step 1: Check Current Database State

Before running the full tests, check your current database state:

1. Open `test-current-database-state.html` in your browser
2. Enter your Supabase URL and anon key
3. Click "Check Current Database State"
4. Review the results to see what needs to be created

### Step 2: Apply Database Migration

If the current state check shows missing tables/columns:

```bash
# Run the deployment script
./deploy-starter-bundle-integration.sh

# Or manually apply migration
supabase db push
```

### Step 3: Run Full Integration Tests

After applying the migration, run the comprehensive tests:

1. Open `test-starter-bundle-printful.html` in your browser
2. Enter your Supabase URL and anon key
3. Click "Run All Tests" to execute the full test suite
4. Review results and fix any issues

### Option 2: Command Line Testing

Use the Node.js test script for automated testing:

```bash
# Set environment variables
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_ANON_KEY="your_anon_key_here"

# Run all tests
node test-starter-bundle-integration.js

# Or with custom parameters
node test-starter-bundle-integration.js \
  --supabase-url="https://your-project.supabase.co" \
  --supabase-key="your_anon_key_here"
```

## 📋 Test Coverage

The test suite verifies:

### Database Tests
- ✅ Database connection to Supabase
- ✅ Product variants exist with Printful IDs
- ✅ Bundle variants are properly linked
- ✅ All products have Printful product IDs

### Printful Integration Tests
- ✅ Printful proxy function accessibility
- ✅ Product variant data retrieval
- ✅ Bundle pricing calculation
- ✅ Complete starter bundle validation

### Expected Results

When all tests pass, you should see:

```
🎉 All tests passed! The starter bundle is properly integrated with Printful.
```

## 🔍 Manual Verification

### Check Database Tables

```sql
-- Verify products have Printful IDs
SELECT name, printful_product_id 
FROM products 
WHERE name IN ('Reform UK T-Shirt', 'Reform UK Cap', 'Reform UK Mug');

-- Verify variants have Printful variant IDs
SELECT p.name as product_name, pv.name as variant_name, pv.printful_variant_id
FROM product_variants pv
JOIN products p ON p.id = pv.product_id
WHERE p.name IN ('Reform UK T-Shirt', 'Reform UK Cap', 'Reform UK Mug');

-- Verify bundle composition
SELECT b.name as bundle_name, p.name as product_name, pv.printful_variant_id
FROM bundle_variants bv
JOIN products b ON b.id = bv.bundle_id
JOIN product_variants pv ON pv.id = bv.product_variant_id
JOIN products p ON p.id = pv.product_id
WHERE b.name = 'Starter Bundle';
```

### Expected Printful IDs

| Product | Variant | Printful Variant ID |
|---------|---------|-------------------|
| T-Shirt | Black M | 4017 |
| Cap | Black | 6001 |
| Mug | White | 7001 |

## 🛠️ Troubleshooting

### Common Issues

1. **Missing Printful IDs**
   - Ensure the migration was applied correctly
   - Check that products exist in the database
   - Verify Printful product IDs are correct

2. **Bundle Variants Not Found**
   - Check if `bundle_variants` table exists
   - Verify the starter bundle product exists
   - Ensure component variants are properly linked

3. **Printful API Errors**
   - Verify Edge Function is deployed
   - Check environment variables
   - Ensure Printful token is valid

4. **CORS and Header Issues**
   - The `apikey` header is not allowed by default
   - Use only `Authorization: Bearer <key>` and `Content-Type: application/json`
   - Ensure your Supabase project allows the required headers

5. **Database Schema Issues**
   - Run `test-current-database-state.html` first to check current state
   - Apply the migration before running full integration tests
   - Verify all required tables and columns exist

### Debug Commands

```bash
# Check Supabase status
supabase status

# View Edge Function logs
supabase functions logs printful-proxy

# Test Edge Function directly
curl -X GET "https://your-project.supabase.co/functions/v1/printful-proxy/products" \
  -H "apikey: your_anon_key" \
  -H "Authorization: Bearer your_anon_key"
```

## 📊 Monitoring

### Key Metrics to Track

- **Order Fulfillment Success Rate**: Should be 100% for properly linked variants
- **Printful API Response Time**: Should be under 2 seconds
- **Bundle Order Volume**: Track starter bundle popularity
- **Error Rates**: Monitor for integration issues

### Log Analysis

Check these logs for issues:

```bash
# Supabase Edge Function logs
supabase functions logs printful-proxy

# Database query logs (if enabled)
supabase db logs

# Application logs (frontend)
# Check browser console for JavaScript errors
```

## 🔄 Maintenance

### Regular Tasks

1. **Weekly**: Run the test suite to verify integration
2. **Monthly**: Review Printful catalog for changes
3. **Quarterly**: Update variant mappings if needed
4. **Annually**: Review and optimize bundle pricing

### Updates

When updating the integration:

1. Test changes in development environment
2. Run full test suite before deployment
3. Monitor production closely after changes
4. Keep backup of working configuration

## 📚 Additional Resources

- [Printful API Documentation](https://developers.printful.com/)
- [Supabase Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [Database Migration Best Practices](https://supabase.com/docs/guides/database/migrations)

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review test results for specific failures
3. Check Supabase and Printful logs
4. Verify environment configuration
5. Test with minimal configuration to isolate issues

---

**Last Updated**: July 12, 2025  
**Version**: 1.0.0  
**Status**: Production Ready ✅
