-- LVN Clothing: Update products for Christian clothing brand

-- up

-- Update existing products to LVN Clothing branding
UPDATE public.products SET
  name = 'LVN Wings Hoodie',
  description = 'Premium hoodie featuring "Under His Wings" design inspired by Psalm 91. Comfortable fit with faith-based messaging.',
  price = 44.99,
  category = 'apparel',
  tags = ARRAY['bestseller', 'new'],
  image_url = '/Hoodie/Men/ReformMenHoodieBlack1.webp',
  slug = 'lvn-wings-hoodie',
  rating = 4.9,
  reviews = 15
WHERE name = 'Reform UK Hoodie';

UPDATE public.products SET
  name = 'LVN Shelter T-Shirt',
  description = 'Classic T-shirt with "Shelter. Strength. Style." design. Psalm 91 inspired messaging on premium cotton.',
  price = 29.99,
  category = 'apparel',
  tags = ARRAY['bestseller', 'new'],
  image_url = '/Tshirt/Men/ReformMenTshirtCharcoal1.webp',
  slug = 'lvn-shelter-tshirt',
  rating = 4.8,
  reviews = 12
WHERE name = 'Reform UK T-Shirt';

UPDATE public.products SET
  name = 'LVN Refuge Cap',
  description = 'Adjustable cap with "Psalm 91" design. Perfect for daily wear with faith-based styling.',
  price = 24.99,
  category = 'apparel',
  tags = ARRAY['bestseller'],
  image_url = '/Cap/ReformCapBlue1.webp',
  slug = 'lvn-refuge-cap',
  rating = 4.7,
  reviews = 10
WHERE name = 'Reform UK Cap';

UPDATE public.products SET
  name = 'LVN Abide Tote Bag',
  description = 'Eco-friendly tote bag with "Dwell. Abide. LVN." design. Perfect for shopping with faith-inspired messaging.',
  price = 19.99,
  category = 'gear',
  tags = ARRAY['bestseller'],
  image_url = '/StickerToteWater/ReformToteBagBlack1.webp',
  slug = 'lvn-abide-tote',
  rating = 4.6,
  reviews = 8
WHERE name = 'Reform UK Tote Bag';

UPDATE public.products SET
  name = 'LVN Living Water Bottle',
  description = 'Reusable water bottle with "Psalm 91" design. Stay hydrated while carrying your faith.',
  price = 19.99,
  category = 'gear',
  tags = ARRAY['bestseller'],
  image_url = '/StickerToteWater/ReformWaterBottleWhite1.webp',
  slug = 'lvn-living-water-bottle',
  rating = 4.5,
  reviews = 7
WHERE name = 'Reform UK Water Bottle';

UPDATE public.products SET
  name = 'LVN Faith Badge Set',
  description = 'Set of 5 LVN badges with faith-inspired designs. Wear your beliefs with pride.',
  price = 12.99,
  category = 'gear',
  tags = ARRAY['limited'],
  image_url = '/Badge/ReformBadgeSetMain1.webp',
  slug = 'lvn-faith-badge-set',
  rating = 4.4,
  reviews = 5
WHERE name = 'Reform UK Badge Set';

UPDATE public.products SET
  name = 'LVN Devotion Mouse Pad',
  description = 'Mouse pad with "Under His Wings" design. Keep your faith close while working.',
  price = 16.99,
  category = 'gear',
  tags = ARRAY['bestseller'],
  image_url = '/MugMouse/ReformMousePadWhite1.webp',
  slug = 'lvn-devotion-mouse-pad',
  rating = 4.3,
  reviews = 4
WHERE name = 'Reform UK Mouse Pad';

UPDATE public.products SET
  name = 'LVN Scripture Stickers',
  description = 'Pack of 10 LVN stickers with Psalm 91 verses. Share your faith wherever you go.',
  price = 8.99,
  category = 'gear',
  tags = ARRAY['limited'],
  image_url = '/StickerToteWater/ReformStickersMain1.webp',
  slug = 'lvn-scripture-stickers',
  rating = 4.2,
  reviews = 3
WHERE name = 'Reform UK Stickers';

UPDATE public.products SET
  name = 'LVN Morning Devotion Mug',
  description = 'Ceramic mug with "Psalm 91" design. Start your day with His promises.',
  price = 14.99,
  category = 'gear',
  tags = ARRAY['bestseller'],
  image_url = '/MugMouse/ReformMug1.webp',
  slug = 'lvn-morning-devotion-mug',
  rating = 4.1,
  reviews = 2
WHERE name = 'Reform UK Mug';

-- Update bundles with LVN branding
UPDATE public.products SET
  name = 'LVN Starter Collection',
  description = 'Perfect introduction to LVN Clothing. Includes T-shirt, cap, and mug with faith-inspired designs.',
  price = 59.99,
  category = 'bundle',
  tags = ARRAY['bundle', 'bestseller'],
  image_url = '/Tshirt/Men/ReformMenTshirtCharcoal1.webp',
  slug = 'lvn-starter-collection',
  rating = 5.0,
  reviews = 10
WHERE name = 'Starter Bundle';

UPDATE public.products SET
  name = 'LVN Champion Collection',
  description = 'Complete LVN look with hoodie, cap, and tote bag. Premium faith-inspired streetwear.',
  price = 94.99,
  category = 'bundle',
  tags = ARRAY['bundle', 'bestseller'],
  image_url = '/Hoodie/Men/ReformMenHoodieBlack1.webp',
  slug = 'lvn-champion-collection',
  rating = 5.0,
  reviews = 8
WHERE name = 'Champion Bundle';

UPDATE public.products SET
  name = 'LVN Faith Warrior Collection',
  description = 'Complete LVN collection with hoodie, T-shirt, cap, tote bag, and more. Ultimate faith-inspired wardrobe.',
  price = 134.99,
  category = 'bundle',
  tags = ARRAY['bundle', 'limited'],
  image_url = '/Hoodie/Men/ReformMenHoodieBlack1.webp',
  slug = 'lvn-faith-warrior-collection',
  rating = 5.0,
  reviews = 6
WHERE name = 'Activist Bundle';

-- down
-- Revert changes back to Reform UK branding
UPDATE public.products SET
  name = 'Reform UK Hoodie',
  description = 'Premium hoodie with Reform UK branding',
  price = 39.99,
  category = 'apparel',
  tags = ARRAY['bestseller'],
  image_url = '/Hoodie/Men/ReformMenHoodieBlack1.webp',
  slug = 'reform-uk-hoodie',
  rating = 4.8,
  reviews = 12
WHERE slug = 'lvn-wings-hoodie';

UPDATE public.products SET
  name = 'Reform UK T-Shirt',
  description = 'Classic T-shirt with Reform UK logo',
  price = 24.99,
  category = 'apparel',
  tags = ARRAY['bestseller'],
  image_url = '/Tshirt/Men/ReformMenTshirtCharcoal1.webp',
  slug = 'reform-uk-tshirt',
  rating = 4.7,
  reviews = 10
WHERE slug = 'lvn-shelter-tshirt';

-- Continue with other products...
