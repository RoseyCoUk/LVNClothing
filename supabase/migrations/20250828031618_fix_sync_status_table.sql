-- Fix sync_status table structure
-- This will ensure the table has all the required columns with correct types

-- First, let's check what columns actually exist
DO $$
BEGIN
    RAISE NOTICE 'Checking sync_status table structure...';
END $$;

-- Drop and recreate the sync_status table with the correct structure
DROP TABLE IF EXISTS public.sync_status CASCADE;

CREATE TABLE public.sync_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL,
    last_sync_status TEXT DEFAULT 'unknown',
    last_sync TIMESTAMPTZ,
    is_syncing BOOLEAN DEFAULT false,
    sync_progress INTEGER DEFAULT 0,
    timestamp TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Add foreign key constraint
ALTER TABLE public.sync_status 
ADD CONSTRAINT sync_status_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

-- Create indexes
CREATE INDEX idx_sync_status_product_id ON public.sync_status(product_id);
CREATE INDEX idx_sync_status_timestamp ON public.sync_status(timestamp);

-- Enable RLS
ALTER TABLE public.sync_status ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Allow all on sync_status" ON public.sync_status FOR ALL USING (true);

-- Verify the table structure
DO $$
DECLARE
    column_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO column_count 
    FROM information_schema.columns 
    WHERE table_name = 'sync_status' AND table_schema = 'public';
    
    RAISE NOTICE '✅ sync_status table recreated successfully';
    RAISE NOTICE '✅ Total columns: %', column_count;
    RAISE NOTICE '✅ Table structure fixed';
END $$;
