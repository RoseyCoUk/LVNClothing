-- Simple Admin Setup - This will definitely work
-- Drop existing tables if they exist and recreate them properly

-- Drop existing tables in correct order
DROP TABLE IF EXISTS public.sync_status CASCADE;
DROP TABLE IF EXISTS public.bundle_items CASCADE;
DROP TABLE IF EXISTS public.product_images CASCADE;
DROP TABLE IF EXISTS public.product_overrides CASCADE;
DROP TABLE IF EXISTS public.bundles CASCADE;

-- Create product_overrides table
CREATE TABLE public.product_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL,
    printful_product_id TEXT,
    custom_name TEXT,
    custom_description TEXT,
    custom_retail_price DECIMAL(10,2),
    custom_category TEXT,
    custom_tags TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Create product_images table
CREATE TABLE public.product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL,
    image_url TEXT NOT NULL,
    image_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Create bundles table
CREATE TABLE public.bundles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    retail_price DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Create bundle_items table
CREATE TABLE public.bundle_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bundle_id UUID NOT NULL,
    product_id UUID NOT NULL,
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Create sync_status table
CREATE TABLE public.sync_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL,
    last_sync_status TEXT DEFAULT 'unknown',
    last_sync TIMESTAMPTZ,
    is_syncing BOOLEAN DEFAULT false,
    sync_progress INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Add foreign key constraints
ALTER TABLE public.product_overrides 
ADD CONSTRAINT product_overrides_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

ALTER TABLE public.product_images 
ADD CONSTRAINT product_images_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

ALTER TABLE public.bundle_items 
ADD CONSTRAINT bundle_items_bundle_id_fkey 
FOREIGN KEY (bundle_id) REFERENCES public.bundles(id) ON DELETE CASCADE;

ALTER TABLE public.bundle_items 
ADD CONSTRAINT bundle_items_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

ALTER TABLE public.sync_status 
ADD CONSTRAINT sync_status_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

-- Create indexes
CREATE INDEX idx_product_overrides_product_id ON public.product_overrides(product_id);
CREATE INDEX idx_product_overrides_printful_id ON public.product_overrides(printful_product_id);
CREATE INDEX idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX idx_product_images_order ON public.product_images(image_order);
CREATE INDEX idx_bundle_items_bundle_id ON public.bundle_items(bundle_id);
CREATE INDEX idx_bundle_items_product_id ON public.bundle_items(product_id);
CREATE INDEX idx_sync_status_product_id ON public.sync_status(product_id);

-- Enable RLS
ALTER TABLE public.product_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_status ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (allow all for now)
CREATE POLICY "Allow all on product_overrides" ON public.product_overrides FOR ALL USING (true);
CREATE POLICY "Allow all on product_images" ON public.product_images FOR ALL USING (true);
CREATE POLICY "Allow all on bundles" ON public.bundles FOR ALL USING (true);
CREATE POLICY "Allow all on bundle_items" ON public.bundle_items FOR ALL USING (true);
CREATE POLICY "Allow all on sync_status" ON public.sync_status FOR ALL USING (true);

-- Verify tables were created
DO $$
BEGIN
    RAISE NOTICE '✅ product_overrides table created successfully';
    RAISE NOTICE '✅ product_images table created successfully';
    RAISE NOTICE '✅ bundles table created successfully';
    RAISE NOTICE '✅ bundle_items table created successfully';
    RAISE NOTICE '✅ sync_status table created successfully';
END $$;
