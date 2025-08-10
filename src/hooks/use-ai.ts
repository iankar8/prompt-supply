import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from '@/hooks/use-toast'

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

// Hook for analyzing prompts
export function useAnalyzePrompt() {
  return useMutation<PromptAnalysis, Error, { prompt: string; context?: string }>({
    mutationFn: async ({ prompt, context }) => {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, context }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to analyze prompt')
      }

      return response.json()
    },
    onSuccess: () => {
      toast({
        title: 'Analysis Complete',
        description: 'Your prompt has been analyzed successfully.',
      })
    },
    onError: (error) => {
      toast({
        title: 'Analysis Failed',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

// Hook for generating prompts
export function useGeneratePrompt() {
  return useMutation<{ prompt: string }, Error, PromptGenerationRequest>({
    mutationFn: async (request) => {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate prompt')
      }

      return response.json()
    },
    onSuccess: () => {
      toast({
        title: 'Prompt Generated',
        description: 'AI has generated a new prompt for you.',
      })
    },
    onError: (error) => {
      toast({
        title: 'Generation Failed',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

// Hook for testing prompts
export function useTestPrompt() {
  return useMutation<{ results: TestResult[] }, Error, { prompt: string; testInputs?: string[] }>({
    mutationFn: async ({ prompt, testInputs }) => {
      const response = await fetch('/api/ai/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, testInputs }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to test prompt')
      }

      return response.json()
    },
    onSuccess: () => {
      toast({
        title: 'Test Complete',
        description: 'Your prompt has been tested successfully.',
      })
    },
    onError: (error) => {
      toast({
        title: 'Test Failed',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

// Hook for chatting about prompts
export function useChatAboutPrompt() {
  return useMutation<
    { response: string },
    Error,
    {
      message: string
      prompt?: string
      conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>
    }
  >({
    mutationFn: async ({ message, prompt, conversationHistory }) => {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, prompt, conversationHistory }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to chat about prompt')
      }

      return response.json()
    },
    onError: (error) => {
      toast({
        title: 'Chat Failed',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}