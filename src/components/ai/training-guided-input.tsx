'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Lightbulb, BookOpen, Target, Zap } from 'lucide-react'
import { getRelevantTrainingContent, type TrainingExample } from '@/lib/training-content'

interface TrainingGuidedInputProps {
  purpose: string
  domain: string
  tone?: string
  onSuggestionApply?: (suggestion: string) => void
  className?: string
}

export function TrainingGuidedInput({ 
  purpose, 
  domain, 
  tone, 
  onSuggestionApply,
  className = '' 
}: TrainingGuidedInputProps) {
  const [relevantContent, setRelevantContent] = useState<ReturnType<typeof getRelevantTrainingContent> | null>(null)
  const [selectedExample, setSelectedExample] = useState<TrainingExample | null>(null)

  useEffect(() => {
    if (purpose.trim() && domain.trim()) {
      const content = getRelevantTrainingContent(purpose, domain, tone)
      setRelevantContent(content)
      setSelectedExample(content.principles[0] || null)
    } else {
      setRelevantContent(null)
      setSelectedExample(null)
    }
  }, [purpose, domain, tone])

  if (!relevantContent || relevantContent.principles.length === 0) {
    return null
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Context-Aware Tips */}
      <Card className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 border-blue-200/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lightbulb className="w-5 h-5 text-blue-600" />
            Training-Guided Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Dynamic Tips */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center gap-1">
                <Target className="w-4 h-4" />
                Smart Tips for "{domain}"
              </h4>
              <div className="space-y-2">
                {relevantContent.tips.map((tip, index) => (
                  <div key={index} className="p-3 bg-white/60 rounded-lg border border-blue-200/30">
                    <p className="text-sm text-gray-700">{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Patterns */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center gap-1">
                <Zap className="w-4 h-4" />
                Recommended Patterns
              </h4>
              <div className="space-y-2">
                {relevantContent.patterns.map((pattern, index) => (
                  <div key={index} className="p-3 bg-white/60 rounded-lg border border-purple-200/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm text-purple-900">{pattern.name}</span>
                      <Badge variant="outline" className="text-xs bg-purple-50 border-purple-200">
                        {pattern.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{pattern.description}</p>
                    <p className="text-xs text-gray-600 font-mono bg-gray-50 p-2 rounded border">
                      {pattern.template}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Examples */}
      {relevantContent.principles.length > 0 && (
        <Card className="bg-gradient-to-r from-green-50/50 to-blue-50/50 border-green-200/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="w-5 h-5 text-green-600" />
              Best Practice Examples
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Example Selector */}
              <div className="flex flex-wrap gap-2">
                {relevantContent.principles.map((principle, index) => (
                  <Button
                    key={principle.id}
                    variant={selectedExample?.id === principle.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedExample(principle)}
                    className="text-xs"
                  >
                    {principle.title}
                  </Button>
                ))}
              </div>

              {/* Selected Example Details */}
              {selectedExample && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                      {selectedExample.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {selectedExample.difficulty}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-700">{selectedExample.explanation}</p>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h5 className="font-medium text-green-800 flex items-center gap-1">
                        ✅ Good Example
                      </h5>
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm font-mono text-green-900">{selectedExample.goodExample}</p>
                      </div>
                      {onSuggestionApply && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onSuggestionApply(selectedExample.goodExample)}
                          className="text-green-700 hover:text-green-800 border-green-300 hover:border-green-400"
                        >
                          Use This Example
                        </Button>
                      )}
                    </div>
                    
                    {selectedExample.badExample && (
                      <div className="space-y-2">
                        <h5 className="font-medium text-red-800 flex items-center gap-1">
                          ❌ Avoid This
                        </h5>
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm font-mono text-red-900">{selectedExample.badExample}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1 mt-3">
                    {selectedExample.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs bg-gray-50">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}