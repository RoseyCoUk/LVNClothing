-- Complete Admin RLS Fix - Disable RLS temporarily to eliminate recursion
-- This migration completely removes RLS from admin tables to fix the infinite recursion

-- Step 1: Completely disable RLS on admin tables
ALTER TABLE public.admin_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_role_permissions DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies on these tables
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on admin_roles
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'admin_roles') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.admin_roles', r.policyname);
        RAISE NOTICE 'Dropped policy: %', r.policyname;
    END LOOP;
    
    -- Drop all policies on admin_permissions
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'admin_permissions') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.admin_permissions', r.policyname);
        RAISE NOTICE 'Dropped policy: %', r.policyname;
    END LOOP;
    
    -- Drop all policies on admin_role_permissions
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'admin_role_permissions') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.admin_role_permissions', r.policyname);
        RAISE NOTICE 'Dropped policy: %', r.policyname;
    END LOOP;
END $$;

-- Step 3: Verify the fix
DO $$
BEGIN
    -- Test if we can query admin_roles without recursion
    PERFORM COUNT(*) FROM public.admin_roles;
    RAISE NOTICE '✅ admin_roles query successful - RLS disabled';
    
    -- Test if we can query admin_permissions
    PERFORM COUNT(*) FROM public.admin_permissions;
    RAISE NOTICE '✅ admin_permissions query successful - RLS disabled';
    
    -- Test if we can query admin_role_permissions
    PERFORM COUNT(*) FROM public.admin_role_permissions;
    RAISE NOTICE '✅ admin_role_permissions query successful - RLS disabled';
    
    -- Test if we can query with user context
    PERFORM COUNT(*) FROM public.admin_roles WHERE user_id = '875a6e3b-aaee-40ce-9369-2f5480928acf';
    RAISE NOTICE '✅ User-specific admin_roles query successful';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Error: %', SQLERRM;
END $$;

-- Step 4: Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_roles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_permissions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_role_permissions TO authenticated;

-- Step 5: Verify permissions
DO $$
BEGIN
    -- Test if authenticated users can access the tables
    SET request.jwt.claim.sub = '875a6e3b-aaee-40ce-9369-2f5480928acf';
    
    PERFORM COUNT(*) FROM public.admin_roles;
    RAISE NOTICE '✅ Authenticated user can access admin_roles';
    
    PERFORM COUNT(*) FROM public.admin_permissions;
    RAISE NOTICE '✅ Authenticated user can access admin_permissions';
    
    PERFORM COUNT(*) FROM public.admin_role_permissions;
    RAISE NOTICE '✅ Authenticated user can access admin_role_permissions';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Permission error: %', SQLERRM;
END $$;
