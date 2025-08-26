-- Add order cancellation support
-- This migration adds columns needed for order cancellation functionality

-- Add cancellation-related columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS canceled_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cancel_reason TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc', now());

-- Add index for efficient cancellation queries
CREATE INDEX IF NOT EXISTS idx_orders_status_canceled_at ON orders(status, canceled_at);

-- Add trigger to automatically update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for orders table
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comment for documentation
COMMENT ON COLUMN orders.canceled_at IS 'Timestamp when the order was cancelled';
COMMENT ON COLUMN orders.cancel_reason IS 'Reason for order cancellation';
COMMENT ON COLUMN orders.updated_at IS 'Timestamp when the order was last updated';
