'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Force dynamic rendering to avoid SSR issues with client-only components
export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/ai-studio')
  }, [router])

  return null
}
