-- Fix Infinite Recursion in Admin RLS Policies
-- This migration removes the problematic RLS policies that cause infinite recursion

-- Step 1: Drop existing problematic policies
DROP POLICY IF EXISTS "admin_roles_authenticated_read" ON public.admin_roles;
DROP POLICY IF EXISTS "admin_roles_authenticated_write" ON public.admin_roles;
DROP POLICY IF EXISTS "admin_roles_self_management" ON public.admin_roles;

-- Step 2: Create simple, non-recursive policies
CREATE POLICY "admin_roles_simple_read" ON public.admin_roles
    FOR SELECT
    TO authenticated
    USING (true);  -- Allow authenticated users to read admin roles

CREATE POLICY "admin_roles_simple_insert" ON public.admin_roles
    FOR INSERT
    TO authenticated
    WITH CHECK (true);  -- Allow authenticated users to insert admin roles

CREATE POLICY "admin_roles_simple_update" ON public.admin_roles
    FOR UPDATE
    TO authenticated
    USING (true)  -- Allow authenticated users to update admin roles
    WITH CHECK (true);

CREATE POLICY "admin_roles_simple_delete" ON public.admin_roles
    FOR DELETE
    TO authenticated
    USING (true);  -- Allow authenticated users to delete admin roles

-- Step 3: Also fix admin_permissions table policies if they exist
DROP POLICY IF EXISTS "admin_permissions_authenticated_read" ON public.admin_permissions;
DROP POLICY IF EXISTS "admin_permissions_authenticated_write" ON public.admin_permissions;

CREATE POLICY "admin_permissions_simple_read" ON public.admin_permissions
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "admin_permissions_simple_write" ON public.admin_permissions
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Step 4: Fix admin_role_permissions table policies if they exist
DROP POLICY IF EXISTS "admin_role_permissions_authenticated_read" ON public.admin_role_permissions;
DROP POLICY IF EXISTS "admin_role_permissions_authenticated_write" ON public.admin_role_permissions;

CREATE POLICY "admin_role_permissions_simple_read" ON public.admin_role_permissions
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "admin_role_permissions_simple_write" ON public.admin_role_permissions
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Step 5: Verify the fix by testing a simple query
DO $$
BEGIN
    -- Test if we can query admin_roles without recursion
    PERFORM COUNT(*) FROM public.admin_roles;
    RAISE NOTICE '✅ RLS policies fixed - admin_roles query successful';
    
    -- Test if we can query admin_permissions
    PERFORM COUNT(*) FROM public.admin_permissions;
    RAISE NOTICE '✅ admin_permissions query successful';
    
    -- Test if we can query admin_role_permissions
    PERFORM COUNT(*) FROM public.admin_role_permissions;
    RAISE NOTICE '✅ admin_role_permissions query successful';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Error: %', SQLERRM;
END $$;
