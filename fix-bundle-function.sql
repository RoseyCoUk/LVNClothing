-- Drop the existing function completely
DROP FUNCTION IF EXISTS get_bundle_details(UUID);

-- Recreate it from scratch with proper structure
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
    items_json JSONB := '[]'::jsonb;
    images_json JSONB := '[]'::jsonb;
    reviews_json JSONB := '[]'::jsonb;
BEGIN
    -- Get the main bundle record
    SELECT * INTO bundle_record FROM bundles WHERE id = p_bundle_id;
    
    IF NOT FOUND THEN
        RETURN;
    END IF;
    
    -- Get bundle items (separate query to avoid GROUP BY issues)
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
    
    -- Get bundle images (separate query)
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
    
    -- Get bundle reviews (separate query)
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
