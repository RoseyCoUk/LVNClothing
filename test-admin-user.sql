-- Test admin user setup
-- Run this in Supabase SQL Editor

-- Check if user exists
SELECT id, email, created_at FROM auth.users WHERE email = 'team@lvnclothing.com';

-- Check if user has admin privileges
SELECT 
    u.email,
    up.user_id,
    up.is_admin,
    up.created_at
FROM auth.users u
LEFT JOIN user_preferences up ON u.id = up.user_id
WHERE u.email = 'team@lvnclothing.com';

-- If no admin record exists, create it
INSERT INTO user_preferences (user_id, is_admin)
SELECT id, TRUE 
FROM auth.users 
WHERE email = 'team@lvnclothing.com'
ON CONFLICT (user_id) DO UPDATE SET is_admin = TRUE;
