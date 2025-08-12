'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/components/providers'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { MagicSetupWizard } from '@/components/mcp/magic-setup-wizard'
import { useMCPConnections, useMCPTools } from '@/hooks/use-mcp'
import { PREDEFINED_SERVERS, type MCPServerConfig } from '@/lib/mcp/client'
import { toast } from '@/hooks/use-toast'
import {
  Plus,
  Plug,
  Settings,
  Trash2,
  Power,
  PowerOff,
  AlertCircle,
  CheckCircle,
  Github,
  Database,
  FileText,
  Search,
  Zap,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Link,
  Wand2,
  Globe
} from 'lucide-react'

// Force dynamic rendering to avoid SSR issues with client-only components
export const dynamic = 'force-dynamic'

const SERVER_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'github': Github,
  'filesystem': FileText,
  'sqlite': Database,
  'brave-search': Search,
  'default': Plug
}

export default function IntegrationsPage() {
  const { user } = useSupabase()
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showMagicSetup, setShowMagicSetup] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Ensure we're running on client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading integrations...</p>
          </div>
        </div>
      </div>
    )
  }
  const [selectedServer, setSelectedServer] = useState<MCPServerConfig | null>(null)
  const [customConfig, setCustomConfig] = useState<Partial<MCPServerConfig>>({
    name: '',
    command: '',
    args: [],
    env: {}
  })

  const {
    connections,
    isLoading,
    connect,
    disconnect,
    deleteConnection,
    isConnecting,
    isDisconnecting,
    isDeleting,
    refetch
  } = useMCPConnections()

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please sign in to manage integrations.</p>
        </div>
      </div>
    )
  }

  const handleConnectPredefined = (serverConfig: MCPServerConfig) => {
    connect({ config: serverConfig }, {
      onSuccess: () => {
        toast({
          title: 'Connected!',
          description: `Successfully connected to ${serverConfig.name}`,
        })
        setShowAddDialog(false)
      },
      onError: (error) => {
        toast({
          title: 'Connection failed',
          description: error.message,
          variant: 'destructive',
        })
      }
    })
  }

  const handleConnectCustom = () => {
    if (!customConfig.name || !customConfig.command) {
      toast({
        title: 'Missing information',
        description: 'Please provide at least a name and command',
        variant: 'destructive',
      })
      return
    }

    const config: MCPServerConfig = {
      id: customConfig.name!.toLowerCase().replace(/\s+/g, '-'),
      name: customConfig.name!,
      command: customConfig.command!,
      args: customConfig.args || [],
      env: customConfig.env || {}
    }

    connect({ config }, {
      onSuccess: () => {
        toast({
          title: 'Connected!',
          description: `Successfully connected to ${config.name}`,
        })
        setShowAddDialog(false)
        setCustomConfig({ name: '', command: '', args: [], env: {} })
      },
      onError: (error) => {
        toast({
          title: 'Connection failed',
          description: error.message,
          variant: 'destructive',
        })
      }
    })
  }

  const handleDisconnect = (connection: any) => {
    disconnect({ connectionId: connection.id, serverId: connection.server_id }, {
      onSuccess: () => {
        toast({
          title: 'Disconnected',
          description: `Disconnected from ${connection.server_name}`,
        })
      },
      onError: (error) => {
        toast({
          title: 'Disconnect failed',
          description: error.message,
          variant: 'destructive',
        })
      }
    })
  }

  const handleDelete = (connection: any) => {
    if (confirm(`Are you sure you want to delete the connection to ${connection.server_name}?`)) {
      deleteConnection({ connectionId: connection.id, serverId: connection.server_id }, {
        onSuccess: () => {
          toast({
            title: 'Deleted',
            description: `Removed ${connection.server_name} connection`,
          })
        },
        onError: (error) => {
          toast({
            title: 'Delete failed',
            description: error.message,
            variant: 'destructive',
          })
        }
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800 border-green-300'
      case 'disconnected': return 'bg-gray-100 text-gray-800 border-gray-300'
      case 'error': return 'bg-red-100 text-red-800 border-red-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-3 h-3" />
      case 'error': return <AlertCircle className="w-3 h-3" />
      default: return <PowerOff className="w-3 h-3" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                MCP Integrations
              </h1>
              <p className="text-gray-600 max-w-2xl">
                Connect to external tools and services using Model Context Protocol (MCP) for enhanced AI prompts with real-time context.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => refetch()}
                variant="outline"
                size="sm"
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={() => setShowMagicSetup(true)} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <Sparkles className="w-4 h-4 mr-2" />
                Magic Setup
              </Button>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" onClick={() => setShowAdvanced(true)}>
                    <Settings className="w-4 h-4 mr-2" />
                    Advanced
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New MCP Integration</DialogTitle>
                    <DialogDescription>
                      Choose from predefined servers or add a custom MCP server.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    {/* Predefined Servers */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Popular MCP Servers</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {PREDEFINED_SERVERS.map((server) => {
                          const IconComponent = SERVER_ICONS[server.id] || SERVER_ICONS.default
                          const isAlreadyConnected = connections.some(conn => conn.server_id === server.id)
                          
                          return (
                            <Card key={server.id} className={`cursor-pointer transition-all ${
                              isAlreadyConnected ? 'opacity-50' : 'hover:shadow-md hover:border-blue-300'
                            }`}>
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <IconComponent className="w-4 h-4 text-gray-600" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-gray-900 truncate">{server.name}</h4>
                                    <p className="text-sm text-gray-600 mb-2">{server.description}</p>
                                    {isAlreadyConnected ? (
                                      <Badge variant="outline" className="text-xs">
                                        Already connected
                                      </Badge>
                                    ) : (
                                      <Button
                                        size="sm"
                                        onClick={() => handleConnectPredefined(server)}
                                        disabled={isConnecting}
                                        className="mt-1"
                                      >
                                        {isConnecting ? (
                                          <>
                                            <LoadingSpinner className="w-3 h-3 mr-2" />
                                            Connecting...
                                          </>
                                        ) : (
                                          <>
                                            <Plug className="w-3 h-3 mr-2" />
                                            Connect
                                          </>
                                        )}
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                    </div>

                    {/* Custom Server */}
                    <div className="border-t pt-6">
                      <h3 className="font-semibold text-gray-900 mb-3">Custom MCP Server</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="custom-name">Server Name</Label>
                            <Input
                              id="custom-name"
                              placeholder="My Custom Server"
                              value={customConfig.name || ''}
                              onChange={(e) => setCustomConfig(prev => ({ ...prev, name: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="custom-command">Command</Label>
                            <Input
                              id="custom-command"
                              placeholder="npx my-mcp-server"
                              value={customConfig.command || ''}
                              onChange={(e) => setCustomConfig(prev => ({ ...prev, command: e.target.value }))}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="custom-args">Arguments (comma-separated)</Label>
                          <Input
                            id="custom-args"
                            placeholder="--port=3000, --config=./config.json"
                            value={customConfig.args?.join(', ') || ''}
                            onChange={(e) => setCustomConfig(prev => ({ 
                              ...prev, 
                              args: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                            }))}
                          />
                        </div>

                        <Button
                          onClick={handleConnectCustom}
                          disabled={isConnecting || !customConfig.name || !customConfig.command}
                          className="w-full"
                        >
                          {isConnecting ? (
                            <>
                              <LoadingSpinner className="w-4 h-4 mr-2" />
                              Connecting...
                            </>
                          ) : (
                            <>
                              <Plug className="w-4 h-4 mr-2" />
                              Connect Custom Server
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Connections List */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner className="w-8 h-8" />
            </div>
          ) : connections.length === 0 ? (
            <div className="space-y-6">
              {/* Magic Setup Hero */}
              <Card className="text-center py-12 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                <CardContent>
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Sparkles className="w-10 h-10 text-white animate-pulse" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">✨ Magic MCP Setup</h3>
                  <p className="text-gray-600 mb-8 max-w-2xl mx-auto text-lg">
                    Just paste any MCP server URL and we'll handle everything automatically - no technical setup required!
                  </p>
                  <div className="space-y-4">
                    <Button 
                      onClick={() => setShowMagicSetup(true)} 
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg px-8 py-3 h-auto shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      <Wand2 className="w-5 h-5 mr-3" />
                      Start Magic Setup
                    </Button>
                    <p className="text-sm text-gray-500">
                      Works with GitHub repos, npm packages, and more
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Alternative Options */}
              <Card className="border-dashed border-2 border-gray-200">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="font-semibold text-gray-700 mb-2">Need something different?</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Browse popular MCP servers or set up a custom configuration
                    </p>
                    <div className="flex justify-center gap-2">
                      <Button variant="outline" onClick={() => setShowAddDialog(true)} size="sm">
                        <Globe className="w-4 h-4 mr-2" />
                        Browse Popular Servers
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddDialog(true)} size="sm">
                        <Settings className="w-4 h-4 mr-2" />
                        Advanced Setup
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {connections.map((connection) => {
                const IconComponent = SERVER_ICONS[connection.server_id] || SERVER_ICONS.default
                return (
                  <Card key={connection.id} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <IconComponent className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{connection.server_name}</CardTitle>
                            <CardDescription className="text-sm">
                              {connection.server_command}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge className={`text-xs ${getStatusColor(connection.status)}`}>
                          {getStatusIcon(connection.status)}
                          <span className="ml-1 capitalize">{connection.status}</span>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {connection.error_message && (
                        <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                          {connection.error_message}
                        </div>
                      )}

                      {connection.last_connected && (
                        <p className="text-xs text-gray-500 mb-4">
                          Last connected: {new Date(connection.last_connected).toLocaleString()}
                        </p>
                      )}

                      <div className="flex gap-2">
                        {connection.status === 'connected' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDisconnect(connection)}
                            disabled={isDisconnecting}
                            className="flex-1"
                          >
                            <PowerOff className="w-3 h-3 mr-2" />
                            Disconnect
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleConnectPredefined({
                              id: connection.server_id,
                              name: connection.server_name,
                              command: connection.server_command,
                              args: connection.server_args,
                              env: connection.server_env
                            })}
                            disabled={isConnecting}
                            className="flex-1"
                          >
                            <Power className="w-3 h-3 mr-2" />
                            Connect
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(connection)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Learn More */}
        <Card className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <ExternalLink className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Learn About MCP</h3>
                <p className="text-blue-700 mb-4">
                  Model Context Protocol (MCP) enables seamless integration with external tools, 
                  giving your AI prompts access to real-time data from your favorite applications.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                    onClick={() => window.open('https://modelcontextprotocol.io', '_blank')}
                  >
                    MCP Documentation <ExternalLink className="w-3 h-3 ml-2" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                    onClick={() => window.open('https://github.com/modelcontextprotocol/servers', '_blank')}
                  >
                    Browse MCP Servers <ExternalLink className="w-3 h-3 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Magic Setup Wizard */}
      <MagicSetupWizard
        isOpen={showMagicSetup}
        onClose={() => setShowMagicSetup(false)}
        onSuccess={(serverId) => {
          setShowMagicSetup(false)
          refetch() // Refresh the connections list
          toast({
            title: 'Integration added!',
            description: 'Your new MCP server is ready to use with @context commands.',
          })
        }}
      />
    </div>
  )
}