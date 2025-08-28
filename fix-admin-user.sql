-- Step 1: Add the is_admin column to user_preferences table
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Step 2: Show existing users to see what we have
SELECT id, email FROM auth.users;

-- Step 3: Create admin user (replace 'admin@lvnclothing.com' with your email)
-- First, update existing user if they exist
UPDATE user_preferences 
SET is_admin = TRUE 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@lvnclothing.com');

-- Step 4: Insert admin record if none exists
INSERT INTO user_preferences (user_id, is_admin)
SELECT id, TRUE 
FROM auth.users 
WHERE email = 'admin@lvnclothing.com'
AND NOT EXISTS (SELECT 1 FROM user_preferences WHERE user_id = auth.users.id);

-- Step 5: Verify the admin user was created
SELECT 
    up.user_id,
    u.email,
    up.is_admin,
    up.created_at
FROM user_preferences up
JOIN auth.users u ON up.user_id = u.id
WHERE up.is_admin = TRUE;
