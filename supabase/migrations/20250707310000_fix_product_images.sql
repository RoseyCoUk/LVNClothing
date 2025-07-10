-- Fix product image URLs to ensure they load correctly
-- This migration updates the image_url field with correct paths

-- up

-- Update products with correct image URLs based on their names
UPDATE public.products 
SET image_url = CASE 
  -- T-Shirts
  WHEN name ILIKE '%t-shirt%' OR name ILIKE '%tshirt%' THEN '/Tshirt/Men/ReformMenTshirtBlack1.webp'
  
  -- Hoodies
  WHEN name ILIKE '%hoodie%' THEN '/Hoodie/Men/ReformMenHoodieBlack1.webp'
  
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
  
  -- Bundles
  WHEN name ILIKE '%bundle%' THEN '/Tshirt/Men/ReformMenTshirtBlack1.webp'
  
  -- Default fallback
  ELSE '/Tshirt/Men/ReformMenTshirtBlack1.webp'
END
WHERE image_url IS NULL OR image_url = '';

-- down

-- Revert image_url updates (set to NULL)
-- UPDATE public.products SET image_url = NULL; 