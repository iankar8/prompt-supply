import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { promptEngineeringService } from '@/lib/claude'
import { withRateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  // Apply rate limiting first
  return withRateLimit(request, 'analyze', undefined, async () => {
    try {
      console.log('[ANALYZE API] Starting request processing')
      
      // Check authentication (temporarily allow anonymous for debugging)
      const supabase = await createSupabaseServerClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        console.warn('[ANALYZE API] Auth error (allowing anonymous for debugging):', authError)
      }
      
      if (!user) {
        console.warn('[ANALYZE API] No user found (allowing anonymous for debugging)')
      } else {
        console.log('[ANALYZE API] User authenticated:', user.id)
      }

      const { prompt, context } = await request.json()
      console.log('[ANALYZE API] Request data:', { promptLength: prompt?.length || 0, hasContext: !!context })

      if (!prompt) {
        console.error('[ANALYZE API] Missing prompt field')
        return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
      }

      console.log('[ANALYZE API] Calling Claude service...')
      
      // Check if ANTHROPIC_API_KEY exists
      if (!process.env.ANTHROPIC_API_KEY) {
        console.error('[ANALYZE API] ANTHROPIC_API_KEY not found in environment')
        return NextResponse.json(
          { error: 'API configuration error' },
          { status: 500 }
        )
      }

      // Analyze the prompt using Claude
      const analysis = await promptEngineeringService.analyzePrompt(prompt, context)
      console.log('[ANALYZE API] Analysis completed successfully, score:', analysis?.score || 'unknown')

      return NextResponse.json(analysis)
    } catch (error) {
      console.error('[ANALYZE API] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown',
        error: error
      })
      return NextResponse.json(
        { 
          error: 'Failed to analyze prompt',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      )
    }
  })
}