-- Link Admin User to Permissions
-- This will connect your user account to the admin system

-- First, let's check if your user exists and get the ID
DO $$
DECLARE
    user_id UUID;
    admin_role_id UUID;
BEGIN
    -- Get your user ID
    SELECT id INTO user_id FROM auth.users WHERE email = 'support@backreform.co.uk';
    
    IF user_id IS NULL THEN
        RAISE NOTICE '❌ User support@backreform.co.uk not found in auth.users';
        RAISE NOTICE '⚠️  Please create your user account first in Supabase Auth > Users';
        RETURN;
    END IF;
    
    RAISE NOTICE '✅ Found user: %', user_id;
    
    -- Create admin role for your user
    INSERT INTO public.admin_roles (user_id, role, is_active) VALUES
    (user_id, 'super_admin', true)
    ON CONFLICT ON CONSTRAINT admin_roles_user_id_key DO UPDATE SET 
        role = 'super_admin',
        is_active = true
    RETURNING id INTO admin_role_id;
    
    RAISE NOTICE '✅ Admin role created/updated: %', admin_role_id;
    
    -- Link all permissions to your admin role
    INSERT INTO public.admin_role_permissions (admin_role_id, permission_id)
    SELECT admin_role_id, ap.id
    FROM public.admin_permissions ap
    ON CONFLICT ON CONSTRAINT admin_role_permissions_admin_role_id_permission_id_key DO NOTHING;
    
    RAISE NOTICE '✅ All permissions linked to your admin role';
    
    -- Verify the setup
    RAISE NOTICE '✅ Admin setup complete for user: %', user_id;
    RAISE NOTICE '✅ You should now be able to access admin features';
    
END $$;
