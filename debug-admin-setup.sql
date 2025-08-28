-- Debug and Fix Admin User Setup
-- Run this in your Supabase SQL Editor

-- Step 1: Check if user_preferences table exists and has is_admin column
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_preferences' 
AND column_name = 'is_admin';

-- Step 2: Add is_admin column if it doesn't exist
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Step 3: Check what users exist in auth.users
SELECT id, email, created_at FROM auth.users WHERE email = 'team@lvnclothing.com';

-- Step 4: Check what's in user_preferences for this user
SELECT * FROM user_preferences 
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'team@lvnclothing.com');

-- Step 5: Create admin record (run this after you create the user in Supabase dashboard)
INSERT INTO user_preferences (user_id, is_admin)
SELECT id, TRUE 
FROM auth.users 
WHERE email = 'team@lvnclothing.com'
ON CONFLICT (user_id) DO UPDATE SET is_admin = TRUE;

-- Step 6: Verify the admin setup
SELECT 
    u.email,
    u.created_at as user_created,
    up.is_admin,
    up.created_at as admin_created
FROM auth.users u
LEFT JOIN user_preferences up ON u.id = up.user_id
WHERE u.email = 'team@lvnclothing.com';
