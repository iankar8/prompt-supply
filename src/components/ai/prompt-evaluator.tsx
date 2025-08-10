'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { 
  BarChart, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Eye, 
  Zap,
  Target,
  Search,
  Brain
} from 'lucide-react'

interface PromptEvaluatorProps {
  prompt?: string
  className?: string
}

interface EvaluationScore {
  dimension: string
  score: number
  maxScore: number
  feedback: string
  suggestions: string[]
  icon: React.ComponentType<{ className?: string }>
  color: string
}

interface DebugTrace {
  step: string
  analysis: string
  recommendation: string
  severity: 'info' | 'warning' | 'error'
}

export function PromptEvaluator({ prompt = '', className = '' }: PromptEvaluatorProps) {
  const [currentPrompt, setCurrentPrompt] = useState(prompt)
  const [evaluation, setEvaluation] = useState<EvaluationScore[] | null>(null)
  const [debugTraces, setDebugTraces] = useState<DebugTrace[]>([])
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [overallScore, setOverallScore] = useState(0)

  // Mock evaluation function - in production, this would call Claude API
  const evaluatePrompt = async (promptText: string) => {
    if (!promptText.trim()) return

    setIsEvaluating(true)
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Mock evaluation results based on prompt analysis
    const mockEvaluation: EvaluationScore[] = [
      {
        dimension: 'Clarity & Specificity',
        score: analyzeClarity(promptText),
        maxScore: 100,
        feedback: 'Prompt contains specific instructions and clear expectations',
        suggestions: promptText.length < 100 ? ['Add more specific details', 'Include examples'] : ['Good specificity level'],
        icon: Eye,
        color: 'text-blue-600'
      },
      {
        dimension: 'Structure & Organization',
        score: analyzeStructure(promptText),
        maxScore: 100,
        feedback: 'Prompt follows logical structure with clear sections',
        suggestions: !promptText.includes('Format:') ? ['Add output format specification', 'Use numbered sections'] : ['Well-structured format'],
        icon: Target,
        color: 'text-green-600'
      },
      {
        dimension: 'Context & Role Definition',
        score: analyzeContext(promptText),
        maxScore: 100,
        feedback: 'Role and context are well-defined',
        suggestions: !promptText.toLowerCase().includes('you are') ? ['Add role definition', 'Provide more context'] : ['Good context provided'],
        icon: Brain,
        color: 'text-purple-600'
      },
      {
        dimension: 'Reliability & Safety',
        score: analyzeSafety(promptText),
        maxScore: 100,
        feedback: 'Prompt includes safety mechanisms and error handling',
        suggestions: !promptText.toLowerCase().includes('don\'t know') ? ['Add uncertainty handling', 'Include escape hatches'] : ['Good safety measures'],
        icon: CheckCircle2,
        color: 'text-amber-600'
      },
      {
        dimension: 'Enterprise Readiness',
        score: analyzeEnterpriseReadiness(promptText),
        maxScore: 100,
        feedback: 'Prompt suitable for production environments',
        suggestions: promptText.length < 200 ? ['Add more comprehensive instructions', 'Include debug traces'] : ['Production-ready'],
        icon: Zap,
        color: 'text-indigo-600'
      }
    ]

    // Generate debug traces
    const mockTraces: DebugTrace[] = [
      {
        step: 'Initial Analysis',
        analysis: `Prompt length: ${promptText.length} characters. Complexity level: ${promptText.length > 500 ? 'High' : promptText.length > 200 ? 'Medium' : 'Low'}`,
        recommendation: promptText.length < 100 ? 'Consider adding more detail for better results' : 'Good length for comprehensive instructions',
        severity: promptText.length < 100 ? 'warning' : 'info'
      },
      {
        step: 'Role Definition Check',
        analysis: `Role specification: ${promptText.toLowerCase().includes('you are') ? 'Present' : 'Missing'}`,
        recommendation: !promptText.toLowerCase().includes('you are') ? 'Add explicit role definition for better context' : 'Role clearly defined',
        severity: !promptText.toLowerCase().includes('you are') ? 'error' : 'info'
      },
      {
        step: 'Output Format Analysis',
        analysis: `Format specification: ${promptText.toLowerCase().includes('format') || promptText.includes(':') ? 'Present' : 'Missing'}`,
        recommendation: !promptText.toLowerCase().includes('format') ? 'Specify expected output format for consistency' : 'Output format well-defined',
        severity: !promptText.toLowerCase().includes('format') ? 'warning' : 'info'
      },
      {
        step: 'Safety Mechanisms',
        analysis: `Error handling: ${promptText.toLowerCase().includes('don\'t know') || promptText.toLowerCase().includes('uncertain') ? 'Present' : 'Missing'}`,
        recommendation: !promptText.toLowerCase().includes('don\'t know') ? 'Add escape hatches for uncertain situations' : 'Good error handling included',
        severity: !promptText.toLowerCase().includes('don\'t know') ? 'warning' : 'info'
      }
    ]

    setEvaluation(mockEvaluation)
    setDebugTraces(mockTraces)
    
    // Calculate overall score
    const avgScore = mockEvaluation.reduce((sum, item) => sum + item.score, 0) / mockEvaluation.length
    setOverallScore(Math.round(avgScore))
    
    setIsEvaluating(false)
  }

  // Simple analysis functions (in production, these would be more sophisticated)
  const analyzeClarity = (text: string): number => {
    let score = 50
    if (text.includes('specific')) score += 15
    if (text.includes('example')) score += 15
    if (text.length > 100) score += 10
    if (text.includes('?')) score += 10
    return Math.min(score, 100)
  }

  const analyzeStructure = (text: string): number => {
    let score = 60
    if (text.includes('Format:') || text.includes('format')) score += 20
    if (text.match(/\d+\./)) score += 10
    if (text.includes('\n')) score += 10
    return Math.min(score, 100)
  }

  const analyzeContext = (text: string): number => {
    let score = 40
    if (text.toLowerCase().includes('you are')) score += 25
    if (text.toLowerCase().includes('context')) score += 15
    if (text.toLowerCase().includes('audience')) score += 10
    if (text.length > 150) score += 10
    return Math.min(score, 100)
  }

  const analyzeSafety = (text: string): number => {
    let score = 70
    if (text.toLowerCase().includes('don\'t know') || text.toLowerCase().includes('uncertain')) score += 15
    if (text.toLowerCase().includes('careful') || text.toLowerCase().includes('ensure')) score += 10
    if (text.toLowerCase().includes('verify')) score += 5
    return Math.min(score, 100)
  }

  const analyzeEnterpriseReadiness = (text: string): number => {
    let score = 50
    if (text.length > 200) score += 20
    if (text.toLowerCase().includes('professional') || text.toLowerCase().includes('business')) score += 10
    if (text.includes('XML') || text.includes('<')) score += 10
    if (text.toLowerCase().includes('debug') || text.toLowerCase().includes('trace')) score += 10
    return Math.min(score, 100)
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600'
    if (score >= 70) return 'text-blue-600'
    if (score >= 55) return 'text-amber-600'
    return 'text-red-600'
  }

  const getScoreGradient = (score: number) => {
    if (score >= 85) return 'from-green-500 to-emerald-600'
    if (score >= 70) return 'from-blue-500 to-indigo-600'
    if (score >= 55) return 'from-amber-500 to-orange-600'
    return 'from-red-500 to-rose-600'
  }

  useEffect(() => {
    setCurrentPrompt(prompt)
  }, [prompt])

  return (
    <div className={`space-y-6 ${className}`}>
      <Card className="bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 border-slate-200/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="w-5 h-5 text-slate-600" />
            Prompt Evaluator & Debugging
          </CardTitle>
          <p className="text-gray-600">
            Analyze your prompts for quality, reliability, and enterprise readiness with detailed debugging insights.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Prompt to Evaluate</label>
            <Textarea
              value={currentPrompt}
              onChange={(e) => setCurrentPrompt(e.target.value)}
              placeholder="Paste your prompt here for comprehensive evaluation..."
              rows={6}
              className="bg-white/70 backdrop-blur-sm border-slate-200"
            />
          </div>

          <Button
            onClick={() => evaluatePrompt(currentPrompt)}
            disabled={!currentPrompt.trim() || isEvaluating}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
          >
            {isEvaluating ? (
              <>
                <LoadingSpinner className="w-4 h-4 mr-2" />
                Analyzing Prompt...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Evaluate Prompt
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {evaluation && (
        <Tabs defaultValue="scores" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="scores" className="flex items-center gap-2">
              <BarChart className="w-4 h-4" />
              Scores
            </TabsTrigger>
            <TabsTrigger value="debug" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Debug Traces
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scores" className="space-y-6">
            {/* Overall Score */}
            <Card className={`bg-gradient-to-r ${getScoreGradient(overallScore)} text-white`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">Overall Score</h3>
                    <p className="text-white/80">Comprehensive prompt quality assessment</p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold">{overallScore}</div>
                    <div className="text-white/80">/ 100</div>
                  </div>
                </div>
                <div className="mt-4">
                  <Progress value={overallScore} className="bg-white/20" />
                </div>
              </CardContent>
            </Card>

            {/* Detailed Scores */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {evaluation.map((score, index) => {
                const IconComponent = score.icon
                return (
                  <Card key={index} className="bg-white/70 backdrop-blur-sm border-slate-200/50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-slate-100 to-slate-200 rounded-lg flex items-center justify-center">
                            <IconComponent className={`w-4 h-4 ${score.color}`} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm">{score.dimension}</h4>
                            <div className={`text-2xl font-bold ${getScoreColor(score.score)}`}>
                              {score.score}
                              <span className="text-sm font-normal text-gray-500">/{score.maxScore}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <Progress value={score.score} className="mb-3" />
                      
                      <p className="text-xs text-gray-600 mb-2">{score.feedback}</p>
                      
                      <div className="space-y-1">
                        {score.suggestions.map((suggestion, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {suggestion}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="debug" className="space-y-4">
            <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Search className="w-5 h-5" />
                  Debug Traces & Analysis
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Step-by-step analysis of your prompt with recommendations for improvement.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {debugTraces.map((trace, index) => (
                  <Alert key={index} className={`${
                    trace.severity === 'error' ? 'border-red-200 bg-red-50' :
                    trace.severity === 'warning' ? 'border-amber-200 bg-amber-50' :
                    'border-blue-200 bg-blue-50'
                  }`}>
                    <div className="flex items-start gap-3">
                      {trace.severity === 'error' ? (
                        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                      ) : trace.severity === 'warning' ? (
                        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm mb-1">{trace.step}</h4>
                        <p className="text-sm text-gray-700 mb-2">{trace.analysis}</p>
                        <AlertDescription className="text-xs text-gray-600">
                          <strong>Recommendation:</strong> {trace.recommendation}
                        </AlertDescription>
                      </div>
                    </div>
                  </Alert>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {evaluation.filter(e => e.score >= 70).map((strength, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">{strength.dimension}: {strength.feedback}</span>
                    </div>
                  ))}
                  {evaluation.filter(e => e.score >= 70).length === 0 && (
                    <p className="text-sm text-gray-500">Consider improving overall prompt quality for better strengths.</p>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    Areas for Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {evaluation.filter(e => e.score < 70).map((improvement, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        <span className="text-sm font-medium">{improvement.dimension}</span>
                      </div>
                      <div className="pl-4">
                        {improvement.suggestions.map((suggestion, idx) => (
                          <div key={idx} className="text-xs text-gray-600">• {suggestion}</div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {evaluation.filter(e => e.score < 70).length === 0 && (
                    <p className="text-sm text-gray-500">Excellent! No major areas for improvement identified.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Performance Recommendations */}
            <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-indigo-600" />
                  Performance Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {overallScore < 60 && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <AlertDescription>
                        <strong>Critical:</strong> This prompt needs significant improvement before production use. Focus on adding role definition, output format, and safety mechanisms.
                      </AlertDescription>
                    </Alert>
                  )}
                  {overallScore >= 60 && overallScore < 80 && (
                    <Alert className="border-amber-200 bg-amber-50">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <AlertDescription>
                        <strong>Good:</strong> This prompt is functional but could benefit from additional refinement for optimal performance.
                      </AlertDescription>
                    </Alert>
                  )}
                  {overallScore >= 80 && (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription>
                        <strong>Excellent:</strong> This prompt meets enterprise-grade standards and is ready for production deployment.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}