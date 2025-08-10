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

    const { prompt, context } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // Analyze the prompt using Claude
    const analysis = await promptEngineeringService.analyzePrompt(prompt, context)

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Error analyzing prompt:', error)
    return NextResponse.json(
      { error: 'Failed to analyze prompt' },
      { status: 500 }
    )
  }
}