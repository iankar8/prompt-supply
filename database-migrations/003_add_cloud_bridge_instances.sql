-- Migration: Add Cloud Bridge Instances Table
-- Description: Add support for cloud-hosted MCP server instances
-- Date: 2025-08-12

-- Create the cloud_bridge_instances table
CREATE TABLE IF NOT EXISTS cloud_bridge_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  server_id TEXT NOT NULL,
  server_name TEXT NOT NULL,
  server_config JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'starting' CHECK (status IN ('starting', 'running', 'stopping', 'stopped', 'error')),
  endpoint_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  usage_stats JSONB DEFAULT '{"requests_count": 0, "last_request": null}'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cloud_bridge_instances_user_id ON cloud_bridge_instances(user_id);
CREATE INDEX IF NOT EXISTS idx_cloud_bridge_instances_status ON cloud_bridge_instances(status);
CREATE INDEX IF NOT EXISTS idx_cloud_bridge_instances_server_id ON cloud_bridge_instances(server_id);

-- Enable Row Level Security
ALTER TABLE cloud_bridge_instances ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for users to manage their own cloud instances
CREATE POLICY "Users can manage their own cloud instances" ON cloud_bridge_instances
  FOR ALL USING (auth.uid() = user_id);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_cloud_bridge_instances_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_cloud_bridge_instances_updated_at
  BEFORE UPDATE ON cloud_bridge_instances
  FOR EACH ROW
  EXECUTE FUNCTION update_cloud_bridge_instances_updated_at();

-- Usage tracking function
CREATE OR REPLACE FUNCTION increment_cloud_instance_usage(instance_id UUID, request_time TIMESTAMP WITH TIME ZONE)
RETURNS VOID AS $$
BEGIN
  UPDATE cloud_bridge_instances
  SET 
    usage_stats = jsonb_set(
      jsonb_set(usage_stats, '{requests_count}', 
        (COALESCE((usage_stats->>'requests_count')::integer, 0) + 1)::text::jsonb),
      '{last_request}', to_jsonb(request_time)
    ),
    last_used = request_time,
    updated_at = NOW()
  WHERE id = instance_id;
END;
$$ language plpgsql;

-- Comments for documentation
COMMENT ON TABLE cloud_bridge_instances IS 'Stores cloud-hosted MCP server instances for users who cannot run servers locally';
COMMENT ON COLUMN cloud_bridge_instances.server_id IS 'Unique identifier matching the MCP server configuration';
COMMENT ON COLUMN cloud_bridge_instances.server_name IS 'Human-readable name for the MCP server';
COMMENT ON COLUMN cloud_bridge_instances.server_config IS 'Complete MCP server configuration including OAuth tokens';
COMMENT ON COLUMN cloud_bridge_instances.status IS 'Current status of the cloud instance';
COMMENT ON COLUMN cloud_bridge_instances.endpoint_url IS 'URL endpoint for communicating with the cloud instance';
COMMENT ON COLUMN cloud_bridge_instances.usage_stats IS 'Usage statistics including request count and last request time';