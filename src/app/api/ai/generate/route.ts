import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { promptEngineeringService, PromptGenerationRequest } from '@/lib/claude'
import { withRateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  // Apply rate limiting first
  return withRateLimit(request, 'generate', undefined, async () => {
    try {
      console.log('[GENERATE API] Starting request processing')
      
      // Check authentication (temporarily allow anonymous for debugging)
      const supabase = await createSupabaseServerClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        console.warn('[GENERATE API] Auth error (allowing anonymous for debugging):', authError)
      }
      
      if (!user) {
        console.warn('[GENERATE API] No user found (allowing anonymous for debugging)')
      } else {
        console.log('[GENERATE API] User authenticated:', user.id)
      }

      const generationRequest: PromptGenerationRequest = await request.json()
      console.log('[GENERATE API] Request data:', generationRequest)

      if (!generationRequest.purpose || !generationRequest.domain) {
        console.error('[GENERATE API] Missing required fields:', {
          purpose: !!generationRequest.purpose,
          domain: !!generationRequest.domain
        })
        return NextResponse.json(
          { error: 'Purpose and domain are required' },
          { status: 400 }
        )
      }

      console.log('[GENERATE API] Calling Claude service...')
      
      // Check if ANTHROPIC_API_KEY exists
      if (!process.env.ANTHROPIC_API_KEY) {
        console.error('[GENERATE API] ANTHROPIC_API_KEY not found in environment')
        return NextResponse.json(
          { error: 'API configuration error' },
          { status: 500 }
        )
      }

      // Generate the prompt using Claude
      const generatedPrompt = await promptEngineeringService.generatePrompt(generationRequest)
      console.log('[GENERATE API] Prompt generated successfully, length:', generatedPrompt?.length || 0)

      return NextResponse.json({ prompt: generatedPrompt })
    } catch (error) {
      console.error('[GENERATE API] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown',
        error: error
      })
      return NextResponse.json(
        { 
          error: 'Failed to generate prompt',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      )
    }
  })
}