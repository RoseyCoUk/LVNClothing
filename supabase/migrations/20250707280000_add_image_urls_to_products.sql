-- Add image_url field to products table and populate with appropriate images
-- This migration adds image URLs for better product display

-- up

-- Add image_url column to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Update products with appropriate image URLs based on their names
UPDATE public.products 
SET image_url = CASE 
  -- T-Shirts
  WHEN name ILIKE '%tshirt%' AND name ILIKE '%men%' THEN '/Tshirt/Men/ReformMenTshirtBlack1.webp'
  WHEN name ILIKE '%tshirt%' AND name ILIKE '%women%' THEN '/Tshirt/Women/ReformWomenTshirtBlack1.webp'
  
  -- Hoodies
  WHEN name ILIKE '%hoodie%' AND name ILIKE '%men%' THEN '/Hoodie/Men/ReformMenHoodieBlack1.webp'
  WHEN name ILIKE '%hoodie%' AND name ILIKE '%women%' THEN '/Hoodie/Women/ReformWomenHoodieBlack1.webp'
  
  -- Caps
  WHEN name ILIKE '%cap%' THEN '/Cap/ReformCapBlack1.webp'
  
  -- Badges
  WHEN name ILIKE '%badge%' THEN '/Badge/ReformBadgeSetMain1.webp'
  
  -- Mugs
  WHEN name ILIKE '%mug%' THEN '/MugMouse/ReformMug1.webp'
  
  -- Mouse Pads
  WHEN name ILIKE '%mouse%' OR name ILIKE '%pad%' THEN '/MugMouse/ReformMousePadWhite1.webp'
  
  -- Stickers
  WHEN name ILIKE '%sticker%' THEN '/StickerToteWater/ReformStickersMain1.webp'
  
  -- Tote Bags
  WHEN name ILIKE '%tote%' OR name ILIKE '%bag%' THEN '/StickerToteWater/ReformToteBagBlack1.webp'
  
  -- Water Bottles
  WHEN name ILIKE '%water%' OR name ILIKE '%bottle%' THEN '/StickerToteWater/ReformWaterBottleWhite1.webp'
  
  -- Default fallback
  ELSE '/Tshirt/Men/ReformMenTshirtBlack1.webp'
END;

-- down

-- Remove image_url column
-- ALTER TABLE public.products DROP COLUMN IF EXISTS image_url; 