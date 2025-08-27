# 🚀 Complete Admin Dashboard Backend Setup Guide

This guide will walk you through setting up the complete backend infrastructure for your admin dashboard, including all Edge Functions, database functions, and API integrations.

## 📋 Prerequisites

- ✅ Supabase CLI installed and configured
- ✅ Supabase project linked to your local environment
- ✅ Admin user created with proper permissions
- ✅ Database migrations applied

## 🏗️ Backend Architecture Overview

Your admin dashboard backend consists of:

1. **Database Layer**
   - Admin roles and permissions tables
   - Analytics and reporting functions
   - RLS policies for security

2. **Edge Functions Layer**
   - `admin-auth` - Authentication and permission checking
   - `admin-orders` - Order management operations
   - `admin-analytics` - Business intelligence and reporting
   - `admin-customers` - Customer management operations

3. **Frontend Integration**
   - Admin API client for seamless communication
   - React context for state management
   - Protected routes and permission checking

## 🚀 Quick Setup (Automated)

### Option 1: Use the Deployment Script (Recommended)

```bash
# Make the script executable
chmod +x scripts/deploy-admin-backend.sh

# Run the complete deployment
npm run deploy:admin
```

This script will:
- ✅ Apply all database migrations
- ✅ Deploy all Edge Functions
- ✅ Verify deployment status
- ✅ Test connectivity

### Option 2: Manual Setup

If you prefer manual control, follow the steps below.

## 📊 Step-by-Step Manual Setup

### Step 1: Apply Database Migrations

```bash
# Apply the admin roles migration
supabase db push --include-all

# Verify the tables were created
supabase db diff
```

### Step 2: Deploy Edge Functions

```bash
# Deploy admin authentication function
supabase functions deploy admin-auth

# Deploy orders management function
supabase functions deploy admin-orders

# Deploy analytics function
supabase functions deploy admin-analytics

# Deploy customers management function
supabase functions deploy admin-customers
```

### Step 3: Verify Deployment

```bash
# List all deployed functions
supabase functions list

# Check function status
supabase functions logs admin-auth
```

## 🔧 Configuration Details

### Environment Variables

Ensure these are set in your `.env.local`:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Edge Function URLs

After deployment, your functions will be available at:

```
https://your-project.supabase.co/functions/v1/admin-auth
https://your-project.supabase.co/functions/v1/admin-orders
https://your-project.supabase.co/functions/v1/admin-analytics
https://your-project.supabase.co/functions/v1/admin-customers
```

## 🧪 Testing Your Backend

### Test 1: Admin Authentication

```bash
# Test the admin-auth function
curl -X POST https://your-project.supabase.co/functions/v1/admin-auth \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"action": "get_role"}'
```

### Test 2: Orders Management

```bash
# Test the admin-orders function
curl -X POST https://your-project.supabase.co/functions/v1/admin-orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"action": "get_orders", "page": 1, "limit": 10}'
```

### Test 3: Analytics

```bash
# Test the admin-analytics function
curl -X POST https://your-project.supabase.co/functions/v1/admin-analytics \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"action": "get_dashboard_stats"}'
```

## 🔍 Troubleshooting

### Common Issues and Solutions

#### Issue 1: "Function not found" Error

**Cause**: Edge Function not deployed or wrong URL
**Solution**: 
```bash
# Redeploy the function
supabase functions deploy admin-auth

# Check function status
supabase functions list
```

#### Issue 2: CORS Errors

**Cause**: Cross-origin request blocked
**Solution**: Edge Functions include CORS headers by default. If issues persist:

```typescript
// Check the CORS headers in your Edge Function
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
```

#### Issue 3: Authentication Errors

**Cause**: Invalid or expired access token
**Solution**: 
```bash
# Check your session
supabase auth session

# Re-authenticate if needed
supabase auth login
```

#### Issue 4: Permission Denied

**Cause**: User doesn't have admin role or permissions
**Solution**: Verify admin role setup:

```sql
-- Check if user has admin role
SELECT * FROM public.admin_roles WHERE user_id = 'your-user-id';

-- Check permissions
SELECT * FROM public.admin_role_permissions arp
JOIN public.admin_permissions ap ON arp.permission_id = ap.id
JOIN public.admin_roles ar ON arp.admin_role_id = ar.id
WHERE ar.user_id = 'your-user-id';
```

## 📱 Frontend Integration

### Using the Admin API Client

```typescript
import { adminAPI } from '../lib/admin-api'

// Get dashboard statistics
const stats = await adminAPI.getDashboardStats()

// Get orders with pagination
const orders = await adminAPI.getOrders(1, 20, 'pending')

// Update order status
await adminAPI.updateOrderStatus('order-id', 'shipped')

// Get customer details
const customer = await adminAPI.getCustomerDetails('customer-id')
```

### Permission Checking

```typescript
import { useAdmin } from '../contexts/AdminContext'

function AdminComponent() {
  const { checkPermission } = useAdmin()
  
  // Check if user can manage orders
  const canManageOrders = checkPermission('orders', 'write')
  
  // Check if user can view analytics
  const canViewAnalytics = checkPermission('analytics', 'read')
  
  return (
    <div>
      {canManageOrders && <OrderManagementPanel />}
      {canViewAnalytics && <AnalyticsDashboard />}
    </div>
  )
}
```

## 🔒 Security Considerations

### Row Level Security (RLS)

All admin tables have RLS enabled with appropriate policies:

- Users can only view their own admin roles
- Only super admins can manage admin roles
- Admin permissions are read-only for regular users

### Edge Function Security

- All functions require valid authentication
- Admin permission checking on every request
- CORS properly configured for web requests

### API Rate Limiting

Consider implementing rate limiting for production:

```typescript
// Example rate limiting in Edge Functions
const rateLimit = new Map()
const MAX_REQUESTS = 100
const WINDOW_MS = 60000 // 1 minute

// Check rate limit before processing request
```

## 📈 Performance Optimization

### Database Indexes

Key indexes are created for performance:

```sql
-- Admin roles lookup
CREATE INDEX idx_admin_roles_user_id ON public.admin_roles(user_id);

-- Permission checking
CREATE INDEX idx_admin_permissions_resource_action ON public.admin_permissions(resource, action);

-- Order analytics
CREATE INDEX idx_orders_created_at ON public.orders(created_at);
CREATE INDEX idx_orders_status ON public.orders(status);
```

### Caching Strategy

Consider implementing caching for frequently accessed data:

```typescript
// Example caching in Edge Functions
const cache = new Map()
const CACHE_TTL = 300000 // 5 minutes

function getCachedData(key: string) {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  return null
}
```

## 🚀 Production Deployment

### Environment Setup

```bash
# Set production environment
supabase link --project-ref your-production-ref

# Deploy to production
supabase functions deploy admin-auth --project-ref your-production-ref
```

### Monitoring and Logs

```bash
# View function logs
supabase functions logs admin-auth --project-ref your-production-ref

# Monitor function performance
supabase functions logs admin-analytics --project-ref your-production-ref
```

## 📚 Additional Resources

- [Supabase Edge Functions Documentation](https://supabase.com/docs/guides/functions)
- [Supabase RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)
- [React Context API](https://react.dev/reference/react/createContext)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/)

## 🎯 Next Steps

After completing the backend setup:

1. **Test the admin login** at `/admin/login`
2. **Verify dashboard functionality** at `/admin/dashboard`
3. **Test order management** at `/admin/orders`
4. **Check analytics** at `/admin/analytics`
5. **Test customer management** at `/admin/customers`

## 🆘 Getting Help

If you encounter issues:

1. Check the browser console for JavaScript errors
2. Verify Edge Functions are running: `supabase functions list`
3. Check function logs: `supabase functions logs <function-name>`
4. Review the troubleshooting section above
5. Check Supabase dashboard for any errors

---

**🎉 Congratulations!** Your admin dashboard backend is now fully configured and ready for production use.
