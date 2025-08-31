-- Migration: Printful Sync Monitoring Tables
-- Description: Create tables for real-time Printful sync monitoring, inventory tracking, error logging, and data conflict resolution

-- Create inventory_changes table for tracking real-time inventory updates
CREATE TABLE IF NOT EXISTS public.inventory_changes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp timestamptz DEFAULT timezone('utc', now()),
  product_id text NOT NULL,
  product_name text NOT NULL,
  variant_id text NOT NULL,
  variant_name text NOT NULL,
  change_type text NOT NULL CHECK (change_type IN ('stock_update', 'price_change', 'availability_change', 'new_variant')),
  old_value text,
  new_value text,
  processed boolean DEFAULT false,
  printful_data jsonb,
  created_at timestamptz DEFAULT timezone('utc', now())
);

-- Create sync_errors table for tracking sync failures and issues
CREATE TABLE IF NOT EXISTS public.sync_errors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp timestamptz DEFAULT timezone('utc', now()),
  type text NOT NULL CHECK (type IN ('connection', 'inventory', 'data', 'webhook', 'validation')),
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message text NOT NULL,
  details text,
  resolved boolean DEFAULT false,
  webhook_data jsonb,
  created_at timestamptz DEFAULT timezone('utc', now())
);

-- Create data_conflicts table for tracking data inconsistencies between Printful and local system
CREATE TABLE IF NOT EXISTS public.data_conflicts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp timestamptz DEFAULT timezone('utc', now()),
  product_id text NOT NULL,
  conflict_type text NOT NULL CHECK (conflict_type IN ('price_mismatch', 'inventory_mismatch', 'variant_mismatch', 'data_corruption')),
  printful_data jsonb NOT NULL,
  local_data jsonb NOT NULL,
  resolution text NOT NULL DEFAULT 'pending' CHECK (resolution IN ('auto_resolved', 'manual_review', 'pending', 'resolved')),
  auto_resolution text,
  resolved_at timestamptz,
  resolved_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT timezone('utc', now())
);

-- Create webhook_logs table for tracking all webhook requests and responses
CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp timestamptz DEFAULT timezone('utc', now()),
  type text NOT NULL CHECK (type IN ('success', 'error', 'timeout')),
  webhook_type text,
  data jsonb,
  processed boolean DEFAULT false,
  processing_time_ms integer,
  created_at timestamptz DEFAULT timezone('utc', now())
);

-- Create sync_status table for tracking overall sync health and status
CREATE TABLE IF NOT EXISTS public.sync_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp timestamptz DEFAULT timezone('utc', now()),
  is_connected boolean DEFAULT false,
  last_sync timestamptz,
  last_sync_status text CHECK (last_sync_status IN ('success', 'failed', 'pending', 'unknown')),
  sync_progress integer DEFAULT 0 CHECK (sync_progress >= 0 AND sync_progress <= 100),
  is_syncing boolean DEFAULT false,
  connection_health text DEFAULT 'disconnected' CHECK (connection_health IN ('excellent', 'good', 'poor', 'disconnected')),
  error_count integer DEFAULT 0,
  warning_count integer DEFAULT 0,
  inventory_changes integer DEFAULT 0,
  data_conflicts integer DEFAULT 0,
  created_at timestamptz DEFAULT timezone('utc', now())
);

-- Create notifications table for admin alerts and notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  type text NOT NULL CHECK (type IN ('success', 'warning', 'error', 'info')),
  message text NOT NULL,
  timestamp timestamptz DEFAULT timezone('utc', now()),
  read boolean DEFAULT false,
  action_url text,
  metadata jsonb,
  created_at timestamptz DEFAULT timezone('utc', now())
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_inventory_changes_timestamp ON public.inventory_changes(timestamp);
CREATE INDEX IF NOT EXISTS idx_inventory_changes_product_id ON public.inventory_changes(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_changes_variant_id ON public.inventory_changes(variant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_changes_processed ON public.inventory_changes(processed);
CREATE INDEX IF NOT EXISTS idx_inventory_changes_change_type ON public.inventory_changes(change_type);

CREATE INDEX IF NOT EXISTS idx_sync_errors_timestamp ON public.sync_errors(timestamp);
CREATE INDEX IF NOT EXISTS idx_sync_errors_type ON public.sync_errors(type);
CREATE INDEX IF NOT EXISTS idx_sync_errors_severity ON public.sync_errors(severity);
CREATE INDEX IF NOT EXISTS idx_sync_errors_resolved ON public.sync_errors(resolved);

CREATE INDEX IF NOT EXISTS idx_data_conflicts_timestamp ON public.data_conflicts(timestamp);
CREATE INDEX IF NOT EXISTS idx_data_conflicts_product_id ON public.data_conflicts(product_id);
CREATE INDEX IF NOT EXISTS idx_data_conflicts_conflict_type ON public.data_conflicts(conflict_type);
CREATE INDEX IF NOT EXISTS idx_data_conflicts_resolution ON public.data_conflicts(resolution);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_timestamp ON public.webhook_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_type ON public.webhook_logs(type);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_webhook_type ON public.webhook_logs(webhook_type);

CREATE INDEX IF NOT EXISTS idx_sync_status_timestamp ON public.sync_status(timestamp);
CREATE INDEX IF NOT EXISTS idx_sync_status_is_connected ON public.sync_status(is_connected);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_timestamp ON public.notifications(timestamp);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);

-- Enable Row Level Security (RLS)
ALTER TABLE public.inventory_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for inventory_changes
CREATE POLICY "Users can view inventory changes" ON public.inventory_changes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin users can manage inventory changes" ON public.inventory_changes
  FOR ALL USING (auth.role() = 'authenticated');

-- Create RLS policies for sync_errors
CREATE POLICY "Users can view sync errors" ON public.sync_errors
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin users can manage sync errors" ON public.sync_errors
  FOR ALL USING (auth.role() = 'authenticated');

-- Create RLS policies for data_conflicts
CREATE POLICY "Users can view data conflicts" ON public.data_conflicts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin users can manage data conflicts" ON public.data_conflicts
  FOR ALL USING (auth.role() = 'authenticated');

-- Create RLS policies for webhook_logs
CREATE POLICY "Users can view webhook logs" ON public.webhook_logs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin users can manage webhook logs" ON public.webhook_logs
  FOR ALL USING (auth.role() = 'authenticated');

-- Create RLS policies for sync_status
CREATE POLICY "Users can view sync status" ON public.sync_status
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin users can manage sync status" ON public.sync_status
  FOR ALL USING (auth.role() = 'authenticated');

-- Create RLS policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admin users can manage all notifications" ON public.notifications
  FOR ALL USING (auth.role() = 'authenticated');

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inventory_changes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sync_errors TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.data_conflicts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.webhook_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sync_status TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;

-- Create updated_at triggers for tables that need them
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at column to data_conflicts if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'data_conflicts' AND column_name = 'updated_at') THEN
        ALTER TABLE public.data_conflicts ADD COLUMN updated_at timestamptz DEFAULT timezone('utc', now());
    END IF;
END $$;

-- Create trigger for updated_at on data_conflicts
DROP TRIGGER IF EXISTS update_data_conflicts_updated_at ON public.data_conflicts;
CREATE TRIGGER update_data_conflicts_updated_at
    BEFORE UPDATE ON public.data_conflicts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert initial sync status record
INSERT INTO public.sync_status (
  id,
  timestamp,
  is_connected,
  last_sync,
  last_sync_status,
  sync_progress,
  is_syncing,
  connection_health,
  error_count,
  warning_count,
  inventory_changes,
  data_conflicts
) VALUES (
  gen_random_uuid(),
  timezone('utc', now()),
  false,
  null,
  'unknown',
  0,
  false,
  'disconnected',
  0,
  0,
  0,
  0
) ON CONFLICT DO NOTHING;

-- Create function to get current sync status
CREATE OR REPLACE FUNCTION get_current_sync_status()
RETURNS TABLE (
  is_connected boolean,
  last_sync timestamptz,
  last_sync_status text,
  sync_progress integer,
  is_syncing boolean,
  connection_health text,
  error_count bigint,
  warning_count bigint,
  inventory_changes bigint,
  data_conflicts bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ss.is_connected,
    ss.last_sync,
    ss.last_sync_status,
    ss.sync_progress,
    ss.is_syncing,
    ss.connection_health,
    (SELECT COUNT(*) FROM public.sync_errors WHERE resolved = false),
    (SELECT COUNT(*) FROM public.sync_errors WHERE severity = 'medium' AND resolved = false),
    (SELECT COUNT(*) FROM public.inventory_changes WHERE processed = false),
    (SELECT COUNT(*) FROM public.data_conflicts WHERE resolution = 'pending')
  FROM public.sync_status ss
  ORDER BY ss.timestamp DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update sync status
CREATE OR REPLACE FUNCTION update_sync_status(
  p_is_connected boolean DEFAULT NULL,
  p_last_sync timestamptz DEFAULT NULL,
  p_last_sync_status text DEFAULT NULL,
  p_sync_progress integer DEFAULT NULL,
  p_is_syncing boolean DEFAULT NULL,
  p_connection_health text DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.sync_status (
    timestamp,
    is_connected,
    last_sync,
    last_sync_status,
    sync_progress,
    is_syncing,
    connection_health
  ) VALUES (
    timezone('utc', now()),
    COALESCE(p_is_connected, (SELECT is_connected FROM public.sync_status ORDER BY timestamp DESC LIMIT 1)),
    COALESCE(p_last_sync, (SELECT last_sync FROM public.sync_status ORDER BY timestamp DESC LIMIT 1)),
    COALESCE(p_last_sync_status, (SELECT last_sync_status FROM public.sync_status ORDER BY timestamp DESC LIMIT 1)),
    COALESCE(p_sync_progress, (SELECT sync_progress FROM public.sync_status ORDER BY timestamp DESC LIMIT 1)),
    COALESCE(p_is_syncing, (SELECT is_syncing FROM public.sync_status ORDER BY timestamp DESC LIMIT 1)),
    COALESCE(p_connection_health, (SELECT connection_health FROM public.sync_status ORDER BY timestamp DESC LIMIT 1))
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_current_sync_status() TO authenticated;
GRANT EXECUTE ON FUNCTION update_sync_status(boolean, timestamptz, text, integer, boolean, text) TO authenticated;
