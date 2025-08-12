import { NextRequest, NextResponse } from 'next/server'

// OAuth provider configurations (server-side only)
const OAUTH_PROVIDERS: Record<string, any> = {
  github: {
    tokenUrl: 'https://github.com/login/oauth/access_token',
    scopes: ['repo', 'read:user']
  },
  notion: {
    tokenUrl: 'https://api.notion.com/v1/oauth/token',
    scopes: ['read_content', 'read_user']
  },
  linear: {
    tokenUrl: 'https://api.linear.app/oauth/token',
    scopes: ['read', 'write']
  }
}

export async function POST(request: NextRequest) {
  try {
    const { provider, refreshToken } = await request.json()

    if (!provider || !refreshToken) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    const oauthProvider = OAUTH_PROVIDERS[provider]
    if (!oauthProvider) {
      return NextResponse.json(
        { error: 'Unsupported OAuth provider' },
        { status: 400 }
      )
    }

    // Get client credentials from environment
    const clientId = process.env[`${provider.toUpperCase()}_CLIENT_ID`]
    const clientSecret = process.env[`${provider.toUpperCase()}_CLIENT_SECRET`]

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'OAuth credentials not configured' },
        { status: 500 }
      )
    }

    // Refresh the token
    const refreshResponse = await fetch(oauthProvider.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Prompt.Supply/1.0'
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      })
    })

    if (!refreshResponse.ok) {
      const error = await refreshResponse.text()
      console.error('Token refresh failed:', error)
      return NextResponse.json(
        { error: 'Token refresh failed' },
        { status: 400 }
      )
    }

    const tokenData = await refreshResponse.json()

    // Handle different response formats from different providers
    let accessToken = tokenData.access_token
    let newRefreshToken = tokenData.refresh_token || refreshToken // Some providers don't return new refresh token
    let expiresIn = tokenData.expires_in
    let scopes = tokenData.scope ? tokenData.scope.split(' ') : oauthProvider.scopes

    // GitHub returns comma-separated scopes
    if (provider === 'github' && tokenData.scope) {
      scopes = tokenData.scope.split(',').map((s: string) => s.trim())
    }

    const result = {
      accessToken,
      refreshToken: newRefreshToken,
      expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000) : undefined,
      scopes,
      metadata: {
        tokenType: tokenData.token_type,
        provider: provider
      }
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('OAuth refresh error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}