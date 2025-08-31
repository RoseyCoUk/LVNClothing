# Backend Integration Setup Guide

This guide will help you get the admin products backend integration fully working with live data.

## 🚀 Quick Start

### 1. Deploy the Printful Sync Edge Function

```bash
# Make the deployment script executable
chmod +x deploy-printful-sync.sh

# Deploy the function
./deploy-printful-sync.sh
```

### 2. Set Up Environment Variables

```bash
# Set your Printful API token in Supabase secrets
supabase secrets set PRINTFUL_TOKEN=your_actual_printful_token_here

# Verify your environment variables are set
supabase secrets list
```

### 3. Seed the Database with Sample Data

```bash
# Run the seeding script in your Supabase dashboard SQL editor
# Copy and paste the contents of: scripts/seed-admin-products-data.sql
```

### 4. Test the Backend Integration

```bash
# Run the comprehensive test script
node scripts/test-backend-integration.js
```

## 📋 Prerequisites

- ✅ Supabase CLI installed and configured
- ✅ Supabase project set up and running
- ✅ Printful API token (get from your Printful dashboard)
- ✅ All database migrations applied
- ✅ RLS policies enabled

## 🔧 Detailed Setup Steps

### Step 1: Verify Database Schema

Ensure all required tables exist and have the correct structure:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'products', 'product_overrides', 'product_images', 
  'bundles', 'bundle_items', 'sync_status', 
  'inventory_changes', 'sync_errors', 'data_conflicts',
  'webhook_logs', 'notifications'
);
```

### Step 2: Verify RLS Policies

Check that Row Level Security is properly configured:

```sql
-- Check RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
  'products', 'product_overrides', 'product_images', 
  'bundles', 'bundle_items'
);
```

### Step 3: Test Database Permissions

Verify that authenticated users can access the tables:

```sql
-- Test read access
SELECT COUNT(*) FROM products;
SELECT COUNT(*) FROM product_overrides;
SELECT COUNT(*) FROM bundles;

-- Test write access (create a test record)
INSERT INTO products (
  printful_product_id, name, description, 
  retail_price, printful_cost, category, is_available
) VALUES (
  'test-product', 'Test Product', 'Test Description',
  19.99, 8.50, 'test', true
);

-- Clean up test record
DELETE FROM products WHERE printful_product_id = 'test-product';
```

## 🌐 Edge Function Configuration

### Printful Sync Function

The `printful-sync` Edge Function handles:

- **Product synchronization** with Printful API
- **Inventory updates** in real-time
- **Variant management** and pricing
- **Error handling** and logging
- **Status tracking** for sync operations

### Function Endpoints

```typescript
// Available sync actions
type SyncAction = 
  | 'sync_product'      // Sync product details
  | 'sync_inventory'    // Sync inventory levels
  | 'sync_variants'     // Sync variant information
  | 'full_sync';        // Complete product sync
```

### Testing the Function

```bash
# Test the function availability
curl -X OPTIONS https://your-project.supabase.co/functions/v1/printful-sync

# Test a sync operation
curl -X POST https://your-project.supabase.co/functions/v1/printful-sync \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer your_anon_key' \
  -d '{"productId": "test-product", "action": "full_sync"}'
```

## 🔐 Security Configuration

### Environment Variables

Set these in your Supabase project:

```bash
# Required
PRINTFUL_TOKEN=your_printful_api_token

# Optional (for enhanced security)
PRINTFUL_WEBHOOK_SECRET=your_webhook_secret
PRINTFUL_STORE_ID=your_store_id
```

### RLS Policy Verification

Ensure these policies are active:

```sql
-- Check active policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public';
```

## 📊 Data Flow

### 1. Product Management Flow

```
Admin Interface → AdminProductsContext → AdminProductsAPI → Supabase Database
```

### 2. Printful Sync Flow

```
Admin Trigger → Edge Function → Printful API → Database Update → Real-time Update
```

### 3. Webhook Processing Flow

```
Printful Webhook → Edge Function → Database Update → Admin Notification
```

## 🧪 Testing Strategy

### Unit Tests

- ✅ API function tests
- ✅ Context state management tests
- ✅ Database operation tests

### Integration Tests

- ✅ End-to-end CRUD operations
- ✅ Printful sync functionality
- ✅ Real-time updates

### Performance Tests

- ✅ Database query performance
- ✅ Image upload/download
- ✅ Bulk operations

## 🚨 Troubleshooting

### Common Issues

#### 1. RLS Policy Errors

```sql
-- Check if RLS is blocking operations
SELECT * FROM pg_stat_activity 
WHERE query LIKE '%RLS%' OR query LIKE '%policy%';
```

#### 2. Permission Denied Errors

```sql
-- Verify user permissions
SELECT 
  grantee, 
  privilege_type, 
  table_name
FROM information_schema.role_table_grants 
WHERE table_schema = 'public';
```

#### 3. Edge Function Deployment Issues

```bash
# Check function status
supabase functions list

# View function logs
supabase functions logs printful-sync

# Redeploy if needed
supabase functions deploy printful-sync --no-verify-jwt
```

### Debug Mode

Enable detailed logging in your Edge Functions:

```typescript
// Add to your Edge Function
console.log('Request details:', {
  method: req.method,
  url: req.url,
  headers: Object.fromEntries(req.headers.entries()),
  body: await req.text()
});
```

## 📈 Monitoring & Observability

### Database Monitoring

```sql
-- Monitor table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Sync Status Monitoring

```sql
-- Check sync health
SELECT 
  COUNT(*) as total_products,
  COUNT(CASE WHEN last_sync_status = 'success' THEN 1 END) as synced_products,
  COUNT(CASE WHEN last_sync_status = 'failed' THEN 1 END) as failed_syncs,
  MAX(last_sync) as last_sync_time
FROM sync_status;
```

### Error Tracking

```sql
-- Monitor sync errors
SELECT 
  type,
  severity,
  COUNT(*) as error_count,
  MAX(timestamp) as latest_error
FROM sync_errors 
WHERE resolved = false
GROUP BY type, severity
ORDER BY error_count DESC;
```

## 🎯 Success Criteria

Your backend integration is fully working when:

1. ✅ All database tables are accessible
2. ✅ CRUD operations work for all entities
3. ✅ Printful sync function is deployed and accessible
4. ✅ Real-time updates are working
5. ✅ All tests pass successfully
6. ✅ Admin interface can manage products with live data

## 🚀 Next Steps

Once your backend is fully integrated:

1. **Test the admin interface** with real data
2. **Set up Printful webhooks** for real-time updates
3. **Configure monitoring** and alerting
4. **Optimize performance** based on usage patterns
5. **Deploy to production** environment

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the test results for specific failures
3. Check Supabase function logs for errors
4. Verify your environment variables are set correctly
5. Ensure all migrations have been applied

---

**🎉 Congratulations!** Once you complete this setup, you'll have a fully functional admin products management system with live data integration.
