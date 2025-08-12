'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { 
  troubleshootingService, 
  type ErrorAnalysis, 
  type TroubleshootingSolution,
  type TroubleshootingStep 
} from '@/lib/mcp/troubleshooting'
import {
  AlertTriangle,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  ExternalLink,
  Copy,
  RefreshCw,
  Zap,
  HelpCircle
} from 'lucide-react'

interface TroubleshootingPanelProps {
  error: Error | string
  context?: {
    step?: string
    serverInfo?: any
    provider?: string
  }
  onRetry?: () => void
  onUseCloudBridge?: () => void
}

export function TroubleshootingPanel({ error, context, onRetry, onUseCloudBridge }: TroubleshootingPanelProps) {
  const [expandedSolutions, setExpandedSolutions] = useState<Set<number>>(new Set([0])) // First solution expanded by default
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())

  const analysis = troubleshootingService.analyzeError(error, context)

  const toggleSolution = (index: number) => {
    const newExpanded = new Set(expandedSolutions)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedSolutions(newExpanded)
  }

  const toggleStepCompleted = (stepId: string) => {
    const newCompleted = new Set(completedSteps)
    if (newCompleted.has(stepId)) {
      newCompleted.delete(stepId)
    } else {
      newCompleted.add(stepId)
    }
    setCompletedSteps(newCompleted)
  }

  const handleStepAction = (step: TroubleshootingStep, stepId: string) => {
    switch (step.action) {
      case 'button':
        if (step.actionLabel?.includes('Retry') && onRetry) {
          onRetry()
        } else if (step.actionLabel?.includes('Cloud') && onUseCloudBridge) {
          onUseCloudBridge()
        } else if (step.actionLabel?.includes('Refresh')) {
          window.location.reload()
        }
        break
      case 'link':
        if (step.actionData) {
          window.open(step.actionData, '_blank')
        }
        break
      case 'copy':
        if (step.actionData) {
          navigator.clipboard.writeText(step.actionData)
        }
        break
      case 'check':
        toggleStepCompleted(stepId)
        break
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      default: return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-200 bg-red-50'
      case 'warning': return 'border-yellow-200 bg-yellow-50'
      default: return 'border-blue-200 bg-blue-50'
    }
  }

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      default: return 'bg-blue-100 text-blue-800 border-blue-300'
    }
  }

  return (
    <div className="space-y-4">
      {/* Error Summary */}
      <Card className={`border-2 ${getSeverityColor(analysis.severity)}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getSeverityIcon(analysis.severity)}
            {analysis.message}
          </CardTitle>
          <CardDescription>
            We've analyzed the error and found {analysis.solutions.length} possible solution{analysis.solutions.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        {analysis.possibleCauses.length > 0 && (
          <CardContent>
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-700">Possible causes:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {analysis.possibleCauses.map((cause, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-gray-400">•</span>
                    {cause}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Quick Fix */}
      {analysis.quickFix && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-800">Quick Fix</span>
              </div>
              <Button
                size="sm"
                onClick={() => handleStepAction(analysis.quickFix!, 'quickfix')}
                className="bg-green-600 hover:bg-green-700"
              >
                {analysis.quickFix.actionLabel || 'Try Fix'}
              </Button>
            </div>
            <p className="text-sm text-green-700 mt-2">{analysis.quickFix.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Solutions */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <HelpCircle className="w-4 h-4" />
          Troubleshooting Solutions
        </h3>

        {analysis.solutions.map((solution, solutionIndex) => {
          const isExpanded = expandedSolutions.has(solutionIndex)
          
          return (
            <Card key={solutionIndex} className="border border-gray-200">
              <Collapsible open={isExpanded} onOpenChange={() => toggleSolution(solutionIndex)}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        )}
                        <div>
                          <CardTitle className="text-base">{solution.title}</CardTitle>
                          <CardDescription className="text-sm">{solution.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityBadgeColor(solution.priority)}>
                          {solution.priority} priority
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {solution.category}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {solution.steps.map((step, stepIndex) => {
                        const stepId = `${solutionIndex}-${stepIndex}`
                        const isCompleted = completedSteps.has(stepId)
                        
                        return (
                          <div
                            key={stepIndex}
                            className={`flex items-start gap-3 p-3 rounded-lg border ${
                              isCompleted ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="flex-shrink-0 mt-0.5">
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                isCompleted 
                                  ? 'bg-green-100 border-green-300' 
                                  : 'bg-white border-gray-300'
                              }`}>
                                {isCompleted ? (
                                  <CheckCircle className="w-3 h-3 text-green-600" />
                                ) : (
                                  <span className="text-xs text-gray-500">{stepIndex + 1}</span>
                                )}
                              </div>
                            </div>

                            <div className="flex-1">
                              <h5 className="font-medium text-sm text-gray-900">{step.title}</h5>
                              <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                            </div>

                            {step.action && (
                              <div className="flex-shrink-0">
                                <Button
                                  size="sm"
                                  variant={isCompleted ? "outline" : "default"}
                                  onClick={() => handleStepAction(step, stepId)}
                                  className="text-xs"
                                >
                                  {step.action === 'button' && <RefreshCw className="w-3 h-3 mr-1" />}
                                  {step.action === 'link' && <ExternalLink className="w-3 h-3 mr-1" />}
                                  {step.action === 'copy' && <Copy className="w-3 h-3 mr-1" />}
                                  {step.action === 'check' && <CheckCircle className="w-3 h-3 mr-1" />}
                                  {step.actionLabel || 
                                    (step.action === 'check' ? (isCompleted ? 'Done' : 'Mark Done') :
                                     step.action === 'link' ? 'Open' :
                                     step.action === 'copy' ? 'Copy' :
                                     'Action')
                                  }
                                </Button>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          )
        })}
      </div>

      {/* Actions */}
      {(onRetry || onUseCloudBridge) && (
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Still having trouble?</h4>
                <p className="text-sm text-gray-600">Try these alternative approaches</p>
              </div>
              <div className="flex gap-2">
                {onUseCloudBridge && (
                  <Button 
                    variant="outline" 
                    onClick={onUseCloudBridge}
                    className="text-purple-600 border-purple-300 hover:bg-purple-50"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Use Cloud Bridge
                  </Button>
                )}
                {onRetry && (
                  <Button onClick={onRetry}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}