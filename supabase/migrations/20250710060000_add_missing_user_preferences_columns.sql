-- Add missing columns to user_preferences table
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS email_newsletter BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS email_product_recommendations BOOLEAN DEFAULT true;

-- Update existing records to have default values
UPDATE user_preferences 
SET 
  email_newsletter = COALESCE(email_newsletter, true),
  email_product_recommendations = COALESCE(email_product_recommendations, true)
WHERE email_newsletter IS NULL OR email_product_recommendations IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN user_preferences.email_newsletter IS 'Whether the user wants to receive newsletter emails';
COMMENT ON COLUMN user_preferences.email_product_recommendations IS 'Whether the user wants to receive product recommendation emails'; 