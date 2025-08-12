'use client'

import dynamicImport from 'next/dynamic'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Dynamically import the integrations content with no SSR
const IntegrationsContent = dynamicImport(
  () => import('./integrations-content'),
  {
    ssr: false,
    loading: () => (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading integrations...</p>
          </div>
        </div>
      </div>
    ),
  }
)

export default function IntegrationsPage() {
  return <IntegrationsContent />
}