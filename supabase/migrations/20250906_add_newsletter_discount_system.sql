-- Add discount_code column to newsletter_subscribers table
ALTER TABLE public.newsletter_subscribers 
ADD COLUMN IF NOT EXISTS discount_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS discount_used BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS discount_used_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS discount_amount INTEGER DEFAULT 10, -- percentage discount
ADD COLUMN IF NOT EXISTS welcome_email_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS welcome_email_sent_at TIMESTAMPTZ;

-- Create index for faster discount code lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_discount_code ON public.newsletter_subscribers(discount_code) WHERE discount_code IS NOT NULL;

-- Create a table to track discount code usage in orders
CREATE TABLE IF NOT EXISTS public.discount_code_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discount_code TEXT NOT NULL,
    order_id UUID REFERENCES public.orders(id),
    email TEXT NOT NULL,
    discount_amount INTEGER NOT NULL,
    used_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    stripe_payment_intent_id TEXT,
    CONSTRAINT unique_discount_usage UNIQUE(discount_code)
);

-- Create index for tracking usage
CREATE INDEX IF NOT EXISTS idx_discount_usage_code ON public.discount_code_usage(discount_code);
CREATE INDEX IF NOT EXISTS idx_discount_usage_email ON public.discount_code_usage(email);

-- Enable RLS on discount_code_usage
ALTER TABLE public.discount_code_usage ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting discount usage (edge functions only)
CREATE POLICY "Service role can manage discount usage" ON public.discount_code_usage
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Create a function to validate and apply discount codes
CREATE OR REPLACE FUNCTION public.validate_discount_code(
    p_discount_code TEXT,
    p_email TEXT
)
RETURNS TABLE (
    is_valid BOOLEAN,
    discount_amount INTEGER,
    message TEXT
) AS $$
DECLARE
    v_subscriber RECORD;
BEGIN
    -- Find the subscriber with this discount code
    SELECT * INTO v_subscriber
    FROM public.newsletter_subscribers
    WHERE discount_code = p_discount_code
    AND is_active = true;
    
    -- Check if code exists
    IF v_subscriber.id IS NULL THEN
        RETURN QUERY SELECT false, 0, 'Invalid discount code';
        RETURN;
    END IF;
    
    -- Check if code has already been used
    IF v_subscriber.discount_used = true THEN
        RETURN QUERY SELECT false, 0, 'This discount code has already been used';
        RETURN;
    END IF;
    
    -- Check if email matches (optional - remove if you want codes to be transferable)
    IF LOWER(TRIM(p_email)) != LOWER(TRIM(v_subscriber.email)) THEN
        RETURN QUERY SELECT false, 0, 'This discount code is not valid for this email address';
        RETURN;
    END IF;
    
    -- Code is valid
    RETURN QUERY SELECT true, v_subscriber.discount_amount, 'Discount code applied successfully';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to mark discount as used
CREATE OR REPLACE FUNCTION public.mark_discount_used(
    p_discount_code TEXT,
    p_order_id UUID DEFAULT NULL,
    p_stripe_payment_intent_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_subscriber RECORD;
BEGIN
    -- Find and update the subscriber
    UPDATE public.newsletter_subscribers
    SET 
        discount_used = true,
        discount_used_at = timezone('utc'::text, now())
    WHERE discount_code = p_discount_code
    AND discount_used = false
    RETURNING * INTO v_subscriber;
    
    IF v_subscriber.id IS NULL THEN
        RETURN false;
    END IF;
    
    -- Record the usage
    INSERT INTO public.discount_code_usage (
        discount_code,
        order_id,
        email,
        discount_amount,
        stripe_payment_intent_id
    ) VALUES (
        p_discount_code,
        p_order_id,
        v_subscriber.email,
        v_subscriber.discount_amount,
        p_stripe_payment_intent_id
    );
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.validate_discount_code TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.mark_discount_used TO service_role;