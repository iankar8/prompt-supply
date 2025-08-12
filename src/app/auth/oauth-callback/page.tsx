'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { oauthManager } from '@/lib/mcp/oauth'
import { 
  CheckCircle, 
  AlertCircle
} from 'lucide-react'

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic'

function OAuthCallbackContent() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    const handleCallback = async () => {
      try {
        const code = searchParams.get('code')
        const state = searchParams.get('state')
        const error = searchParams.get('error')

        if (error) {
          setStatus('error')
          setError(error === 'access_denied' ? 'OAuth access was denied' : `OAuth error: ${error}`)
          return
        }

        if (!code || !state) {
          setStatus('error')
          setError('Missing authorization code or state parameter')
          return
        }

        // Extract provider from state (format: "randomState:provider")
        const [, providerContext] = state.split(':')
        const provider = providerContext ? atob(providerContext) : 'github' // Default fallback

        // Handle OAuth callback
        await oauthManager.handleOAuthCallback(provider, code, state)
        
        setStatus('success')
        
        // Close the popup after a brief delay
        setTimeout(() => {
          if (window.opener) {
            window.close()
          }
        }, 2000)

      } catch (err) {
        console.error('OAuth callback error:', err)
        setStatus('error')
        setError(err instanceof Error ? err.message : 'OAuth callback failed')
      }
    }

    handleCallback()
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {status === 'loading' && <LoadingSpinner className="w-5 h-5" />}
            {status === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
            {status === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
            OAuth {status === 'loading' ? 'Processing...' : status === 'success' ? 'Success' : 'Error'}
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Completing your OAuth connection...'}
            {status === 'success' && 'Your account has been connected successfully!'}
            {status === 'error' && 'There was a problem with the OAuth flow'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {status === 'loading' && (
            <div className="space-y-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <LoadingSpinner className="w-6 h-6" />
              </div>
              <p className="text-sm text-gray-600">
                Exchanging authorization code for access token...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-green-700 mb-2">
                  Connection established successfully!
                </p>
                <p className="text-xs text-gray-500">
                  This window will close automatically...
                </p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-3">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-red-700 mb-2">{error}</p>
                <button
                  onClick={() => window.close()}
                  className="text-xs text-gray-500 underline hover:text-gray-700"
                >
                  Close this window
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-8">
            <LoadingSpinner className="w-8 h-8" />
          </CardContent>
        </Card>
      </div>
    }>
      <OAuthCallbackContent />
    </Suspense>
  )
}