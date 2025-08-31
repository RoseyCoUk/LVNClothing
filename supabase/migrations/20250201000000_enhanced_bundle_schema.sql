-- Enhanced Bundle Schema for Complete Bundle Management
-- This migration adds all missing fields needed for full bundle functionality

-- First, add missing columns to bundles table
ALTER TABLE public.bundles ADD COLUMN IF NOT EXISTS original_price DECIMAL(10,2);
ALTER TABLE public.bundles ADD COLUMN IF NOT EXISTS bundle_type TEXT DEFAULT 'custom';
ALTER TABLE public.bundles ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.bundles ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.bundles ADD COLUMN IF NOT EXISTS shipping_info TEXT DEFAULT 'Free UK Shipping';
ALTER TABLE public.bundles ADD COLUMN IF NOT EXISTS urgency_text TEXT DEFAULT 'Limited Time Offer';
ALTER TABLE public.bundles ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 4.8;
ALTER TABLE public.bundles ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;
ALTER TABLE public.bundles ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT '{}';
ALTER TABLE public.bundles ADD COLUMN IF NOT EXISTS care_instructions TEXT;
ALTER TABLE public.bundles ADD COLUMN IF NOT EXISTS materials TEXT;
ALTER TABLE public.bundles ADD COLUMN IF NOT EXISTS popular BOOLEAN DEFAULT false;
ALTER TABLE public.bundles ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Add missing columns to bundle_items table
ALTER TABLE public.bundle_items ADD COLUMN IF NOT EXISTS is_customizable BOOLEAN DEFAULT false;
ALTER TABLE public.bundle_items ADD COLUMN IF NOT EXISTS allowed_colors TEXT[] DEFAULT '{}';
ALTER TABLE public.bundle_items ADD COLUMN IF NOT EXISTS allowed_sizes TEXT[] DEFAULT '{}';
ALTER TABLE public.bundle_items ADD COLUMN IF NOT EXISTS default_color TEXT;
ALTER TABLE public.bundle_items ADD COLUMN IF NOT EXISTS default_size TEXT;
ALTER TABLE public.bundle_items ADD COLUMN IF NOT EXISTS custom_price DECIMAL(10,2);
ALTER TABLE public.bundle_items ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Create bundle_images table for multiple bundle images
CREATE TABLE IF NOT EXISTS public.bundle_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bundle_id UUID NOT NULL REFERENCES public.bundles(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    alt_text TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Create bundle_reviews table
CREATE TABLE IF NOT EXISTS public.bundle_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bundle_id UUID NOT NULL REFERENCES public.bundles(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    verified_purchase BOOLEAN DEFAULT false,
    review_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_bundles_type ON public.bundles(bundle_type);
CREATE INDEX IF NOT EXISTS idx_bundles_active ON public.bundles(is_active);
CREATE INDEX IF NOT EXISTS idx_bundles_popular ON public.bundles(popular);
CREATE INDEX IF NOT EXISTS idx_bundles_sort_order ON public.bundles(sort_order);
CREATE INDEX IF NOT EXISTS idx_bundle_images_bundle_id ON public.bundle_images(bundle_id);
CREATE INDEX IF NOT EXISTS idx_bundle_images_order ON public.bundle_images(bundle_id, image_order);
CREATE INDEX IF NOT EXISTS idx_bundle_reviews_bundle_id ON public.bundle_reviews(bundle_id);
CREATE INDEX IF NOT EXISTS idx_bundle_items_display_order ON public.bundle_items(bundle_id, display_order);

-- Enable RLS on new tables
ALTER TABLE public.bundle_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_reviews ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow all on bundle_images" ON public.bundle_images FOR ALL USING (true);
CREATE POLICY "Allow all on bundle_reviews" ON public.bundle_reviews FOR ALL USING (true);

-- Add unique constraint for bundle slugs
CREATE UNIQUE INDEX IF NOT EXISTS idx_bundles_slug_unique ON public.bundles(slug) WHERE slug IS NOT NULL;

-- Create function to calculate bundle savings
CREATE OR REPLACE FUNCTION calculate_bundle_savings(p_bundle_id UUID)
RETURNS TABLE (
    original_total DECIMAL(10,2),
    bundle_price DECIMAL(10,2),
    savings_amount DECIMAL(10,2),
    savings_percentage DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.original_price as original_total,
        b.retail_price as bundle_price,
        (b.original_price - b.retail_price) as savings_amount,
        CASE 
            WHEN b.original_price > 0 THEN
                ROUND(((b.original_price - b.retail_price) / b.original_price * 100)::DECIMAL, 2)
            ELSE 0
        END as savings_percentage
    FROM bundles b
    WHERE b.id = p_bundle_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to get bundle with all details
CREATE OR REPLACE FUNCTION get_bundle_details(p_bundle_id UUID)
RETURNS TABLE (
    bundle_id UUID,
    bundle_name TEXT,
    bundle_description TEXT,
    bundle_price DECIMAL(10,2),
    original_price DECIMAL(10,2),
    bundle_type TEXT,
    image_url TEXT,
    shipping_info TEXT,
    urgency_text TEXT,
    rating DECIMAL(3,2),
    review_count INTEGER,
    features TEXT[],
    care_instructions TEXT,
    materials TEXT,
    popular BOOLEAN,
    is_active BOOLEAN,
    items JSONB,
    images JSONB,
    reviews JSONB
) AS $$
DECLARE
    bundle_record RECORD;
    items_json JSONB;
    images_json JSONB;
    reviews_json JSONB;
BEGIN
    -- Get the main bundle record
    SELECT * INTO bundle_record FROM bundles WHERE id = p_bundle_id;
    
    IF NOT FOUND THEN
        RETURN;
    END IF;
    
    -- Get bundle items
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id', bi.id,
            'product_id', bi.product_id,
            'product_name', COALESCE(p.name, 'Unknown Product'),
            'product_category', COALESCE(p.category, 'Unknown'),
            'quantity', bi.quantity,
            'is_customizable', COALESCE(bi.is_customizable, false),
            'allowed_colors', COALESCE(bi.allowed_colors, ARRAY[]::TEXT[]),
            'allowed_sizes', COALESCE(bi.allowed_sizes, ARRAY[]::TEXT[]),
            'default_color', bi.default_color,
            'default_size', bi.default_size,
            'custom_price', bi.custom_price,
            'display_order', COALESCE(bi.display_order, 0)
        ) ORDER BY COALESCE(bi.display_order, 0)
    ), '[]'::jsonb)
    INTO items_json
    FROM bundle_items bi
    LEFT JOIN products p ON bi.product_id = p.id
    WHERE bi.bundle_id = p_bundle_id;
    
    -- Get bundle images
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id', bi.id,
            'image_url', bi.image_url,
            'image_order', COALESCE(bi.image_order, 0),
            'is_primary', COALESCE(bi.is_primary, false),
            'alt_text', bi.alt_text
        ) ORDER BY COALESCE(bi.image_order, 0)
    ), '[]'::jsonb)
    INTO images_json
    FROM bundle_images bi
    WHERE bi.bundle_id = p_bundle_id;
    
    -- Get bundle reviews
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id', br.id,
            'customer_name', br.customer_name,
            'rating', br.rating,
            'comment', br.comment,
            'verified_purchase', COALESCE(br.verified_purchase, false),
            'review_date', br.review_date
        ) ORDER BY br.created_at DESC
    ), '[]'::jsonb)
    INTO reviews_json
    FROM bundle_reviews br
    WHERE br.bundle_id = p_bundle_id;
    
    -- Return the result
    RETURN QUERY
    SELECT 
        bundle_record.id,
        bundle_record.name,
        bundle_record.description,
        bundle_record.retail_price,
        bundle_record.original_price,
        bundle_record.bundle_type,
        bundle_record.image_url,
        bundle_record.shipping_info,
        bundle_record.urgency_text,
        bundle_record.rating,
        bundle_record.review_count,
        bundle_record.features,
        bundle_record.care_instructions,
        bundle_record.materials,
        bundle_record.popular,
        bundle_record.is_active,
        items_json,
        images_json,
        reviews_json;
END;
$$ LANGUAGE plpgsql;

-- Insert sample bundle data to match your frontend bundles
INSERT INTO public.bundles (
    name, description, retail_price, original_price, bundle_type, 
    shipping_info, urgency_text, rating, review_count, popular,
    features, care_instructions, materials, sort_order, is_active
) VALUES 
(
    'Starter Bundle',
    'Perfect for newcomers to the Reform UK movement. This starter bundle includes our signature T-shirt, cap, and mug, giving you everything you need to show your support.',
    34.99,
    44.97,
    'starter',
    'Free UK Shipping',
    'Limited Time Offer',
    4.8,
    156,
    true,
    ARRAY[
        'High-quality cotton T-shirt with Reform UK branding',
        'Adjustable cap with Reform UK logo',
        'Ceramic mug with Reform UK branding',
        'Great value bundle with significant savings',
        'Perfect introduction to Reform UK merchandise',
        'Free UK shipping included',
        '30-day money-back guarantee'
    ],
    'Machine wash T-shirt at 30°C. Hand wash cap and mug. Mug is dishwasher and microwave safe.',
    'Premium cotton T-shirt, adjustable cap, and ceramic mug',
    1,
    true
),
(
    'Champion Bundle',
    'For the dedicated Reform UK supporter. This champion bundle includes a premium hoodie, tote bag, water bottle, and mouse pad - everything you need to show your commitment to the movement in style and comfort.',
    99.99,
    114.96,
    'champion',
    'Free UK Shipping',
    'Limited Time Offer',
    4.9,
    203,
    true,
    ARRAY[
        'Premium cotton hoodie with Reform UK branding',
        'Durable canvas tote bag for daily use',
        'Stainless steel water bottle keeps drinks cold for 24 hours',
        'High-quality mouse pad for desk setup',
        'Excellent value bundle with significant savings',
        'Perfect for active supporters',
        'Free UK shipping included',
        '30-day money-back guarantee'
    ],
    'Machine wash hoodie at 30°C. Tote bag spot clean. Water bottle dishwasher safe.',
    'Premium cotton hoodie, durable canvas tote bag, stainless steel water bottle, and high-quality mouse pad',
    2,
    true
),
(
    'Activist Bundle',
    'The ultimate bundle for Reform UK activists. This comprehensive collection includes a premium hoodie, T-shirt, cap, tote bag, water bottle, mug, and mouse pad - everything you need to make a statement and show your commitment to the movement.',
    169.99,
    194.91,
    'activist',
    'Free UK Shipping',
    'Limited Time Offer',
    4.9,
    156,
    false,
    ARRAY[
        'Premium cotton hoodie with Reform UK branding',
        'Comfortable cotton T-shirt for everyday wear',
        'Adjustable cap for perfect fit',
        'Durable canvas tote bag for daily use',
        'Stainless steel water bottle keeps drinks cold for 24 hours',
        'Ceramic mug perfect for home or office',
        'High-quality mouse pad for desk setup',
        'Complete activist starter kit',
        'Excellent value bundle with significant savings',
        'Free UK shipping included',
        '30-day money-back guarantee'
    ],
    'Machine wash hoodie and T-shirt at 30°C. Cap can be hand washed. Tote bag spot clean. Water bottle dishwasher safe. Mug dishwasher safe.',
    'Premium cotton hoodie and T-shirt, adjustable cap, durable canvas tote bag, stainless steel water bottle, ceramic mug, and high-quality mouse pad',
    3,
    true
)
ON CONFLICT DO NOTHING;
