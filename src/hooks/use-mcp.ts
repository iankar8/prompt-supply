import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSupabase } from '@/components/providers'
import { mcpClient, type MCPServerConfig, type MCPToolCall } from '@/lib/mcp/client'
import { mcpConnectionManager, type MCPConnection } from '@/lib/mcp/database'

export function useMCPConnections() {
  const { user } = useSupabase()
  const queryClient = useQueryClient()

  const connectionsQuery = useQuery({
    queryKey: ['mcp-connections', user?.id],
    queryFn: () => user ? mcpConnectionManager.getUserConnections(user.id) : [],
    enabled: !!user,
    staleTime: 30000, // 30 seconds
  })

  const connectMutation = useMutation({
    mutationFn: async ({ config }: { config: MCPServerConfig }) => {
      if (!user) throw new Error('User not authenticated')

      // Save to database first
      const connection = await mcpConnectionManager.saveConnection(user.id, config)
      if (!connection) throw new Error('Failed to save connection')

      // Attempt to connect to the MCP server
      const connected = await mcpClient.connectServer(config)
      
      // Update status in database
      await mcpConnectionManager.updateConnectionStatus(
        connection.id,
        connected ? 'connected' : 'error',
        connected ? undefined : 'Failed to establish connection'
      )

      if (!connected) {
        throw new Error('Failed to connect to MCP server')
      }

      return connection
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mcp-connections'] })
    }
  })

  const disconnectMutation = useMutation({
    mutationFn: async ({ connectionId, serverId }: { connectionId: string, serverId: string }) => {
      // Disconnect from MCP server
      await mcpClient.disconnectServer(serverId)
      
      // Update status in database
      await mcpConnectionManager.updateConnectionStatus(connectionId, 'disconnected')
      
      return connectionId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mcp-connections'] })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async ({ connectionId, serverId }: { connectionId: string, serverId: string }) => {
      // Disconnect first if connected
      if (mcpClient.isServerConnected(serverId)) {
        await mcpClient.disconnectServer(serverId)
      }
      
      // Delete from database
      const success = await mcpConnectionManager.deleteConnection(connectionId)
      if (!success) throw new Error('Failed to delete connection')
      
      return connectionId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mcp-connections'] })
    }
  })

  return {
    connections: connectionsQuery.data || [],
    isLoading: connectionsQuery.isLoading,
    error: connectionsQuery.error,
    connect: connectMutation.mutate,
    disconnect: disconnectMutation.mutate,
    deleteConnection: deleteMutation.mutate,
    isConnecting: connectMutation.isPending,
    isDisconnecting: disconnectMutation.isPending,
    isDeleting: deleteMutation.isPending,
    refetch: connectionsQuery.refetch
  }
}

export function useMCPTools(serverId?: string) {
  const [tools, setTools] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadTools = useCallback(async (serverIdToLoad: string) => {
    if (!mcpClient.isServerConnected(serverIdToLoad)) {
      setError('Server is not connected')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const toolsList = await mcpClient.listTools(serverIdToLoad)
      setTools(toolsList)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tools')
      setTools([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (serverId && mcpClient.isServerConnected(serverId)) {
      loadTools(serverId)
    }
  }, [serverId, loadTools])

  return {
    tools,
    loading,
    error,
    loadTools,
    refetch: () => serverId && loadTools(serverId)
  }
}

export function useMCPToolCall() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const executeToolCall = useCallback(async (toolCall: MCPToolCall) => {
    setLoading(true)
    setError(null)

    try {
      const result = await mcpClient.executeToolCall(toolCall)
      
      if (!result.success) {
        setError(result.error || 'Tool call failed')
        return null
      }

      return result.content
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Tool call failed'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    executeToolCall,
    loading,
    error,
    clearError: () => setError(null)
  }
}

// Hook for getting available context from connected MCP servers
export function useMCPContext() {
  const { connections } = useMCPConnections()
  const [availableContext, setAvailableContext] = useState<Array<{
    serverId: string
    serverName: string
    tools: any[]
    connected: boolean
  }>>([])

  useEffect(() => {
    const loadContextSources = async () => {
      const contextSources = await Promise.all(
        connections.map(async (connection) => {
          const connected = mcpClient.isServerConnected(connection.server_id)
          let tools: any[] = []

          if (connected) {
            try {
              tools = await mcpClient.listTools(connection.server_id)
            } catch (error) {
              console.error(`Failed to load tools for ${connection.server_name}:`, error)
            }
          }

          return {
            serverId: connection.server_id,
            serverName: connection.server_name,
            tools,
            connected
          }
        })
      )

      setAvailableContext(contextSources)
    }

    if (connections.length > 0) {
      loadContextSources()
    }
  }, [connections])

  return {
    availableContext,
    hasConnectedServers: availableContext.some(ctx => ctx.connected),
    connectedServers: availableContext.filter(ctx => ctx.connected)
  }
}