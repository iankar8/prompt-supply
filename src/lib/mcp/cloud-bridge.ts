import { createSupabaseClient } from '@/lib/supabase'
import type { MCPServerInfo } from './detection'
import type { OAuthTokens } from './oauth'

export interface CloudBridgeInstance {
  id: string
  user_id: string
  server_id: string
  server_name: string
  server_config: MCPServerInfo
  status: 'starting' | 'running' | 'stopping' | 'stopped' | 'error'
  endpoint_url?: string
  created_at: string
  updated_at: string
  last_used?: string
  error_message?: string
  usage_stats: {
    requests_count: number
    last_request: string | null
  }
}

export interface CloudBridgeToolCall {
  instanceId: string
  toolName: string
  arguments: Record<string, any>
}

export interface CloudBridgeResult {
  success: boolean
  data?: any
  error?: string
  executionTime?: number
}

export class CloudBridgeService {
  private supabase = createSupabaseClient()
  private readonly BRIDGE_API_BASE = process.env.NEXT_PUBLIC_CLOUD_BRIDGE_URL || 'https://bridge.prompt.supply'

  /**
   * Create a new cloud bridge instance for an MCP server
   */
  async createInstance(serverInfo: MCPServerInfo, oauthTokens?: Record<string, OAuthTokens>): Promise<CloudBridgeInstance> {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    try {
      // Prepare server configuration for cloud deployment
      const cloudConfig = await this.prepareCloudConfig(serverInfo, oauthTokens)

      // Create cloud instance via our bridge API
      const response = await fetch(`${this.BRIDGE_API_BASE}/api/instances`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getServiceToken()}`
        },
        body: JSON.stringify({
          userId: user.id,
          serverConfig: cloudConfig,
          timeout: 300000 // 5 minute timeout
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create cloud instance')
      }

      const cloudInstance = await response.json()

      // Store instance info in our database
      const { data: dbInstance, error: dbError } = await this.supabase
        .from('cloud_bridge_instances' as any)
        .insert({
          id: cloudInstance.id,
          user_id: user.id,
          server_id: serverInfo.id,
          server_name: serverInfo.name,
          server_config: serverInfo,
          status: 'starting',
          endpoint_url: cloudInstance.endpoint,
          usage_stats: { requests_count: 0, last_request: null }
        })
        .select()
        .single()

      if (dbError) {
        // Clean up cloud instance if database insert fails
        await this.destroyCloudInstance(cloudInstance.id)
        throw new Error(`Database error: ${dbError.message}`)
      }

      return dbInstance as unknown as CloudBridgeInstance

    } catch (error) {
      console.error('Cloud bridge instance creation failed:', error)
      throw error
    }
  }

  /**
   * Get all cloud bridge instances for the current user
   */
  async getUserInstances(): Promise<CloudBridgeInstance[]> {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await this.supabase
      .from('cloud_bridge_instances' as any)
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch cloud instances:', error)
      return []
    }

    return (data as unknown as CloudBridgeInstance[]) || []
  }

  /**
   * Execute a tool call on a cloud bridge instance
   */
  async executeToolCall(call: CloudBridgeToolCall): Promise<CloudBridgeResult> {
    const instance = await this.getInstance(call.instanceId)
    if (!instance) {
      return {
        success: false,
        error: 'Instance not found'
      }
    }

    if (instance.status !== 'running') {
      return {
        success: false,
        error: `Instance is ${instance.status}, not running`
      }
    }

    try {
      const startTime = Date.now()
      
      const response = await fetch(`${instance.endpoint_url}/tools/call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getServiceToken()}`
        },
        body: JSON.stringify({
          name: call.toolName,
          arguments: call.arguments
        }),
        signal: AbortSignal.timeout(30000) // 30 second timeout
      })

      const executionTime = Date.now() - startTime

      if (!response.ok) {
        const error = await response.json()
        return {
          success: false,
          error: error.message || 'Tool call failed',
          executionTime
        }
      }

      const result = await response.json()

      // Update usage stats
      await this.updateUsageStats(call.instanceId)

      return {
        success: true,
        data: result.content,
        executionTime
      }

    } catch (error) {
      console.error('Cloud bridge tool call failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Tool call failed'
      }
    }
  }

  /**
   * List available tools for a cloud bridge instance
   */
  async listInstanceTools(instanceId: string): Promise<any[]> {
    const instance = await this.getInstance(instanceId)
    if (!instance || instance.status !== 'running') {
      return []
    }

    try {
      const response = await fetch(`${instance.endpoint_url}/tools/list`, {
        headers: {
          'Authorization': `Bearer ${await this.getServiceToken()}`
        }
      })

      if (!response.ok) {
        console.error('Failed to list tools')
        return []
      }

      const result = await response.json()
      return result.tools || []

    } catch (error) {
      console.error('Failed to list instance tools:', error)
      return []
    }
  }

  /**
   * Stop and destroy a cloud bridge instance
   */
  async destroyInstance(instanceId: string): Promise<boolean> {
    try {
      // Stop the cloud instance
      await this.destroyCloudInstance(instanceId)

      // Update database record
      const { error } = await this.supabase
        .from('cloud_bridge_instances' as any)
        .update({
          status: 'stopped',
          endpoint_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', instanceId)

      if (error) {
        console.error('Failed to update instance status:', error)
        return false
      }

      return true

    } catch (error) {
      console.error('Failed to destroy instance:', error)
      return false
    }
  }

  /**
   * Check if cloud bridge is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.BRIDGE_API_BASE}/health`, {
        signal: AbortSignal.timeout(5000)
      })
      return response.ok
    } catch {
      return false
    }
  }

  /**
   * Get instance by ID
   */
  private async getInstance(instanceId: string): Promise<CloudBridgeInstance | null> {
    const { data, error } = await this.supabase
      .from('cloud_bridge_instances' as any)
      .select('*')
      .eq('id', instanceId)
      .single()

    if (error || !data) {
      return null
    }

    return data as unknown as CloudBridgeInstance
  }

  /**
   * Prepare server configuration for cloud deployment
   */
  private async prepareCloudConfig(serverInfo: MCPServerInfo, oauthTokens?: Record<string, OAuthTokens>) {
    const config = {
      id: serverInfo.id,
      name: serverInfo.name,
      source: serverInfo.source,
      sourceUrl: serverInfo.sourceUrl,
      installCommand: serverInfo.installCommand,
      installArgs: serverInfo.installArgs,
      command: serverInfo.command,
      args: serverInfo.args,
      env: { ...serverInfo.env }
    }

    // Add OAuth tokens to environment variables if provided
    if (oauthTokens) {
      for (const [provider, tokens] of Object.entries(oauthTokens)) {
        switch (provider) {
          case 'github':
            config.env.GITHUB_TOKEN = tokens.accessToken
            break
          case 'notion':
            config.env.NOTION_API_KEY = tokens.accessToken
            break
          case 'linear':
            config.env.LINEAR_API_KEY = tokens.accessToken
            break
          default:
            config.env[`${provider.toUpperCase()}_TOKEN`] = tokens.accessToken
        }
      }
    }

    return config
  }

  /**
   * Get service authentication token
   */
  private async getServiceToken(): Promise<string> {
    // In production, this would be a proper service-to-service token
    // For now, we'll use the user's Supabase session token
    const { data: { session } } = await this.supabase.auth.getSession()
    return session?.access_token || ''
  }

  /**
   * Destroy cloud instance via bridge API
   */
  private async destroyCloudInstance(instanceId: string): Promise<void> {
    await fetch(`${this.BRIDGE_API_BASE}/api/instances/${instanceId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${await this.getServiceToken()}`
      }
    })
  }

  /**
   * Update usage statistics for an instance
   */
  private async updateUsageStats(instanceId: string): Promise<void> {
    const { error } = await this.supabase
      .rpc('increment_cloud_instance_usage' as any, {
        instance_id: instanceId,
        request_time: new Date().toISOString()
      })

    if (error) {
      console.error('Failed to update usage stats:', error)
    }
  }
}

export const cloudBridgeService = new CloudBridgeService()

// SQL for creating the cloud_bridge_instances table
export const CLOUD_BRIDGE_INSTANCES_TABLE_SQL = `
-- Cloud Bridge Instances Table
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cloud_bridge_instances_user_id ON cloud_bridge_instances(user_id);
CREATE INDEX IF NOT EXISTS idx_cloud_bridge_instances_status ON cloud_bridge_instances(status);
CREATE INDEX IF NOT EXISTS idx_cloud_bridge_instances_server_id ON cloud_bridge_instances(server_id);

-- RLS
ALTER TABLE cloud_bridge_instances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own cloud instances" ON cloud_bridge_instances
  FOR ALL USING (auth.uid() = user_id);

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
`