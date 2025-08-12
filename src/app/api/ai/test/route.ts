import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { promptEngineeringService } from '@/lib/claude'
import { withRateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  // Apply rate limiting first - test is most expensive (2 API calls per test)
  return withRateLimit(request, 'test', undefined, async () => {
    try {
      console.log('[TEST API] Starting request processing')
      
      // Check authentication (temporarily allow anonymous for debugging)
      const supabase = await createSupabaseServerClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        console.warn('[TEST API] Auth error (allowing anonymous for debugging):', authError)
      }
      
      if (!user) {
        console.warn('[TEST API] No user found (allowing anonymous for debugging)')
      } else {
        console.log('[TEST API] User authenticated:', user.id)
      }

      const { prompt, testInputs = [''] } = await request.json()
      console.log('[TEST API] Request data:', { promptLength: prompt?.length || 0, testInputsCount: testInputs?.length || 0 })

      if (!prompt) {
        console.error('[TEST API] Missing prompt field')
        return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
      }

      console.log('[TEST API] Calling Claude service...')
      
      // Check if ANTHROPIC_API_KEY exists
      if (!process.env.ANTHROPIC_API_KEY) {
        console.error('[TEST API] ANTHROPIC_API_KEY not found in environment')
        return NextResponse.json(
          { error: 'API configuration error' },
          { status: 500 }
        )
      }

      // Test the prompt using Claude
      const results = await promptEngineeringService.testPrompt(prompt, testInputs)
      console.log('[TEST API] Test completed successfully, results count:', results?.length || 0)

      return NextResponse.json({ results })
    } catch (error) {
      console.error('[TEST API] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown',
        error: error
      })
      return NextResponse.json(
        { 
          error: 'Failed to test prompt',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      )
    }
  })
}