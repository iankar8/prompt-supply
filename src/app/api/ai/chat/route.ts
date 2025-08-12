import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { promptEngineeringService } from '@/lib/claude'
import { withRateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  // Apply rate limiting first
  return withRateLimit(request, 'chat', undefined, async () => {
    try {
      console.log('[CHAT API] Starting request processing')
      
      // Check authentication (temporarily allow anonymous for debugging)
      const supabase = await createSupabaseServerClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        console.warn('[CHAT API] Auth error (allowing anonymous for debugging):', authError)
      }
      
      if (!user) {
        console.warn('[CHAT API] No user found (allowing anonymous for debugging)')
      } else {
        console.log('[CHAT API] User authenticated:', user.id)
      }

      const { message, prompt, conversationHistory = [] } = await request.json()
      console.log('[CHAT API] Request data:', { messageLength: message?.length || 0, hasPrompt: !!prompt, historyLength: conversationHistory?.length || 0 })

      if (!message) {
        console.error('[CHAT API] Missing message field')
        return NextResponse.json({ error: 'Message is required' }, { status: 400 })
      }

      console.log('[CHAT API] Calling Claude service...')

      // Chat with Claude about the prompt
      const response = await promptEngineeringService.chatAboutPrompt(
        message,
        prompt,
        conversationHistory
      )
      
      console.log('[CHAT API] Chat completed successfully, response length:', response?.length || 0)

      return NextResponse.json({ response })
    } catch (error) {
      console.error('[CHAT API] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown',
        error: error
      })
      return NextResponse.json(
        { 
          error: 'Failed to chat about prompt',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      )
    }
  })
}