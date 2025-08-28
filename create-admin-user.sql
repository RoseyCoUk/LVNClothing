-- Step 1: Add the is_admin column to user_preferences table
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Step 2: Create the admin user in auth.users (if not exists)
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'team@lvnclothing.com',
    crypt('LVNAdmin', gen_salt('bf')),
    NOW(),
    NULL,
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
) ON CONFLICT (email) DO NOTHING;

-- Step 3: Get the user ID we just created
WITH admin_user AS (
    SELECT id FROM auth.users WHERE email = 'team@lvnclothing.com'
)
-- Step 4: Make the user an admin
INSERT INTO user_preferences (user_id, is_admin)
SELECT id, TRUE 
FROM admin_user
ON CONFLICT (user_id) DO UPDATE SET is_admin = TRUE;

-- Step 5: Verify the admin user was created
SELECT 
    up.user_id,
    u.email,
    up.is_admin,
    up.created_at
FROM user_preferences up
JOIN auth.users u ON up.user_id = u.id
WHERE u.email = 'team@lvnclothing.com';
