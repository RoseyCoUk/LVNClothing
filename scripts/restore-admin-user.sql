-- Restore Admin User Account
-- This script recreates the admin user and permissions

-- First, let's check if the user exists in auth.users
SELECT 'Checking auth.users table...' as status;

-- Create admin user in auth.users (you'll need to do this manually in Supabase Auth)
-- Go to Authentication > Users in your Supabase dashboard and create a user with:
-- Email: support@backreform.co.uk
-- Password: (your password)

-- Once you've created the user, run this script to set up admin permissions

-- Insert admin role for the user (replace USER_ID with actual UUID from auth.users)
-- You can get this by running: SELECT id FROM auth.users WHERE email = 'support@backreform.co.uk';

-- For now, let's create the admin permissions structure
INSERT INTO public.admin_permissions (name, resource, action, description) VALUES
('manage_products', 'products', 'all', 'Full access to manage products'),
('manage_bundles', 'bundles', 'all', 'Full access to manage bundles'),
('manage_images', 'product_images', 'all', 'Full access to manage product images'),
('sync_printful', 'sync_status', 'all', 'Full access to Printful sync operations'),
('view_analytics', 'admin_analytics', 'read', 'View admin analytics')
ON CONFLICT (name) DO NOTHING;

-- Create admin role
INSERT INTO public.admin_roles (user_id, role, is_active) VALUES
-- Replace this UUID with your actual user ID from auth.users
('00000000-0000-0000-0000-000000000000', 'super_admin', true)
ON CONFLICT (user_id) DO NOTHING;

-- Link permissions to role
INSERT INTO public.admin_role_permissions (admin_role_id, permission_id)
SELECT ar.id, ap.id
FROM public.admin_roles ar
CROSS JOIN public.admin_permissions ap
WHERE ar.role = 'super_admin'
ON CONFLICT (admin_role_id, permission_id) DO NOTHING;

-- Verify the setup
SELECT 
    'Admin setup complete!' as status,
    COUNT(*) as total_permissions,
    (SELECT COUNT(*) FROM public.admin_roles) as total_roles,
    (SELECT COUNT(*) FROM public.admin_role_permissions) as total_role_permissions
FROM public.admin_permissions;
