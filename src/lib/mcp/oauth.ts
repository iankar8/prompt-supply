import { createSupabaseClient } from '@/lib/supabase'

export interface OAuthTokens {
  accessToken: string
  refreshToken?: string
  expiresAt?: Date
  scopes: string[]
  metadata?: Record<string, any>
}

export interface OAuthProvider {
  id: string
  name: string
  displayName: string
  authUrl: string
  tokenUrl: string
  scopes: string[]
  clientId?: string
  iconUrl?: string
  instructions?: string
}

export interface OAuthConnection {
  id: string
  user_id: string
  provider_id: string
  provider_name: string
  access_token: string
  refresh_token?: string
  expires_at?: string
  scopes: string[]
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

// OAuth configuration for common providers
export const OAUTH_PROVIDERS: Record<string, OAuthProvider> = {
  github: {
    id: 'github',
    name: 'github',
    displayName: 'GitHub',
    authUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    scopes: ['repo', 'read:user', 'read:org'],
    iconUrl: '/icons/github.svg',
    instructions: 'Access to repositories, issues, and user information'
  },
  notion: {
    id: 'notion',
    name: 'notion',
    displayName: 'Notion',
    authUrl: 'https://api.notion.com/v1/oauth/authorize',
    tokenUrl: 'https://api.notion.com/v1/oauth/token',
    scopes: ['read_content', 'read_user_with_email'],
    iconUrl: '/icons/notion.svg',
    instructions: 'Access to Notion pages and databases'
  },
  linear: {
    id: 'linear',
    name: 'linear',
    displayName: 'Linear',
    authUrl: 'https://linear.app/oauth/authorize',
    tokenUrl: 'https://api.linear.app/oauth/token',
    scopes: ['read', 'issues:read', 'projects:read'],
    iconUrl: '/icons/linear.svg',
    instructions: 'Access to Linear issues and projects'
  }
}

export class OAuthManager {
  private supabase = createSupabaseClient()
  private readonly REDIRECT_URI = `${window.location.origin}/auth/oauth-callback`

  /**
   * Initiate OAuth flow for a provider
   */
  async initiateOAuth(providerId: string, serverContext?: string): Promise<void> {
    const provider = OAUTH_PROVIDERS[providerId]
    if (!provider) {
      throw new Error(`Unsupported OAuth provider: ${providerId}`)
    }

    // Generate state parameter for security
    const state = this.generateState(serverContext)
    
    // Get client configuration from environment
    const clientId = this.getClientId(providerId)
    if (!clientId) {
      throw new Error(`OAuth client not configured for ${provider.displayName}`)
    }

    // Build authorization URL
    const authUrl = new URL(provider.authUrl)
    authUrl.searchParams.set('client_id', clientId)
    authUrl.searchParams.set('redirect_uri', this.REDIRECT_URI)
    authUrl.searchParams.set('scope', provider.scopes.join(' '))
    authUrl.searchParams.set('state', state)
    authUrl.searchParams.set('response_type', 'code')

    // Store state in localStorage for validation
    localStorage.setItem(`oauth_state_${providerId}`, state)
    if (serverContext) {
      localStorage.setItem(`oauth_context_${providerId}`, serverContext)
    }

    // Open OAuth flow in popup
    const popup = window.open(
      authUrl.toString(),
      `oauth_${providerId}`,
      'width=600,height=700,scrollbars=yes,resizable=yes'
    )

    if (!popup) {
      throw new Error('Popup blocked. Please allow popups and try again.')
    }

    // Monitor popup for completion
    return new Promise((resolve, reject) => {
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed)
          // Check if we have tokens (success) or not (user cancelled)
          const tokens = localStorage.getItem(`oauth_tokens_${providerId}`)
          if (tokens) {
            localStorage.removeItem(`oauth_tokens_${providerId}`)
            resolve()
          } else {
            reject(new Error('OAuth flow was cancelled'))
          }
        }
      }, 1000)

      // Timeout after 5 minutes
      setTimeout(() => {
        clearInterval(checkClosed)
        popup.close()
        reject(new Error('OAuth flow timed out'))
      }, 300000)
    })
  }

  /**
   * Handle OAuth callback (called from callback page)
   */
  async handleOAuthCallback(providerId: string, code: string, state: string): Promise<OAuthTokens> {
    const provider = OAUTH_PROVIDERS[providerId]
    if (!provider) {
      throw new Error(`Unsupported OAuth provider: ${providerId}`)
    }

    // Validate state parameter
    const expectedState = localStorage.getItem(`oauth_state_${providerId}`)
    if (state !== expectedState) {
      throw new Error('Invalid OAuth state parameter')
    }

    // Exchange code for tokens
    const tokens = await this.exchangeCodeForTokens(providerId, code)
    
    // Store tokens securely
    await this.storeTokens(providerId, tokens)
    
    // Clean up localStorage
    localStorage.removeItem(`oauth_state_${providerId}`)
    localStorage.setItem(`oauth_tokens_${providerId}`, 'success')
    
    return tokens
  }

  /**
   * Exchange authorization code for access tokens
   */
  private async exchangeCodeForTokens(providerId: string, code: string): Promise<OAuthTokens> {
    const provider = OAUTH_PROVIDERS[providerId]
    const clientId = this.getClientId(providerId)
    const clientSecret = this.getClientSecret(providerId)

    if (!clientId || !clientSecret) {
      throw new Error(`OAuth credentials not configured for ${provider.displayName}`)
    }

    const response = await fetch('/api/oauth/exchange', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider: providerId,
        code,
        clientId,
        clientSecret,
        redirectUri: this.REDIRECT_URI
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Token exchange failed')
    }

    return await response.json()
  }

  /**
   * Store OAuth tokens securely in Supabase
   */
  private async storeTokens(providerId: string, tokens: OAuthTokens): Promise<void> {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    // Encrypt tokens before storage (in production, use proper encryption)
    const encryptedTokens = {
      access_token: tokens.accessToken, // TODO: Encrypt
      refresh_token: tokens.refreshToken, // TODO: Encrypt
      expires_at: tokens.expiresAt?.toISOString(),
      scopes: tokens.scopes,
      metadata: tokens.metadata || {}
    }

    // Upsert OAuth connection
    const { error } = await this.supabase
      .from('oauth_connections' as any)
      .upsert({
        user_id: user.id,
        provider_id: providerId,
        provider_name: OAUTH_PROVIDERS[providerId].displayName,
        ...encryptedTokens,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,provider_id'
      })

    if (error) {
      throw new Error(`Failed to store OAuth tokens: ${error.message}`)
    }
  }

  /**
   * Get stored OAuth connection for a provider
   */
  async getConnection(providerId: string): Promise<OAuthConnection | null> {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await this.supabase
      .from('oauth_connections' as any)
      .select('*')
      .eq('user_id', user.id)
      .eq('provider_id', providerId)
      .single()

    if (error || !data) return null

    return data as any
  }

  /**
   * Get all OAuth connections for the current user
   */
  async getAllConnections(): Promise<OAuthConnection[]> {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await this.supabase
      .from('oauth_connections' as any)
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch OAuth connections:', error)
      return []
    }

    return data as any || []
  }

  /**
   * Disconnect OAuth provider
   */
  async disconnectProvider(providerId: string): Promise<void> {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { error } = await this.supabase
      .from('oauth_connections' as any)
      .delete()
      .eq('user_id', user.id)
      .eq('provider_id', providerId)

    if (error) {
      throw new Error(`Failed to disconnect ${providerId}: ${error.message}`)
    }
  }

  /**
   * Generate environment variables for MCP server from OAuth connections
   */
  async generateEnvVars(requiredProviders: string[]): Promise<Record<string, string>> {
    const envVars: Record<string, string> = {}

    for (const providerId of requiredProviders) {
      const connection = await this.getConnection(providerId)
      if (!connection) {
        throw new Error(`${OAUTH_PROVIDERS[providerId]?.displayName || providerId} connection required but not found`)
      }

      // Map provider tokens to environment variables
      switch (providerId) {
        case 'github':
          envVars.GITHUB_TOKEN = connection.access_token
          break
        case 'notion':
          envVars.NOTION_API_KEY = connection.access_token
          break
        case 'linear':
          envVars.LINEAR_API_KEY = connection.access_token
          break
        default:
          envVars[`${providerId.toUpperCase()}_TOKEN`] = connection.access_token
      }
    }

    return envVars
  }

  /**
   * Check if all required OAuth providers are connected
   */
  async checkRequiredConnections(requiredProviders: string[]): Promise<{
    connected: string[]
    missing: string[]
    allConnected: boolean
  }> {
    const connected: string[] = []
    const missing: string[] = []

    for (const providerId of requiredProviders) {
      const connection = await this.getConnection(providerId)
      if (connection) {
        connected.push(providerId)
      } else {
        missing.push(providerId)
      }
    }

    return {
      connected,
      missing,
      allConnected: missing.length === 0
    }
  }

  /**
   * Refresh OAuth tokens if needed
   */
  async refreshTokensIfNeeded(providerId: string): Promise<boolean> {
    const connection = await this.getConnection(providerId)
    if (!connection || !connection.refresh_token) return false

    // Check if token is expiring soon (within 1 hour)
    if (connection.expires_at) {
      const expiresAt = new Date(connection.expires_at)
      const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000)
      
      if (expiresAt > oneHourFromNow) {
        return false // Token is still valid
      }
    }

    // Refresh the token
    try {
      const response = await fetch('/api/oauth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: providerId,
          refreshToken: connection.refresh_token
        })
      })

      if (!response.ok) return false

      const newTokens = await response.json()
      await this.storeTokens(providerId, newTokens)
      return true
    } catch (error) {
      console.error('Token refresh failed:', error)
      return false
    }
  }

  // Helper methods
  private generateState(context?: string): string {
    const randomBytes = new Uint8Array(32)
    crypto.getRandomValues(randomBytes)
    const state = btoa(String.fromCharCode.apply(null, Array.from(randomBytes)))
    return context ? `${state}:${btoa(context)}` : state
  }

  private getClientId(providerId: string): string | undefined {
    // In production, these should come from environment variables or secure config
    const clientIds: Record<string, string | undefined> = {
      github: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
      notion: process.env.NEXT_PUBLIC_NOTION_CLIENT_ID,
      linear: process.env.NEXT_PUBLIC_LINEAR_CLIENT_ID
    }
    return clientIds[providerId]
  }

  private getClientSecret(providerId: string): string | undefined {
    // These should be server-side only
    const clientSecrets: Record<string, string | undefined> = {
      github: process.env.GITHUB_CLIENT_SECRET,
      notion: process.env.NOTION_CLIENT_SECRET,
      linear: process.env.LINEAR_CLIENT_SECRET
    }
    return clientSecrets[providerId]
  }
}

export const oauthManager = new OAuthManager()