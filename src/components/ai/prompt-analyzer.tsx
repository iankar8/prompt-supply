'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useAnalyzePrompt, PromptAnalysis } from '@/hooks/use-ai'
import { Brain, CheckCircle, AlertCircle, Lightbulb, TrendingUp } from 'lucide-react'

interface PromptAnalyzerProps {
  initialPrompt?: string
  onImprovedPrompt?: (improvedPrompt: string) => void
}

export function PromptAnalyzer({ initialPrompt = '', onImprovedPrompt }: PromptAnalyzerProps) {
  const [prompt, setPrompt] = useState(initialPrompt)
  const [context, setContext] = useState('')
  const [analysis, setAnalysis] = useState<PromptAnalysis | null>(null)

  const analyzePromptMutation = useAnalyzePrompt()

  const handleAnalyze = () => {
    if (!prompt.trim()) return

    analyzePromptMutation.mutate(
      { prompt: prompt.trim(), context: context.trim() || undefined },
      {
        onSuccess: (result) => {
          setAnalysis(result)
        },
      }
    )
  }

  const handleUseImprovedPrompt = () => {
    if (analysis?.improvedVersion && onImprovedPrompt) {
      onImprovedPrompt(analysis.improvedVersion)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600'
    if (score >= 6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 8) return 'default'
    if (score >= 6) return 'secondary'
    return 'destructive'
  }

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Prompt Analyzer
          </CardTitle>
          <CardDescription>
            Get AI-powered feedback and improvements for your prompts using Claude's expertise.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt to Analyze</Label>
            <Textarea
              id="prompt"
              placeholder="Enter your prompt here..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="context">Context (Optional)</Label>
            <Textarea
              id="context"
              placeholder="Provide additional context about your use case..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={2}
            />
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={!prompt.trim() || analyzePromptMutation.isPending}
            className="w-full"
          >
            {analyzePromptMutation.isPending ? (
              <>
                <LoadingSpinner className="w-4 h-4 mr-2" />
                Analyzing with Claude...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Analyze Prompt
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Analysis Results
              </CardTitle>
              <Badge variant={getScoreBadgeVariant(analysis.score)} className="text-lg px-3 py-1">
                {analysis.score}/10
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="strengths">Strengths</TabsTrigger>
                <TabsTrigger value="improvements">Improvements</TabsTrigger>
                <TabsTrigger value="improved">Improved Version</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Strengths ({analysis.strengths.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1 text-sm">
                        {analysis.strengths.slice(0, 3).map((strength, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="w-1 h-1 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                        Areas for Improvement ({analysis.weaknesses.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1 text-sm">
                        {analysis.weaknesses.slice(0, 3).map((weakness, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="w-1 h-1 bg-yellow-600 rounded-full mt-2 flex-shrink-0" />
                            {weakness}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="strengths" className="space-y-2">
                {analysis.strengths.map((strength, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{strength}</p>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="improvements" className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                    Issues to Address
                  </h4>
                  {analysis.weaknesses.map((weakness, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{weakness}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-blue-600" />
                    Suggestions
                  </h4>
                  {analysis.suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{suggestion}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="improved" className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Improved Prompt</Label>
                    {onImprovedPrompt && (
                      <Button variant="outline" size="sm" onClick={handleUseImprovedPrompt}>
                        Use This Version
                      </Button>
                    )}
                  </div>
                  <Textarea
                    value={analysis.improvedVersion}
                    readOnly
                    rows={6}
                    className="bg-green-50 border-green-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Reasoning</Label>
                  <div className="p-4 bg-gray-50 rounded-lg text-sm">
                    {analysis.reasoning}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}