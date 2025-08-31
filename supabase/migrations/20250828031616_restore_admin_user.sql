-- Restore Admin User Account and Permissions
-- This will set up the admin system properly

-- First, let's ensure the admin tables exist and are properly structured
-- (They should already exist from the previous migration)

-- Insert admin permissions
INSERT INTO public.admin_permissions (name, resource, action, description) VALUES
('manage_products', 'products', 'all', 'Full access to manage products'),
('manage_bundles', 'bundles', 'all', 'Full access to manage bundles'),
('manage_images', 'product_images', 'all', 'Full access to manage product images'),
('sync_printful', 'sync_status', 'all', 'Full access to Printful sync operations'),
('view_analytics', 'admin_analytics', 'read', 'View admin analytics'),
('manage_orders', 'orders', 'all', 'Full access to manage orders'),
('manage_customers', 'customer_profiles', 'all', 'Full access to manage customers')
ON CONFLICT (name) DO NOTHING;

-- Note: Admin roles will be created after you create your user account
-- For now, just set up the permissions structure

-- Verify the setup
DO $$
DECLARE
    permission_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO permission_count FROM public.admin_permissions;
    
    RAISE NOTICE '✅ Admin permissions setup complete!';
    RAISE NOTICE '✅ Total permissions: %', permission_count;
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  NEXT STEP: Create your user account in Supabase Auth';
    RAISE NOTICE '⚠️  Then run the admin user setup script';
END $$;
