-- Migration: Add OAuth Connections Table
-- Description: Add support for OAuth connections to external services for MCP servers
-- Date: 2025-08-12

-- Create the oauth_connections table
CREATE TABLE IF NOT EXISTS oauth_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  provider_id TEXT NOT NULL,
  provider_name TEXT NOT NULL,
  access_token TEXT NOT NULL, -- Encrypted in production
  refresh_token TEXT, -- Encrypted in production
  expires_at TIMESTAMP WITH TIME ZONE,
  scopes TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, provider_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_oauth_connections_user_id ON oauth_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_connections_provider_id ON oauth_connections(provider_id);
CREATE INDEX IF NOT EXISTS idx_oauth_connections_expires_at ON oauth_connections(expires_at);

-- Enable Row Level Security
ALTER TABLE oauth_connections ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for users to manage their own OAuth connections
CREATE POLICY "Users can manage their own OAuth connections" ON oauth_connections
  FOR ALL USING (auth.uid() = user_id);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_oauth_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_oauth_connections_updated_at
  BEFORE UPDATE ON oauth_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_oauth_connections_updated_at();

-- Comments for documentation
COMMENT ON TABLE oauth_connections IS 'Stores OAuth connections for external service integrations';
COMMENT ON COLUMN oauth_connections.provider_id IS 'Unique identifier for OAuth provider (e.g., github, notion, linear)';
COMMENT ON COLUMN oauth_connections.provider_name IS 'Human-readable name for the OAuth provider';
COMMENT ON COLUMN oauth_connections.access_token IS 'OAuth access token (should be encrypted in production)';
COMMENT ON COLUMN oauth_connections.refresh_token IS 'OAuth refresh token (should be encrypted in production)';
COMMENT ON COLUMN oauth_connections.expires_at IS 'When the access token expires';
COMMENT ON COLUMN oauth_connections.scopes IS 'Array of OAuth scopes granted';
COMMENT ON COLUMN oauth_connections.metadata IS 'Additional provider-specific metadata';