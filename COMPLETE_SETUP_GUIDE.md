# Complete Setup Guide - Fix Issues Found

## Issues Found in Test

Based on the test results, we found two main issues:

1. **❌ RLS Policies Not Working**: Unauthenticated users can insert data
2. **❌ Storage Buckets Missing**: Required buckets don't exist

## Step 1: Fix RLS Policies

### Option A: Run SQL Script (Recommended)
1. Go to your **Supabase Dashboard** → **SQL Editor**
2. Copy and paste the contents of `fix-rls-policies.sql`
3. Click **Run** to execute the script

### Option B: Manual Fix in Dashboard
1. Go to **Authentication** → **Policies**
2. Find each table and ensure these policies exist:
   - **product_overrides**: 
     - SELECT: `is_active = true`
     - INSERT/UPDATE/DELETE: `auth.role() = 'authenticated'`
   - **product_images**: 
     - SELECT: `true`
     - INSERT/UPDATE/DELETE: `auth.role() = 'authenticated'`
   - **bundles**: 
     - SELECT: `is_active = true`
     - INSERT/UPDATE/DELETE: `auth.role() = 'authenticated'`
   - **bundle_items**: 
     - SELECT: `true`
     - INSERT/UPDATE/DELETE: `auth.role() = 'authenticated'`

## Step 2: Create Storage Buckets

### Option A: Run SQL Script (Recommended)
1. Go to your **Supabase Dashboard** → **SQL Editor**
2. Copy and paste the contents of `setup-storage-buckets.sql`
3. Click **Run** to execute the script

### Option B: Manual Setup in Dashboard
1. Go to **Storage** in the left sidebar
2. Click **New Bucket**
3. Create **product-images** bucket:
   - Name: `product-images`
   - Public: ✅ **Yes**
   - File size limit: `10MB`
   - Allowed MIME types: `image/*`
4. Create **admin-assets** bucket:
   - Name: `admin-assets`
   - Public: ❌ **No**
   - File size limit: `50MB`
   - Allowed MIME types: `*/*`

## Step 3: Verify the Fix

After running the fixes, run the test script again:

```bash
node test-admin-products-setup.js
```

You should now see:
- ✅ RLS policy working correctly - unauthenticated insert blocked
- ✅ Required bucket 'product-images' exists
- ✅ Required bucket 'admin-assets' exists

## Step 4: Test Storage Upload

Create a simple test to verify storage is working:

```typescript
// Test storage upload
const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' });

const { data, error } = await supabase.storage
  .from('admin-assets')
  .upload('test/test.txt', testFile);

if (error) {
  console.log('Storage test failed:', error);
} else {
  console.log('Storage test successful:', data);
  
  // Clean up
  await supabase.storage
    .from('admin-assets')
    .remove(['test/test.txt']);
}
```

## What Each Fix Does

### RLS Policy Fix
- **Before**: Policies were too permissive, allowing unauthenticated access
- **After**: Proper policies that block unauthorized access
- **Result**: Only authenticated users can modify data

### Storage Bucket Fix
- **Before**: Missing buckets for file storage
- **After**: Properly configured buckets with security policies
- **Result**: Secure file storage for product images and admin assets

## Verification Checklist

After completing the fixes, verify:

- [ ] RLS policies block unauthenticated inserts
- [ ] Storage buckets exist and are accessible
- [ ] File uploads work correctly
- [ ] Policies are enforced properly
- [ ] All tables are accessible with proper permissions

## Next Steps

Once everything is working:

1. **Test the complete flow**: Upload image → Store reference → Display image
2. **Create admin interface**: Build forms for managing products and bundles
3. **Integrate with existing code**: Update your product components to use the new tables
4. **Add image management**: Implement image upload and ordering functionality

## Troubleshooting

### If RLS still doesn't work:
- Check that `auth.role()` returns the expected value
- Verify the user is properly authenticated
- Check for conflicting policies

### If storage doesn't work:
- Ensure Storage is enabled in your project
- Check bucket permissions and policies
- Verify file size and type restrictions

### If tables aren't accessible:
- Check that the migration ran successfully
- Verify RLS is enabled on the tables
- Check user permissions and roles

## Support

If you encounter any issues:
1. Check the Supabase logs in your dashboard
2. Verify the SQL scripts executed without errors
3. Test with a simple query first
4. Ensure your user has the correct permissions
