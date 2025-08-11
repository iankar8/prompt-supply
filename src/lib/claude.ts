import Anthropic from '@anthropic-ai/sdk'
import { getRelevantTrainingContent, createTrainingEnhancedSystemPrompt } from './training-content'

// Initialize Claude client
const claude = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface PromptAnalysis {
  score: number
  strengths: string[]
  weaknesses: string[]
  suggestions: string[]
  improvedVersion: string
  reasoning: string
}

export interface PromptGenerationRequest {
  purpose: string
  domain: string
  tone?: string
  length?: 'short' | 'medium' | 'long'
  audience?: string
  examples?: string
}

export interface TestResult {
  response: string
  quality: number
  clarity: number
  relevance: number
  creativity: number
  issues: string[]
  suggestions: string[]
}

export const promptEngineeringService = {
  /**
   * Analyze and improve a prompt using Claude's expertise
   */
  async analyzePrompt(prompt: string, context?: string): Promise<PromptAnalysis> {
    const systemPrompt = `You are an expert prompt engineer with deep knowledge of AI language models, particularly Claude. Your job is to analyze prompts and provide detailed feedback to improve their effectiveness.

When analyzing a prompt, consider:
- Clarity and specificity of instructions
- Context and background information
- Examples and formatting
- Potential ambiguities or misinterpretations
- Task complexity and structure
- Expected output format

Provide a comprehensive analysis with:
1. An overall quality score (1-10)
2. Key strengths of the prompt
3. Areas for improvement
4. Specific actionable suggestions
5. An improved version of the prompt
6. Detailed reasoning for your improvements`

    const userPrompt = `Please analyze this prompt and provide detailed feedback:

${context ? `Context: ${context}\n\n` : ''}Prompt to analyze:
"""
${prompt}
"""

Please provide your analysis in the following JSON format:
{
  "score": <number between 1-10>,
  "strengths": [<array of strength descriptions>],
  "weaknesses": [<array of weakness descriptions>],
  "suggestions": [<array of specific improvement suggestions>],
  "improvedVersion": "<your improved version of the prompt>",
  "reasoning": "<detailed explanation of your improvements>"
}`

    try {
      const response = await claude.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ]
      })

      const content = response.content[0]
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude')
      }

      return JSON.parse(content.text)
    } catch (error) {
      console.error('Error analyzing prompt:', error)
      throw new Error('Failed to analyze prompt with Claude')
    }
  },

  /**
   * Generate a new prompt based on requirements with training content integration
   */
  async generatePrompt(request: PromptGenerationRequest): Promise<string> {
    // Get relevant training content based on the request
    const relevantContent = getRelevantTrainingContent(
      request.purpose, 
      request.domain, 
      request.tone
    )

    const baseSystemPrompt = `You are a master prompt engineer with expertise in state-of-the-art AI agent design. You create enterprise-grade prompts using advanced techniques from the best AI startups and cutting-edge GPT-5 research.

CORE PRINCIPLES - Apply these cutting-edge techniques:

1. HYPER-SPECIFIC ROLE ASSIGNMENT ("Manager Approach")
   - Define comprehensive personas with detailed responsibilities
   - Include expertise areas, operating constraints, and communication style
   - Treat the AI like a new employee with complete job description

2. GPT-5 INSTRUCTION STYLE SENSITIVITY
   - Be explicit about tone, style, and communication patterns
   - Use consistent formatting throughout prompts
   - Define expectations clearly with well-structured parameters
   - Include style examples when tone is critical

3. PLANNING BEFORE EXECUTION FRAMEWORK
   - Always include explicit planning phases: "Before responding, please:"
   - Ask AI to decompose requests into core components
   - Identify ambiguities that need clarification
   - Create structured approach to address each component
   - Validate understanding before proceeding

4. SYSTEMATIC SPEC FORMAT STRUCTURE
   - Use <task_spec> tags for complex behaviors:
     * Definition: What exactly you want accomplished
     * When Required: Conditions that trigger this behavior
     * Format & Style: How output should be structured
     * Sequence: Step-by-step order of operations
     * Prohibited: What to avoid
     * Handling Ambiguity: How to deal with unclear inputs

5. REASONING & VALIDATION INTEGRATION
   - Pre-execution Reasoning: "Explain your understanding and approach"
   - Planning Phase: "Create detailed plan with all sub-tasks"
   - Validation Checkpoints: "Verify output meets requirements after each step"
   - Post-action Review: "Confirm objectives met before concluding"

6. COMPLETE TASK RESOLUTION INSTRUCTIONS
   - "Continue working until entire request is fully resolved"
   - "Decompose query into ALL required sub-tasks"
   - "Confirm each sub-task completed before moving on"
   - "Handle follow-up questions without losing context"

7. ENTERPRISE OUTPUT STRUCTURING
   - Use XML-like tags for machine-parseable responses when appropriate
   - Include confidence levels and debug traces
   - Provide structured metadata for integration

8. RELIABILITY MECHANISMS
   - Always include escape hatches for uncertain situations
   - Add debug/thinking traces for transparency
   - Specify handling of edge cases and missing information

9. ADVANCED TECHNIQUES
   - Design for prompt folding when applicable (multi-stage workflows)
   - Include few-shot examples for complex formatting
   - Consider model personalities and optimization for different AI systems

GENERATION STRATEGY:
- Start with hyper-specific persona definition
- Apply systematic framework structure
- Add enterprise-grade output formatting
- Include reliability safeguards
- Optimize for professional, production-ready use

Your prompts should be detailed, comprehensive, and suitable for mission-critical applications.`

    // Enhance the system prompt with training content
    const enhancedSystemPrompt = createTrainingEnhancedSystemPrompt(baseSystemPrompt, relevantContent)

    const userPrompt = `Create an enterprise-grade prompt using state-of-the-art techniques for the following requirements:

PURPOSE: ${request.purpose}
DOMAIN: ${request.domain}
${request.tone ? `TONE: ${request.tone}` : ''}
${request.length ? `COMPLEXITY: ${request.length}` : ''}
${request.audience ? `TARGET AUDIENCE: ${request.audience}` : ''}
${request.examples ? `ADDITIONAL CONTEXT: ${request.examples}` : ''}

GENERATION REQUIREMENTS:

1. HYPER-SPECIFIC PERSONA & GPT-5 STYLE SENSITIVITY
   - Create comprehensive role definition with expertise areas
   - Include operating constraints and communication style
   - Define responsibilities and decision-making authority
   - Be explicit about tone and style expectations
   - Provide style examples if ${request.tone} tone is specified

2. PLANNING & REASONING FRAMEWORK
   - Include explicit planning phases: "Before responding, please:"
   - Ask AI to decompose the request into core components
   - Identify any ambiguities that need clarification
   - Create structured approach for each component
   - Validate understanding before proceeding

3. SPEC FORMAT STRUCTURE (when complex)
   - Use <task_spec> tags for detailed behaviors:
     * Definition: What exactly you want accomplished
     * When Required: Conditions that trigger this behavior
     * Format & Style: How output should be structured
     * Sequence: Step-by-step order of operations
     * Prohibited: What to avoid
     * Handling Ambiguity: How to deal with unclear inputs

4. REASONING & VALIDATION CHECKPOINTS
   - Pre-execution Reasoning: "Explain your understanding and approach"
   - Planning Phase: "Create detailed plan with all sub-tasks"
   - Validation Checkpoints: "Verify output meets requirements after each step"
   - Post-action Review: "Confirm objectives met before concluding"

5. COMPLETE TASK RESOLUTION
   - Instruct to "Continue working until entire request is fully resolved"
   - "Decompose query into ALL required sub-tasks"
   - "Confirm each sub-task completed before moving on"
   - "Handle follow-up questions without losing context"

6. ENTERPRISE FEATURES
   - Add confidence indicators and debug traces where valuable
   - Include error handling and edge case management
   - Design for ${request.length === 'long' ? 'comprehensive, detailed' : request.length === 'short' ? 'concise but complete' : 'balanced'} complexity

7. RELIABILITY SAFEGUARDS
   - Implement "I don't know" escape conditions
   - Specify handling of insufficient information
   - Add quality control mechanisms

8. DOMAIN OPTIMIZATION
   - Apply ${request.domain}-specific best practices
   - Use appropriate terminology and examples
   - Consider domain-specific constraints and requirements

Output a production-ready prompt that incorporates training content principles and follows enterprise-grade standards. The prompt should be comprehensive enough for mission-critical applications while being ${request.length || 'appropriately detailed'} for the use case.

Return only the final prompt - no explanations or meta-commentary.`

    try {
      const response = await claude.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        system: enhancedSystemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ]
      })

      const content = response.content[0]
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude')
      }

      return content.text
    } catch (error) {
      console.error('Error generating prompt:', error)
      throw new Error('Failed to generate prompt with Claude')
    }
  },

  /**
   * Test a prompt by running it through Claude and evaluating the results
   */
  async testPrompt(prompt: string, testInputs: string[] = ['']): Promise<TestResult[]> {
    const results: TestResult[] = []

    for (const input of testInputs) {
      try {
        // Run the prompt with the test input
        const response = await claude.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: input ? `${prompt}\n\nInput: ${input}` : prompt
            }
          ]
        })

        const content = response.content[0]
        if (content.type !== 'text') {
          throw new Error('Unexpected response type from Claude')
        }

        const responseText = content.text

        // Analyze the response quality
        const analysisPrompt = `Please evaluate this AI response based on the original prompt and input:

Original Prompt: "${prompt}"
${input ? `Input: "${input}"` : ''}
AI Response: "${responseText}"

Provide an evaluation in this JSON format:
{
  "quality": <score 1-10 for overall response quality>,
  "clarity": <score 1-10 for clarity and coherence>,
  "relevance": <score 1-10 for relevance to the prompt>,
  "creativity": <score 1-10 for creativity and insight>,
  "issues": [<array of any problems or issues>],
  "suggestions": [<array of suggestions for improvement>]
}`

        const evaluationResponse = await claude.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 800,
          system: 'You are an expert AI evaluator who assesses the quality of AI-generated responses.',
          messages: [
            {
              role: 'user',
              content: analysisPrompt
            }
          ]
        })

        const evalContent = evaluationResponse.content[0]
        if (evalContent.type !== 'text') {
          throw new Error('Unexpected response type from Claude')
        }

        const evaluation = JSON.parse(evalContent.text)

        results.push({
          response: responseText,
          ...evaluation
        })

      } catch (error) {
        console.error('Error testing prompt:', error)
        results.push({
          response: 'Error testing prompt',
          quality: 0,
          clarity: 0,
          relevance: 0,
          creativity: 0,
          issues: ['Failed to test prompt'],
          suggestions: ['Check prompt syntax and try again']
        })
      }
    }

    return results
  },

  /**
   * Chat with Claude about prompt engineering
   */
  async chatAboutPrompt(
    message: string, 
    prompt?: string, 
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
  ): Promise<string> {
    const systemPrompt = `You are a helpful prompt engineering assistant. You help users improve their prompts, understand best practices, and solve prompt-related challenges.

You have expertise in:
- Writing clear and effective prompts
- Understanding AI model behavior and limitations
- Debugging prompt issues
- Optimizing prompts for different use cases
- Best practices in prompt engineering

${prompt ? `Current prompt being discussed: "${prompt}"` : ''}

Be conversational, helpful, and provide specific, actionable advice.`

    try {
      const messages = [
        ...conversationHistory.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        })),
        {
          role: 'user' as const,
          content: message
        }
      ]

      const response = await claude.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        system: systemPrompt,
        messages
      })

      const content = response.content[0]
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude')
      }

      return content.text
    } catch (error) {
      console.error('Error chatting about prompt:', error)
      throw new Error('Failed to chat with Claude about prompt')
    }
  }
}

export default promptEngineeringService