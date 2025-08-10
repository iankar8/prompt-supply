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

    const { prompt, testInputs = [''] } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // Test the prompt using Claude
    const results = await promptEngineeringService.testPrompt(prompt, testInputs)

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Error testing prompt:', error)
    return NextResponse.json(
      { error: 'Failed to test prompt' },
      { status: 500 }
    )
  }
}