-- Setup Admin User for LVN Clothing Admin Dashboard
-- Run this script in your Supabase SQL editor

-- First, create a user through Supabase Auth (you'll need to do this through the Supabase dashboard)
-- Then, insert admin preferences for that user

-- Example: Insert admin user preferences
-- Replace 'your-user-id-here' with the actual user ID from Supabase Auth
INSERT INTO user_preferences (
  user_id,
  is_admin,
  notification_preferences,
  created_at,
  updated_at
) VALUES (
  'your-user-id-here', -- Replace with actual user ID
  true,
  '{"email": true, "sms": false}',
  NOW(),
  NOW()
);

-- If the user_preferences table doesn't have an is_admin column, you can add it:
-- ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- To find your user ID:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Find your user email
-- 3. Copy the user ID (UUID)
-- 4. Replace 'your-user-id-here' above with that UUID

-- Alternative: You can also manually insert admin status through the Supabase dashboard:
-- 1. Go to Table Editor
-- 2. Select user_preferences table
-- 3. Insert a new row with your user_id and is_admin = true
