-- Create user preferences table for email settings
-- This migration adds a table to store user email preferences

-- up

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_order_confirmations boolean DEFAULT true,
  email_newsletter boolean DEFAULT true,
  email_product_recommendations boolean DEFAULT true,
  created_at timestamptz DEFAULT timezone('utc', now()),
  updated_at timestamptz DEFAULT timezone('utc', now()),
  UNIQUE(user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);

-- Enable Row Level Security
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own preferences"
ON public.user_preferences
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
ON public.user_preferences
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
ON public.user_preferences
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage all preferences"
ON public.user_preferences
AS PERMISSIVE
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Grant permissions
GRANT ALL ON public.user_preferences TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.user_preferences TO authenticated;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Add table comments
COMMENT ON TABLE public.user_preferences IS 'Stores user email preferences and settings';
COMMENT ON COLUMN public.user_preferences.email_order_confirmations IS 'Whether user wants order confirmation emails';
COMMENT ON COLUMN public.user_preferences.email_newsletter IS 'Whether user wants newsletter and promotional emails';
COMMENT ON COLUMN public.user_preferences.email_product_recommendations IS 'Whether user wants product recommendation emails';

-- down

-- Drop triggers and functions
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON public.user_preferences;
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- Drop RLS policies
DROP POLICY IF EXISTS "Users can view their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can insert their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Service role can manage all preferences" ON public.user_preferences;

-- Drop indexes
DROP INDEX IF EXISTS public.idx_user_preferences_user_id;

-- Drop table
DROP TABLE IF EXISTS public.user_preferences; 