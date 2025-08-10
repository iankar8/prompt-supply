'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useGeneratePrompt, PromptGenerationRequest } from '@/hooks/use-ai'
import { TrainingGuidedInput } from './training-guided-input'
import { SystematicFrameworkGuide } from './systematic-framework-guide'
import { Sparkles, Copy, Save, BookOpen } from 'lucide-react'
import { copyToClipboard } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'

interface PromptGeneratorProps {
  onSavePrompt?: (prompt: string, metadata: PromptGenerationRequest) => void
}

export function PromptGenerator({ onSavePrompt }: PromptGeneratorProps) {
  const [formData, setFormData] = useState<PromptGenerationRequest>({
    purpose: '',
    domain: '',
    tone: '',
    length: 'medium',
    audience: '',
    examples: ''
  })
  const [generatedPrompt, setGeneratedPrompt] = useState('')
  const [showFrameworkGuide, setShowFrameworkGuide] = useState(false)

  const generatePromptMutation = useGeneratePrompt()

  const handleInputChange = (field: keyof PromptGenerationRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleGenerate = () => {
    if (!formData.purpose.trim() || !formData.domain.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please provide both purpose and domain.',
        variant: 'destructive'
      })
      return
    }

    generatePromptMutation.mutate(formData, {
      onSuccess: (result) => {
        setGeneratedPrompt(result.prompt)
      }
    })
  }

  const handleCopy = async () => {
    if (await copyToClipboard(generatedPrompt)) {
      toast({
        title: 'Copied!',
        description: 'Prompt copied to clipboard.'
      })
    }
  }

  const handleSave = () => {
    if (onSavePrompt && generatedPrompt) {
      onSavePrompt(generatedPrompt, formData)
      toast({
        title: 'Saved!',
        description: 'Generated prompt has been saved.'
      })
    }
  }

  const handleSuggestionApply = (suggestion: string) => {
    setFormData(prev => ({
      ...prev,
      examples: prev.examples ? `${prev.examples}\n\nTraining example:\n${suggestion}` : `Training example:\n${suggestion}`
    }))
    toast({
      title: 'Suggestion Applied',
      description: 'Training example has been added to your context.',
    })
  }

  return (
    <div className="space-y-6">
      {/* Generation Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                AI Prompt Generator
              </CardTitle>
              <CardDescription>
                Describe what you need and let Claude generate an optimized prompt for you.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFrameworkGuide(!showFrameworkGuide)}
              className="flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              {showFrameworkGuide ? 'Hide' : 'Show'} Framework Guide
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose *</Label>
              <Input
                id="purpose"
                placeholder="e.g., Write marketing copy, Analyze data, Create content"
                value={formData.purpose}
                onChange={(e) => handleInputChange('purpose', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="domain">Domain *</Label>
              <Input
                id="domain"
                placeholder="e.g., Marketing, Education, Software, Healthcare"
                value={formData.domain}
                onChange={(e) => handleInputChange('domain', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Input
                id="tone"
                placeholder="e.g., Professional, Casual, Creative, Technical"
                value={formData.tone}
                onChange={(e) => handleInputChange('tone', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="length">Length</Label>
              <Select
                value={formData.length}
                onValueChange={(value) => handleInputChange('length', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short & Concise</SelectItem>
                  <SelectItem value="medium">Medium Length</SelectItem>
                  <SelectItem value="long">Detailed & Comprehensive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="audience">Target Audience</Label>
              <Input
                id="audience"
                placeholder="e.g., Software developers, Marketing managers, Students"
                value={formData.audience}
                onChange={(e) => handleInputChange('audience', e.target.value)}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="examples">Examples or Additional Context</Label>
              <Textarea
                id="examples"
                placeholder="Provide any examples, specific requirements, or additional context..."
                value={formData.examples}
                onChange={(e) => handleInputChange('examples', e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!formData.purpose.trim() || !formData.domain.trim() || generatePromptMutation.isPending}
            className="w-full"
          >
            {generatePromptMutation.isPending ? (
              <>
                <LoadingSpinner className="w-4 h-4 mr-2" />
                Generating with Claude...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Prompt
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Systematic Framework Guide */}
      {showFrameworkGuide && (
        <SystematicFrameworkGuide />
      )}

      {/* Training-Guided Suggestions */}
      <TrainingGuidedInput
        purpose={formData.purpose}
        domain={formData.domain}
        tone={formData.tone}
        onSuggestionApply={handleSuggestionApply}
      />

      {/* Generated Prompt */}
      {generatedPrompt && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Generated Prompt</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                {onSavePrompt && (
                  <Button variant="outline" size="sm" onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                value={generatedPrompt}
                readOnly
                rows={8}
                className="bg-blue-50 border-blue-200 font-mono text-sm"
              />
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Generation Parameters</h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <div><strong>Purpose:</strong> {formData.purpose}</div>
                  <div><strong>Domain:</strong> {formData.domain}</div>
                  {formData.tone && <div><strong>Tone:</strong> {formData.tone}</div>}
                  {formData.audience && <div><strong>Audience:</strong> {formData.audience}</div>}
                  <div><strong>Length:</strong> {formData.length}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}