-- Add missing columns to user_preferences table
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS email_order_confirmations BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS email_newsletter BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS email_product_recommendations BOOLEAN DEFAULT true;

-- Update existing records to have default values
UPDATE user_preferences 
SET 
  email_order_confirmations = COALESCE(email_order_confirmations, true),
  email_newsletter = COALESCE(email_newsletter, true),
  email_product_recommendations = COALESCE(email_product_recommendations, true)
WHERE email_order_confirmations IS NULL OR email_newsletter IS NULL OR email_product_recommendations IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN user_preferences.email_order_confirmations IS 'Whether the user wants to receive order confirmation emails';
COMMENT ON COLUMN user_preferences.email_newsletter IS 'Whether the user wants to receive newsletter emails';
COMMENT ON COLUMN user_preferences.email_product_recommendations IS 'Whether the user wants to receive product recommendation emails'; 