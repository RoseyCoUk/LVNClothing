-- Add readable_order_id column to orders table
-- Migration: 20250707010300_add_readable_order_id.sql

-- Add readable_order_id column
ALTER TABLE orders 
ADD COLUMN readable_order_id TEXT;

-- Create unique index on readable_order_id to ensure no duplicates
CREATE UNIQUE INDEX idx_orders_readable_order_id ON orders(readable_order_id);

-- Create index for efficient ordering by readable_order_id
CREATE INDEX idx_orders_readable_order_id_asc ON orders(readable_order_id ASC); 