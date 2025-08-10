import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { promptEngineeringService } from '@/lib/claude'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, prompt, conversationHistory = [] } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Chat with Claude about the prompt
    const response = await promptEngineeringService.chatAboutPrompt(
      message,
      prompt,
      conversationHistory
    )

    return NextResponse.json({ response })
  } catch (error) {
    console.error('Error chatting about prompt:', error)
    return NextResponse.json(
      { error: 'Failed to chat about prompt' },
      { status: 500 }
    )
  }
}