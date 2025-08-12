import { createSupabaseClient } from '@/lib/supabase'
import type { MCPServerConfig } from './client'

export interface MCPConnection {
  id: string
  user_id: string
  server_id: string
  server_name: string
  server_command: string
  server_args: string[]
  server_env: Record<string, string>
  status: 'connected' | 'disconnected' | 'error'
  last_connected: string | null
  error_message: string | null
  created_at: string
  updated_at: string
}

export class MCPConnectionManager {
  private supabase = createSupabaseClient()

  /**
   * Save an MCP connection to the database
   */
  async saveConnection(userId: string, config: MCPServerConfig): Promise<MCPConnection | null> {
    try {
      const { data, error } = await this.supabase
        .from('mcp_connections' as any)
        .insert({
          user_id: userId,
          server_id: config.id,
          server_name: config.name,
          server_command: config.command,
          server_args: config.args || [],
          server_env: config.env || {},
          status: 'disconnected'
        })
        .select()
        .single()

      if (error) {
        console.error('Error saving MCP connection:', error)
        return null
      }

      return data as any
    } catch (error) {
      console.error('Error saving MCP connection:', error)
      return null
    }
  }

  /**
   * Get all MCP connections for a user
   */
  async getUserConnections(userId: string): Promise<MCPConnection[]> {
    try {
      const { data, error } = await this.supabase
        .from('mcp_connections' as any)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching MCP connections:', error)
        return []
      }

      return data as any || []
    } catch (error) {
      console.error('Error fetching MCP connections:', error)
      return []
    }
  }

  /**
   * Update connection status
   */
  async updateConnectionStatus(
    connectionId: string, 
    status: 'connected' | 'disconnected' | 'error',
    errorMessage?: string
  ): Promise<boolean> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      }

      if (status === 'connected') {
        updateData.last_connected = new Date().toISOString()
        updateData.error_message = null
      } else if (status === 'error' && errorMessage) {
        updateData.error_message = errorMessage
      }

      const { error } = await this.supabase
        .from('mcp_connections' as any)
        .update(updateData)
        .eq('id', connectionId)

      if (error) {
        console.error('Error updating MCP connection status:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error updating MCP connection status:', error)
      return false
    }
  }

  /**
   * Delete an MCP connection
   */
  async deleteConnection(connectionId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('mcp_connections' as any)
        .delete()
        .eq('id', connectionId)

      if (error) {
        console.error('Error deleting MCP connection:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error deleting MCP connection:', error)
      return false
    }
  }

  /**
   * Get a specific connection by ID
   */
  async getConnection(connectionId: string): Promise<MCPConnection | null> {
    try {
      const { data, error } = await this.supabase
        .from('mcp_connections' as any)
        .select('*')
        .eq('id', connectionId)
        .single()

      if (error) {
        console.error('Error fetching MCP connection:', error)
        return null
      }

      return data as any
    } catch (error) {
      console.error('Error fetching MCP connection:', error)
      return null
    }
  }

  /**
   * Convert database connection to MCP server config
   */
  connectionToServerConfig(connection: MCPConnection): MCPServerConfig {
    return {
      id: connection.server_id,
      name: connection.server_name,
      command: connection.server_command,
      args: connection.server_args,
      env: connection.server_env
    }
  }
}

export const mcpConnectionManager = new MCPConnectionManager()

// SQL for creating the mcp_connections table (run this in Supabase)
export const MCP_CONNECTIONS_TABLE_SQL = `
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_mcp_connections_user_id ON mcp_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_mcp_connections_status ON mcp_connections(status);

-- Add RLS policies
ALTER TABLE mcp_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own MCP connections" ON mcp_connections
  FOR ALL USING (auth.uid() = user_id);
`