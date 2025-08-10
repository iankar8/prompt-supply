'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useTestPrompt, TestResult } from '@/hooks/use-ai'
import { TestTube, Plus, Minus, AlertCircle, CheckCircle, Lightbulb } from 'lucide-react'

interface PromptTesterProps {
  initialPrompt?: string
}

export function PromptTester({ initialPrompt = '' }: PromptTesterProps) {
  const [prompt, setPrompt] = useState(initialPrompt)
  const [testInputs, setTestInputs] = useState([''])
  const [results, setResults] = useState<TestResult[]>([])

  const testPromptMutation = useTestPrompt()

  const addTestInput = () => {
    setTestInputs([...testInputs, ''])
  }

  const removeTestInput = (index: number) => {
    if (testInputs.length > 1) {
      setTestInputs(testInputs.filter((_, i) => i !== index))
    }
  }

  const updateTestInput = (index: number, value: string) => {
    const newInputs = [...testInputs]
    newInputs[index] = value
    setTestInputs(newInputs)
  }

  const handleTest = () => {
    if (!prompt.trim()) return

    testPromptMutation.mutate(
      { 
        prompt: prompt.trim(), 
        testInputs: testInputs.filter(input => input.trim() !== '') 
      },
      {
        onSuccess: (data) => {
          setResults(data.results)
        }
      }
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600'
    if (score >= 6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadge = (score: number) => {
    if (score >= 8) return 'default'
    if (score >= 6) return 'secondary'
    return 'destructive'
  }

  return (
    <div className="space-y-6">
      {/* Testing Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            Prompt Tester
          </CardTitle>
          <CardDescription>
            Test your prompt with different inputs and get detailed quality analysis.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test-prompt">Prompt to Test</Label>
            <Textarea
              id="test-prompt"
              placeholder="Enter the prompt you want to test..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Test Inputs</Label>
              <Button variant="outline" size="sm" onClick={addTestInput}>
                <Plus className="w-4 h-4 mr-1" />
                Add Input
              </Button>
            </div>
            
            {testInputs.map((input, index) => (
              <div key={index} className="flex gap-2">
                <Textarea
                  placeholder={`Test input ${index + 1} (leave empty to test prompt without input)`}
                  value={input}
                  onChange={(e) => updateTestInput(index, e.target.value)}
                  rows={2}
                  className="flex-1"
                />
                {testInputs.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeTestInput(index)}
                    className="self-start mt-1"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button
            onClick={handleTest}
            disabled={!prompt.trim() || testPromptMutation.isPending}
            className="w-full"
          >
            {testPromptMutation.isPending ? (
              <>
                <LoadingSpinner className="w-4 h-4 mr-2" />
                Testing with Claude...
              </>
            ) : (
              <>
                <TestTube className="w-4 h-4 mr-2" />
                Run Tests
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Test Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Test Results</h3>
          
          {results.map((result, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Test {index + 1}
                    {testInputs[index] && testInputs[index].trim() && (
                      <span className="ml-2 text-sm font-normal text-muted-foreground">
                        with input
                      </span>
                    )}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge variant={getScoreBadge(result.quality)}>
                      Quality: {result.quality}/10
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Test Input */}
                {testInputs[index] && testInputs[index].trim() && (
                  <div>
                    <Label className="text-sm font-medium">Input:</Label>
                    <div className="mt-1 p-2 bg-gray-50 rounded text-sm">
                      {testInputs[index]}
                    </div>
                  </div>
                )}

                {/* AI Response */}
                <div>
                  <Label className="text-sm font-medium">AI Response:</Label>
                  <div className="mt-1 p-3 bg-blue-50 rounded text-sm border-l-4 border-blue-200">
                    {result.response}
                  </div>
                </div>

                {/* Scores Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className={`text-lg font-semibold ${getScoreColor(result.quality)}`}>
                      {result.quality}
                    </div>
                    <div className="text-xs text-muted-foreground">Quality</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className={`text-lg font-semibold ${getScoreColor(result.clarity)}`}>
                      {result.clarity}
                    </div>
                    <div className="text-xs text-muted-foreground">Clarity</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className={`text-lg font-semibold ${getScoreColor(result.relevance)}`}>
                      {result.relevance}
                    </div>
                    <div className="text-xs text-muted-foreground">Relevance</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className={`text-lg font-semibold ${getScoreColor(result.creativity)}`}>
                      {result.creativity}
                    </div>
                    <div className="text-xs text-muted-foreground">Creativity</div>
                  </div>
                </div>

                {/* Issues */}
                {result.issues.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                      Issues Identified
                    </Label>
                    <div className="mt-2 space-y-1">
                      {result.issues.map((issue, issueIndex) => (
                        <div key={issueIndex} className="flex items-start gap-2 p-2 bg-yellow-50 rounded text-sm">
                          <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          {issue}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggestions */}
                {result.suggestions.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-blue-600" />
                      Improvement Suggestions
                    </Label>
                    <div className="mt-2 space-y-1">
                      {result.suggestions.map((suggestion, suggestionIndex) => (
                        <div key={suggestionIndex} className="flex items-start gap-2 p-2 bg-blue-50 rounded text-sm">
                          <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Overall Summary */}
          {results.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Overall Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {(results.reduce((sum, r) => sum + r.quality, 0) / results.length).toFixed(1)}
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Quality</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {(results.reduce((sum, r) => sum + r.clarity, 0) / results.length).toFixed(1)}
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Clarity</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {(results.reduce((sum, r) => sum + r.relevance, 0) / results.length).toFixed(1)}
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Relevance</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {(results.reduce((sum, r) => sum + r.creativity, 0) / results.length).toFixed(1)}
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Creativity</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}