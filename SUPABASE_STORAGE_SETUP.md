# Supabase Storage Setup Guide

## Enable Supabase Storage

To enable Supabase Storage in your project dashboard, follow these steps:

### 1. Access Your Supabase Dashboard
- Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
- Sign in to your account
- Select your ReformUK project

### 2. Navigate to Storage
- In the left sidebar, click on **Storage**
- If Storage is not enabled, you'll see a message to enable it

### 3. Enable Storage
- Click **Enable Storage** button
- This will create the necessary infrastructure for file storage

### 4. Create Storage Buckets
After enabling Storage, create the following buckets:

#### Product Images Bucket
- **Name**: `product-images`
- **Public**: `true` (for public product images)
- **File size limit**: `10MB`
- **Allowed MIME types**: `image/*`

#### Admin Assets Bucket
- **Name**: `admin-assets`
- **Public**: `false` (for private admin files)
- **File size limit**: `50MB`
- **Allowed MIME types**: `*/*`

### 5. Configure Storage Policies
Create RLS policies for the storage buckets:

#### Product Images Bucket Policy
```sql
-- Allow public read access to product images
CREATE POLICY "Public read access to product images" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

-- Allow authenticated users to upload product images
CREATE POLICY "Authenticated users can upload product images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to update product images
CREATE POLICY "Authenticated users can update product images" ON storage.objects
FOR UPDATE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete product images
CREATE POLICY "Authenticated users can delete product images" ON storage.objects
FOR DELETE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
```

#### Admin Assets Bucket Policy
```sql
-- Allow only authenticated users to access admin assets
CREATE POLICY "Authenticated users can access admin assets" ON storage.objects
FOR ALL USING (bucket_id = 'admin-assets' AND auth.role() = 'authenticated');
```

### 6. Update Environment Variables
Add the following to your `.env` file:

```bash
# Supabase Storage
VITE_SUPABASE_STORAGE_URL=https://your-project-ref.supabase.co/storage/v1
VITE_SUPABASE_STORAGE_BUCKET_PRODUCT_IMAGES=product-images
VITE_SUPABASE_STORAGE_BUCKET_ADMIN_ASSETS=admin-assets
```

### 7. Test Storage Access
You can test the storage setup by uploading a test image:

```typescript
// Test upload to product-images bucket
const { data, error } = await supabase.storage
  .from('product-images')
  .upload('test-image.jpg', file);

if (error) {
  console.error('Upload error:', error);
} else {
  console.log('Upload successful:', data);
}
```

## Storage Bucket Structure

### Product Images (`product-images`)
- Organized by product type and category
- Example paths:
  - `/hoodies/men/black/front.webp`
  - `/tshirts/women/charcoal/back.webp`
  - `/caps/blue/side.webp`

### Admin Assets (`admin-assets`)
- Private files for admin use
- Example paths:
  - `/exports/order-reports/`
  - `/imports/product-data/`
  - `/backups/`

## Integration with New Tables

The new database tables created in the migration work with Supabase Storage:

- **`product_images`** table stores references to images in the `product-images` bucket
- **`product_overrides`** can reference custom images stored in storage
- **`bundles`** can have associated images stored in storage

## Security Considerations

1. **Public vs Private**: Product images are public for customer viewing, admin assets are private
2. **File Validation**: Implement server-side validation for file types and sizes
3. **Access Control**: Use RLS policies to control who can upload/delete files
4. **Virus Scanning**: Consider implementing virus scanning for uploaded files in production

## Next Steps

After enabling Storage and running the migration:

1. Update your frontend components to use Supabase Storage for image uploads
2. Modify your product management forms to handle file uploads
3. Update your product display components to fetch images from Storage
4. Test the complete flow from image upload to product display
