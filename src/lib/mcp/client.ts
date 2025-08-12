// Browser-compatible MCP client - uses API routes instead of direct SDK
// The actual MCP SDK with STDIO transport is used in API routes on the server side

export interface MCPServerConfig {
  id: string
  name: string
  command: string
  args?: string[]
  env?: Record<string, string>
  description?: string
  tools?: string[]
}

export interface MCPToolCall {
  serverId: string
  toolName: string
  arguments: Record<string, any>
}

export interface MCPToolResult {
  success: boolean
  content: any
  error?: string
}

export class MCPClientManager {
  private connections: Map<string, MCPServerConfig> = new Map()

  /**
   * Connect to an MCP server via API route
   */
  async connectServer(config: MCPServerConfig): Promise<boolean> {
    try {
      const response = await fetch('/api/mcp/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        this.connections.set(config.id, config)
        console.log(`Connected to MCP server: ${config.name}`)
        return true
      } else {
        throw new Error(result.error || 'Connection failed')
      }
    } catch (error) {
      console.error(`Failed to connect to MCP server ${config.name}:`, error)
      return false
    }
  }

  /**
   * Disconnect from an MCP server
   */
  async disconnectServer(serverId: string): Promise<void> {
    try {
      const response = await fetch('/api/mcp/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ serverId })
      })

      if (response.ok) {
        this.connections.delete(serverId)
        console.log(`Disconnected from MCP server: ${serverId}`)
      }
    } catch (error) {
      console.error(`Failed to disconnect from MCP server ${serverId}:`, error)
    }
  }

  /**
   * List all available tools from a connected server
   */
  async listTools(serverId: string): Promise<any[]> {
    try {
      const response = await fetch(`/api/mcp/tools?serverId=${serverId}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result.tools || []
    } catch (error) {
      console.error(`Failed to list tools for server ${serverId}:`, error)
      throw error
    }
  }

  /**
   * Execute a tool call on a connected server
   */
  async executeToolCall(call: MCPToolCall): Promise<MCPToolResult> {
    try {
      const response = await fetch('/api/mcp/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(call)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error(`Tool call failed for ${call.toolName}:`, error)
      return {
        success: false,
        content: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Get all connected servers
   */
  getConnectedServers(): MCPServerConfig[] {
    return Array.from(this.connections.values())
  }

  /**
   * Check if a server is connected
   */
  isServerConnected(serverId: string): boolean {
    return this.connections.has(serverId)
  }

  /**
   * Get server configuration
   */
  getServerConfig(serverId: string): MCPServerConfig | undefined {
    return this.connections.get(serverId)
  }

  /**
   * Disconnect all servers
   */
  async disconnectAll(): Promise<void> {
    const disconnectPromises = Array.from(this.connections.keys()).map(
      serverId => this.disconnectServer(serverId)
    )
    await Promise.all(disconnectPromises)
  }
}

// Singleton instance for the app
export const mcpClient = new MCPClientManager()

// Predefined server configurations for popular tools
export const PREDEFINED_SERVERS: MCPServerConfig[] = [
  {
    id: 'github',
    name: 'GitHub',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-github'],
    description: 'Access GitHub repositories, issues, and pull requests',
    tools: ['create_repository', 'search_repositories', 'create_issue', 'get_issue']
  },
  {
    id: 'filesystem',
    name: 'File System',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem', '/path/to/allowed/directory'],
    description: 'Read and write files in allowed directories',
    tools: ['read_file', 'write_file', 'create_directory', 'list_directory']
  },
  {
    id: 'sqlite',
    name: 'SQLite Database',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-sqlite', '/path/to/database.db'],
    description: 'Query and manipulate SQLite databases',
    tools: ['read_query', 'write_query', 'create_table', 'list_tables']
  },
  {
    id: 'brave-search',
    name: 'Brave Search',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-brave-search'],
    description: 'Search the web using Brave Search API',
    tools: ['brave_web_search']
  }
]