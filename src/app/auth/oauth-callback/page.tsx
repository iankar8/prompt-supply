'use client'

import dynamicImport from 'next/dynamic'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Card, CardContent } from '@/components/ui/card'

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Dynamically import the OAuth callback component with no SSR
const OAuthCallbackContent = dynamicImport(
  () => import('./oauth-callback-content'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-8">
            <LoadingSpinner className="w-8 h-8" />
          </CardContent>
        </Card>
      </div>
    ),
  }
)

export default function OAuthCallbackPage() {
  return <OAuthCallbackContent />
}