-- Reform UK: Seed products and bundles

INSERT INTO public.products (id, name, description, price, category, tags, image_url, slug, rating, reviews, created_at, updated_at) VALUES
  (gen_random_uuid(), 'Reform UK Hoodie', 'Premium hoodie with Reform UK branding', 49.99, 'apparel', ARRAY['bestseller'], '/Hoodie/Men/ReformMenHoodieBlack1.webp', 'reform-uk-hoodie', 4.8, 12, now(), now()),
  (gen_random_uuid(), 'Reform UK T-Shirt', 'Classic T-shirt with Reform UK logo', 24.99, 'apparel', ARRAY['bestseller'], '/Tshirt/Men/ReformMenTshirtCharcoal1.webp', 'reform-uk-tshirt', 4.7, 10, now(), now()),
  (gen_random_uuid(), 'Reform UK Cap', 'Adjustable cap with Reform UK logo', 19.99, 'apparel', ARRAY['bestseller'], '/Cap/ReformCapBlue1.webp', 'reform-uk-cap', 4.6, 8, now(), now()),
  (gen_random_uuid(), 'Reform UK Tote Bag', 'Eco-friendly tote bag with Reform UK branding', 19.99, 'gear', ARRAY['bestseller'], '/StickerToteWater/ReformToteBagBlack1.webp', 'reform-uk-tote-bag', 4.5, 7, now(), now()),
  (gen_random_uuid(), 'Reform UK Water Bottle', 'Reusable water bottle with Reform UK logo', 24.99, 'gear', ARRAY['bestseller'], '/StickerToteWater/ReformWaterBottleWhite1.webp', 'reform-uk-water-bottle', 4.5, 6, now(), now()),
  (gen_random_uuid(), 'Reform UK Badge Set', 'Set of 5 Reform UK badges', 9.99, 'gear', ARRAY['limited'], '/Badge/ReformBadgeSetMain1.webp', 'reform-uk-badge-set', 4.4, 5, now(), now()),
  (gen_random_uuid(), 'Reform UK Mouse Pad', 'Mouse pad with Reform UK branding', 14.99, 'gear', ARRAY['bestseller'], '/MugMouse/ReformMousePadWhite1.webp', 'reform-uk-mouse-pad', 4.3, 4, now(), now()),
  (gen_random_uuid(), 'Reform UK Stickers', 'Pack of 10 Reform UK stickers', 9.99, 'gear', ARRAY['limited'], '/StickerToteWater/ReformStickersMain1.webp', 'reform-uk-stickers', 4.2, 3, now(), now()),
  (gen_random_uuid(), 'Reform UK Mug', 'Ceramic mug with Reform UK logo', 19.99, 'gear', ARRAY['bestseller'], '/MugMouse/ReformMug1.webp', 'reform-uk-mug', 4.1, 2, now(), now()),
  (gen_random_uuid(), 'Starter Bundle', 'Starter bundle with T-shirt and tote bag', 34.99, 'bundle', ARRAY['bundle'], '/Tshirt/Men/ReformMenTshirtCharcoal1.webp', 'starter-bundle', 5, 10, now(), now()),
  (gen_random_uuid(), 'Champion Bundle', 'Champion bundle with hoodie, cap, and tote bag', 99.99, 'bundle', ARRAY['bundle'], '/Hoodie/Men/ReformMenHoodieBlack1.webp', 'champion-bundle', 5, 8, now(), now()),
  (gen_random_uuid(), 'Activist Bundle', 'Activist bundle with hoodie, T-shirt, cap, tote bag, and more', 169.99, 'bundle', ARRAY['bundle'], '/Hoodie/Men/ReformMenHoodieBlack1.webp', 'activist-bundle', 5, 6, now(), now()); 