'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { MCPDetectionService, type MCPServerInfo } from '@/lib/mcp/detection'
import { oauthManager, OAUTH_PROVIDERS, type OAuthProvider } from '@/lib/mcp/oauth'
import { cloudBridgeService } from '@/lib/mcp/cloud-bridge'
import { TroubleshootingPanel } from '@/components/mcp/troubleshooting-panel'
import { useMCPConnections } from '@/hooks/use-mcp'
import { toast } from '@/hooks/use-toast'
import { 
  Link, 
  Search, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  Zap,
  Shield,
  Download,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Key,
  Plug,
  Cloud
} from 'lucide-react'

interface MagicSetupWizardProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (serverId: string) => void
}

type SetupStep = 
  | 'url-input'
  | 'detection' 
  | 'server-info'
  | 'oauth-setup'
  | 'installation'
  | 'cloud-bridge'
  | 'success'
  | 'error'

interface SetupState {
  step: SetupStep
  url: string
  serverInfo: MCPServerInfo | null
  connectedProviders: string[]
  missingProviders: string[]
  progress: number
  error: string | null
  installationLogs: string[]
  useCloudBridge: boolean
  cloudBridgeAvailable: boolean
}

export function MagicSetupWizard({ isOpen, onClose, onSuccess }: MagicSetupWizardProps) {
  const [state, setState] = useState<SetupState>({
    step: 'url-input',
    url: '',
    serverInfo: null,
    connectedProviders: [],
    missingProviders: [],
    progress: 0,
    error: null,
    installationLogs: [],
    useCloudBridge: false,
    cloudBridgeAvailable: false
  })

  const { connect } = useMCPConnections()
  const detectionService = new MCPDetectionService()

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setState({
        step: 'url-input',
        url: '',
        serverInfo: null,
        connectedProviders: [],
        missingProviders: [],
        progress: 0,
        error: null,
        installationLogs: [],
        useCloudBridge: false,
        cloudBridgeAvailable: false
      })
    }
  }, [isOpen])
  
  // Check cloud bridge availability on mount
  useEffect(() => {
    if (isOpen) {
      cloudBridgeService.isAvailable().then(available => {
        setState(prev => ({ ...prev, cloudBridgeAvailable: available }))
      })
    }
  }, [isOpen])

  const handleUrlSubmit = async () => {
    if (!state.url.trim()) return

    setState(prev => ({ ...prev, step: 'detection', progress: 10, error: null }))

    try {
      const serverInfo = await detectionService.detectFromUrl(state.url.trim())
      
      if (!serverInfo) {
        setState(prev => ({ 
          ...prev, 
          step: 'error', 
          error: 'Could not detect an MCP server from this URL. Please check the URL and try again.' 
        }))
        return
      }

      if (serverInfo.confidence < 0.7) {
        setState(prev => ({ 
          ...prev, 
          step: 'error', 
          error: `This doesn't appear to be an MCP server (confidence: ${Math.round(serverInfo.confidence * 100)}%). Please provide a URL to an MCP server repository.` 
        }))
        return
      }

      setState(prev => ({ 
        ...prev, 
        step: 'server-info', 
        serverInfo, 
        progress: 30 
      }))

    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        step: 'error', 
        error: 'Failed to analyze the URL. Please check your internet connection and try again.' 
      }))
    }
  }

  const handleServerConfirm = async () => {
    if (!state.serverInfo) return

    // Check OAuth requirements
    if (state.serverInfo.requiresAuth) {
      const authCheck = await oauthManager.checkRequiredConnections(
        state.serverInfo.authProviders.map(p => p.name)
      )

      setState(prev => ({ 
        ...prev, 
        step: 'oauth-setup',
        connectedProviders: authCheck.connected,
        missingProviders: authCheck.missing,
        progress: 50
      }))
    } else {
      // Skip OAuth setup, go directly to installation
      handleInstallation()
    }
  }

  const handleOAuthConnect = async (providerId: string) => {
    try {
      setState(prev => ({ ...prev, error: null }))
      await oauthManager.initiateOAuth(providerId, state.serverInfo?.id)
      
      // Recheck connections after OAuth
      if (state.serverInfo?.requiresAuth) {
        const authCheck = await oauthManager.checkRequiredConnections(
          state.serverInfo.authProviders.map(p => p.name)
        )

        setState(prev => ({ 
          ...prev, 
          connectedProviders: authCheck.connected,
          missingProviders: authCheck.missing
        }))
      }
      
      toast({
        title: 'Connected!',
        description: `Successfully connected to ${OAUTH_PROVIDERS[providerId]?.displayName}`,
      })
    } catch (error) {
      toast({
        title: 'Connection failed',
        description: error instanceof Error ? error.message : 'OAuth connection failed',
        variant: 'destructive',
      })
    }
  }

  const handleOAuthContinue = () => {
    if (state.missingProviders.length > 0) {
      toast({
        title: 'Missing connections',
        description: 'Please connect all required services before continuing',
        variant: 'destructive',
      })
      return
    }

    handleInstallation()
  }

  const handleInstallation = async () => {
    if (!state.serverInfo) return

    setState(prev => ({ ...prev, step: 'installation', progress: 70 }))

    try {
      // Generate environment variables from OAuth connections
      let envVars: Record<string, string> = {}
      if (state.serverInfo.requiresAuth) {
        envVars = await oauthManager.generateEnvVars(
          state.serverInfo.authProviders.map(p => p.name)
        )
      }

      // Create MCP server configuration
      const serverConfig = {
        id: state.serverInfo.id,
        name: state.serverInfo.name,
        command: state.serverInfo.command,
        args: state.serverInfo.args,
        env: { ...state.serverInfo.env, ...envVars }
      }

      // Add installation log
      setState(prev => ({ 
        ...prev, 
        installationLogs: [...prev.installationLogs, '🚀 Starting MCP server setup...'],
        progress: 80
      }))

      // Connect via existing MCP system
      connect({ config: serverConfig }, {
        onSuccess: () => {
          setState(prev => ({ 
            ...prev, 
            step: 'success', 
            progress: 100,
            installationLogs: [...prev.installationLogs, '✅ MCP server connected successfully!']
          }))
          
          toast({
            title: 'Success!',
            description: `${state.serverInfo!.name} is now connected and ready to use`,
          })

          onSuccess?.(state.serverInfo!.id)
        },
        onError: (error) => {
          setState(prev => ({ 
            ...prev, 
            step: 'error',
            error: `Installation failed: ${error.message}`,
            installationLogs: [...prev.installationLogs, `❌ Error: ${error.message}`]
          }))
        }
      })

    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        step: 'error',
        error: error instanceof Error ? error.message : 'Installation failed'
      }))
    }
  }

  const handleCloudBridgeSetup = async () => {
    if (!state.serverInfo) return

    setState(prev => ({ ...prev, step: 'cloud-bridge', progress: 75, useCloudBridge: true }))

    try {
      // Get OAuth tokens if needed
      let oauthTokens: Record<string, any> = {}
      if (state.serverInfo.requiresAuth) {
        // Get stored tokens for each required provider
        for (const provider of state.serverInfo.authProviders) {
          const connection = await oauthManager.getConnection(provider.name)
          if (connection) {
            oauthTokens[provider.name] = {
              accessToken: connection.access_token,
              refreshToken: connection.refresh_token,
              expiresAt: connection.expires_at
            }
          }
        }
      }

      // Add installation log
      setState(prev => ({ 
        ...prev, 
        installationLogs: [...prev.installationLogs, '☁️ Creating cloud bridge instance...'],
        progress: 85
      }))

      // Create cloud bridge instance
      const instance = await cloudBridgeService.createInstance(state.serverInfo, oauthTokens)

      setState(prev => ({ 
        ...prev, 
        installationLogs: [...prev.installationLogs, '✅ Cloud bridge instance created successfully!'],
        progress: 100,
        step: 'success'
      }))

      toast({
        title: 'Cloud Bridge Ready!',
        description: `${state.serverInfo!.name} is now running in the cloud and ready to use`,
      })

      onSuccess?.(state.serverInfo.id)

    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        step: 'error',
        error: error instanceof Error ? error.message : 'Cloud Bridge setup failed',
        installationLogs: [...prev.installationLogs, `❌ Error: ${error instanceof Error ? error.message : 'Cloud Bridge setup failed'}`]
      }))
    }
  }

  const handleRetry = () => {
    setState(prev => ({ 
      ...prev, 
      step: 'url-input', 
      error: null, 
      progress: 0,
      installationLogs: [],
      useCloudBridge: false
    }))
  }

  const handleClose = () => {
    if (state.step === 'installation' || state.step === 'cloud-bridge') {
      toast({
        title: 'Setup in progress',
        description: 'Please wait for the installation to complete',
        variant: 'destructive',
      })
      return
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Magic MCP Setup
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Setup Progress</span>
              <span>{Math.round(state.progress)}%</span>
            </div>
            <Progress value={state.progress} className="h-2" />
          </div>

          {/* URL Input Step */}
          {state.step === 'url-input' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="w-5 h-5 text-blue-600" />
                  Paste MCP Server URL
                </CardTitle>
                <CardDescription>
                  Enter the URL of an MCP server from GitHub, npm, or other repository
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Input
                    placeholder="https://github.com/modelcontextprotocol/server-github"
                    value={state.url}
                    onChange={(e) => setState(prev => ({ ...prev, url: e.target.value }))}
                    onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
                  />
                  <p className="text-sm text-gray-500">
                    Example: GitHub repos, npm packages, or other MCP server URLs
                  </p>
                </div>

                <Button onClick={handleUrlSubmit} disabled={!state.url.trim()} className="w-full">
                  <Search className="w-4 h-4 mr-2" />
                  Detect MCP Server
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Detection Step */}
          {state.step === 'detection' && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <LoadingSpinner className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Analyzing URL...</h3>
                    <p className="text-sm text-gray-600">
                      Detecting MCP server configuration and requirements
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Server Info Step */}
          {state.step === 'server-info' && state.serverInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  MCP Server Detected
                </CardTitle>
                <CardDescription>
                  Confidence: {Math.round(state.serverInfo.confidence * 100)}%
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                    {state.serverInfo.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{state.serverInfo.name}</h3>
                    <p className="text-sm text-gray-600">{state.serverInfo.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      <Badge variant="outline">{state.serverInfo.category}</Badge>
                      {state.serverInfo.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {state.serverInfo.requiresAuth && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-yellow-600" />
                      <span className="font-medium text-yellow-800">Authentication Required</span>
                    </div>
                    <p className="text-sm text-yellow-700">
                      This server needs access to: {state.serverInfo.authProviders.map(p => p.displayName).join(', ')}
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button onClick={handleServerConfirm} className="flex-1">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Continue Setup
                  </Button>
                  <Button variant="outline" onClick={() => setState(prev => ({ ...prev, step: 'url-input' }))}>
                    Back
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* OAuth Setup Step */}
          {state.step === 'oauth-setup' && state.serverInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-blue-600" />
                  Connect Your Accounts
                </CardTitle>
                <CardDescription>
                  {state.serverInfo.name} needs access to these services to work properly
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {state.serverInfo.authProviders.map((provider) => {
                  const isConnected = state.connectedProviders.includes(provider.name)
                  const oauthProvider = OAUTH_PROVIDERS[provider.name]
                  
                  return (
                    <div key={provider.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isConnected ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          {isConnected ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <Shield className="w-5 h-5 text-gray-500" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{provider.displayName}</div>
                          <div className="text-sm text-gray-600">{provider.instructions}</div>
                        </div>
                      </div>
                      <div>
                        {isConnected ? (
                          <Badge className="bg-green-100 text-green-800">Connected</Badge>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleOAuthConnect(provider.name)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <ExternalLink className="w-3 h-3 mr-2" />
                            Connect
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}

                <div className="flex gap-2 pt-2">
                  <Button 
                    onClick={handleOAuthContinue} 
                    disabled={state.missingProviders.length > 0}
                    className="flex-1"
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Continue to Installation
                  </Button>
                  <Button variant="outline" onClick={() => setState(prev => ({ ...prev, step: 'server-info' }))}>
                    Back
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Installation Step */}
          {state.step === 'installation' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-purple-600" />
                  Installing MCP Server
                </CardTitle>
                <CardDescription>
                  Setting up {state.serverInfo?.name}...
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {state.installationLogs.map((log, index) => (
                    <div key={index} className="text-sm font-mono text-gray-600 bg-gray-50 p-2 rounded">
                      {log}
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <LoadingSpinner className="w-4 h-4" />
                  <span className="text-sm text-gray-600">Installation in progress...</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cloud Bridge Step */}
          {state.step === 'cloud-bridge' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cloud className="w-5 h-5 text-purple-600" />
                  Setting Up Cloud Bridge
                </CardTitle>
                <CardDescription>
                  Creating cloud instance for {state.serverInfo?.name}...
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Cloud className="w-4 h-4 text-purple-600" />
                    <span className="font-medium text-purple-800">Cloud Bridge</span>
                  </div>
                  <p className="text-sm text-purple-700">
                    We're setting up your MCP server in the cloud so you don't need to install anything locally.
                  </p>
                </div>

                <div className="space-y-2">
                  {state.installationLogs.map((log, index) => (
                    <div key={index} className="text-sm font-mono text-gray-600 bg-gray-50 p-2 rounded">
                      {log}
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <LoadingSpinner className="w-4 h-4" />
                  <span className="text-sm text-gray-600">Setting up cloud instance...</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Success Step */}
          {state.step === 'success' && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-900">Setup Complete! 🎉</h3>
                    <p className="text-sm text-green-700">
                      {state.serverInfo?.name} is now connected and ready to use
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Button onClick={handleClose} className="w-full">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Start Using {state.serverInfo?.name}
                    </Button>
                    <p className="text-xs text-green-600">
                      Try the @context command in AI Studio to pull data from your new integration!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Step */}
          {state.step === 'error' && state.error && (
            <TroubleshootingPanel
              error={state.error}
              context={{
                step: 'installation',
                serverInfo: state.serverInfo,
              }}
              onRetry={handleRetry}
              onUseCloudBridge={state.cloudBridgeAvailable ? handleCloudBridgeSetup : undefined}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}