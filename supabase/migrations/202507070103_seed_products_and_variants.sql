-- Seed: Reform UK Products & Variants

insert into products (id, name, variant, description, price_pennies, image_url, created_at) values
  -- Reform UK Badge variants
  (gen_random_uuid(), 'Reform Badge', '5 Badges', 'Reform UK Badge', 999, '', now()),
  (gen_random_uuid(), 'Reform Badge', '10 Badges', 'Reform UK Badge', 1599, '', now()),
  (gen_random_uuid(), 'Reform Badge', '25 Badges', 'Reform UK Badge', 3599, '', now()),
  (gen_random_uuid(), 'Reform Badge', '50 Badges', 'Reform UK Badge', 6499, '', now()),

  -- Reform UK Stickers variants
  (gen_random_uuid(), 'Reform UK Stickers', '10 Stickers', 'Sticker pack', 999, '', now()),
  (gen_random_uuid(), 'Reform UK Stickers', '25 Stickers', 'Sticker pack', 1999, '', now()),
  (gen_random_uuid(), 'Reform UK Stickers', '50 Stickers', 'Sticker pack', 3499, '', now()),
  (gen_random_uuid(), 'Reform UK Stickers', '100 Stickers', 'Sticker pack', 5999, '', now()),

  -- Single-variant products
  (gen_random_uuid(), 'Reform UK Mouse Pad', 'Standard', 'Mouse Pad', 1499, '', now()),
  (gen_random_uuid(), 'Reform UK Mug', 'Standard', 'Mug', 1999, '', now()),
  (gen_random_uuid(), 'Reform UK Water Bottle', 'Standard', 'Water Bottle', 2499, '', now()),
  (gen_random_uuid(), 'Reform UK Tote Bag', 'Standard', 'Tote Bag', 1999, '', now()),
  (gen_random_uuid(), 'Reform UK Cap', 'Standard', 'Cap', 1999, '', now()),
  (gen_random_uuid(), 'Reform UK T-Shirt', 'Standard', 'T-Shirt', 2499, '', now()),
  (gen_random_uuid(), 'Reform UK Hoodie', 'Standard', 'Hoodie', 4999, '', now()),

  -- Bundles
  (gen_random_uuid(), 'Starter Bundle', 'Standard', 'Starter Bundle', 3499, '', now()),
  (gen_random_uuid(), 'Champion Bundle', 'Standard', 'Champion Bundle', 9999, '', now()),
  (gen_random_uuid(), 'Activist Bundle', 'Standard', 'Activist Bundle', 16999, '', now());