-- Add unsubscribe_token column to newsletter_subscribers table for secure unsubscribe links
ALTER TABLE public.newsletter_subscribers 
ADD COLUMN IF NOT EXISTS unsubscribe_token UUID DEFAULT gen_random_uuid() UNIQUE;

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_unsubscribe_token ON public.newsletter_subscribers(unsubscribe_token) WHERE unsubscribe_token IS NOT NULL;

-- Update existing records to have unsubscribe tokens
UPDATE public.newsletter_subscribers 
SET unsubscribe_token = gen_random_uuid() 
WHERE unsubscribe_token IS NULL;

-- Create a function to handle unsubscribe requests
CREATE OR REPLACE FUNCTION public.unsubscribe_newsletter(
    p_token UUID
)
RETURNS TABLE (
    success BOOLEAN,
    email TEXT,
    message TEXT
) AS $$
DECLARE
    v_subscriber RECORD;
BEGIN
    -- Find the subscriber with this token
    SELECT * INTO v_subscriber
    FROM public.newsletter_subscribers
    WHERE unsubscribe_token = p_token;
    
    -- Check if subscriber exists
    IF v_subscriber.id IS NULL THEN
        RETURN QUERY SELECT false, NULL::TEXT, 'Invalid unsubscribe link';
        RETURN;
    END IF;
    
    -- Check if already unsubscribed
    IF v_subscriber.is_active = false THEN
        RETURN QUERY SELECT true, v_subscriber.email, 'You have already been unsubscribed';
        RETURN;
    END IF;
    
    -- Unsubscribe the user
    UPDATE public.newsletter_subscribers
    SET 
        is_active = false,
        unsubscribed_at = timezone('utc'::text, now())
    WHERE unsubscribe_token = p_token;
    
    -- Return success
    RETURN QUERY SELECT true, v_subscriber.email, 'Successfully unsubscribed from newsletter';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.unsubscribe_newsletter TO anon, authenticated, service_role;