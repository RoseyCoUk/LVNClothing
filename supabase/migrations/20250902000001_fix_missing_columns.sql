-- Fix missing columns that were skipped during reset

-- 1. Add missing columns to product_images table
ALTER TABLE public.product_images 
ADD COLUMN IF NOT EXISTS color VARCHAR(100),
ADD COLUMN IF NOT EXISTS size VARCHAR(10),
ADD COLUMN IF NOT EXISTS variant_type VARCHAR(50) DEFAULT 'product',
ADD COLUMN IF NOT EXISTS alt_text TEXT;

-- 2. Add missing columns to product_variants table
ALTER TABLE public.product_variants 
ADD COLUMN IF NOT EXISTS available BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS color_code TEXT;

-- 3. Create missing indexes
CREATE INDEX IF NOT EXISTS idx_product_images_color ON public.product_images(color);
CREATE INDEX IF NOT EXISTS idx_product_images_variant_type ON public.product_images(variant_type);
CREATE INDEX IF NOT EXISTS idx_product_images_product_color ON public.product_images(product_id, color);
CREATE INDEX IF NOT EXISTS idx_product_variants_available ON public.product_variants(available);
CREATE INDEX IF NOT EXISTS idx_product_variants_stock ON public.product_variants(stock);

-- 4. Add missing constraints
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_variant_type') THEN
        ALTER TABLE public.product_images 
        ADD CONSTRAINT check_variant_type 
        CHECK (variant_type IN ('product', 'color', 'size'));
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_positive_stock') THEN
        ALTER TABLE public.product_variants 
        ADD CONSTRAINT check_positive_stock 
        CHECK (stock >= 0);
    END IF;
END $$;

-- 5. Update existing rows to have proper defaults
UPDATE public.product_images 
SET variant_type = 'product' 
WHERE variant_type IS NULL;

UPDATE public.product_variants 
SET available = true 
WHERE available IS NULL;

UPDATE public.product_variants 
SET stock = 0 
WHERE stock IS NULL;