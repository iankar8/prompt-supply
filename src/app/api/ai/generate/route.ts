import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { promptEngineeringService, PromptGenerationRequest } from '@/lib/claude'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const generationRequest: PromptGenerationRequest = await request.json()

    if (!generationRequest.purpose || !generationRequest.domain) {
      return NextResponse.json(
        { error: 'Purpose and domain are required' },
        { status: 400 }
      )
    }

    // Generate the prompt using Claude
    const generatedPrompt = await promptEngineeringService.generatePrompt(generationRequest)

    return NextResponse.json({ prompt: generatedPrompt })
  } catch (error) {
    console.error('Error generating prompt:', error)
    return NextResponse.json(
      { error: 'Failed to generate prompt' },
      { status: 500 }
    )
  }
}