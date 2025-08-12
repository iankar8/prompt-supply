-- Migration: Add MCP Connections Table
-- Description: Add support for MCP (Model Context Protocol) server connections
-- Date: 2025-08-12

-- Create the mcp_connections table
CREATE TABLE IF NOT EXISTS mcp_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  server_id TEXT NOT NULL,
  server_name TEXT NOT NULL,
  server_command TEXT NOT NULL,
  server_args TEXT[] DEFAULT '{}',
  server_env JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'error')),
  last_connected TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, server_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mcp_connections_user_id ON mcp_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_mcp_connections_status ON mcp_connections(status);
CREATE INDEX IF NOT EXISTS idx_mcp_connections_server_id ON mcp_connections(server_id);

-- Enable Row Level Security
ALTER TABLE mcp_connections ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for users to manage their own connections
CREATE POLICY "Users can manage their own MCP connections" ON mcp_connections
  FOR ALL USING (auth.uid() = user_id);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_mcp_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_mcp_connections_updated_at
  BEFORE UPDATE ON mcp_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_mcp_connections_updated_at();

-- Optional: Add some sample data for testing (remove in production)
-- Note: This would only work if you have a test user with a known ID
/*
INSERT INTO mcp_connections (user_id, server_id, server_name, server_command, server_args, status)
VALUES 
  ('test-user-id', 'github', 'GitHub', 'npx', ARRAY['-y', '@modelcontextprotocol/server-github'], 'disconnected'),
  ('test-user-id', 'filesystem', 'File System', 'npx', ARRAY['-y', '@modelcontextprotocol/server-filesystem', '/allowed/directory'], 'disconnected')
ON CONFLICT (user_id, server_id) DO NOTHING;
*/

-- Comments for documentation
COMMENT ON TABLE mcp_connections IS 'Stores user connections to MCP (Model Context Protocol) servers';
COMMENT ON COLUMN mcp_connections.server_id IS 'Unique identifier for the MCP server type (e.g., github, filesystem)';
COMMENT ON COLUMN mcp_connections.server_name IS 'Human-readable name for the MCP server';
COMMENT ON COLUMN mcp_connections.server_command IS 'Command to execute the MCP server';
COMMENT ON COLUMN mcp_connections.server_args IS 'Array of command-line arguments for the MCP server';
COMMENT ON COLUMN mcp_connections.server_env IS 'Environment variables required by the MCP server';
COMMENT ON COLUMN mcp_connections.status IS 'Current connection status: connected, disconnected, or error';
COMMENT ON COLUMN mcp_connections.last_connected IS 'Timestamp of the last successful connection';
COMMENT ON COLUMN mcp_connections.error_message IS 'Error message if status is error';