'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown, ChevronRight, Target, List, Shield, User, Lightbulb, BookOpen } from 'lucide-react'

interface SystematicFrameworkGuideProps {
  className?: string
}

interface FrameworkStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  template: string
  examples: string[]
  tips: string[]
  color: {
    bg: string
    border: string
    text: string
    icon: string
  }
}

const FRAMEWORK_STEPS: FrameworkStep[] = [
  {
    id: 'goal',
    title: '1. Goal Definition',
    description: 'Clearly state your objective with scope and criteria',
    icon: Target,
    template: 'I want a list/plan/analysis of [type of thing] within [scope] that meets [criteria].',
    examples: [
      'I want a list of innovative productivity apps launched in 2024 that have fewer than 10,000 users but high ratings.',
      'I want a plan for learning web development within 6 months that focuses on React and includes portfolio projects.',
      'I want an analysis of sustainable packaging solutions for food delivery that reduce costs by at least 15%.'
    ],
    tips: [
      'Be specific about what you want (list, plan, analysis, comparison)',
      'Include clear scope limitations (time, location, category)',
      'Define quality criteria upfront (ratings, size, novelty)',
      'Keep it to one clear, actionable sentence'
    ],
    color: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-900',
      icon: 'text-blue-600'
    }
  },
  {
    id: 'format',
    title: '2. Return Format',
    description: 'Specify exactly what fields and structure you want',
    icon: List,
    template: `For each [item], return:
1. [Field #1]
2. [Field #2]  
3. [Field #3]`,
    examples: [
      `For each app, return:
1. App name and platform
2. Core unique feature
3. Current user rating (with source)
4. Launch date
5. Why it's innovative`,
      `For each learning milestone, return:
1. Week number and topic focus
2. Specific skills to master
3. Practice project to complete
4. Resources and tutorials needed
5. Success criteria for assessment`,
    ],
    tips: [
      'Use numbered lists for clarity and consistency',
      'Be explicit about data sources (with ratings, with links)',
      'Specify formatting (JSON, table, bullets)',
      'Include ordering preferences (ranked, chronological)'
    ],
    color: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-900',
      icon: 'text-green-600'
    }
  },
  {
    id: 'verification',
    title: '3. Accuracy Warnings',
    description: 'Add verification requirements to prevent errors',
    icon: Shield,
    template: 'Be careful to ensure that [key accuracy requirement], that it actually exists/is correct, and that [secondary requirement].',
    examples: [
      'Be careful to ensure that the apps actually exist, were launched in 2024, and verify user counts are accurate from app store data.',
      'Be careful to ensure that the learning resources are currently available, that time estimates are realistic, and verify that projects can be completed with the suggested tools.',
      'Be careful to ensure that the packaging solutions are commercially available, cost data is from recent sources, and verify environmental impact claims.'
    ],
    tips: [
      'Address common AI hallucination risks in your domain',
      'Specify data freshness requirements',
      'Request source verification for claims',
      'Warn against outdated or duplicate information'
    ],
    color: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-900',
      icon: 'text-amber-600'
    }
  },
  {
    id: 'context',
    title: '4. Context Dump',
    description: 'Provide personal background for tailored results',
    icon: User,
    template: 'For context: [personal or situational background relevant to the goal].',
    examples: [
      'For context: I\'m a productivity blogger looking for hidden gems to feature. I avoid mainstream apps and prefer tools that solve specific workflow problems.',
      'For context: I\'m currently working full-time in marketing but want to transition to web development. I learn best with hands-on projects and have evenings/weekends available.',
      'For context: I run a small food delivery startup and need to reduce packaging costs while appealing to environmentally conscious customers in urban markets.'
    ],
    tips: [
      'Share relevant experience level and constraints',
      'Mention preferences and things to avoid',
      'Include situational context that affects recommendations',
      'Keep it focused on factors that impact the response'
    ],
    color: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-900',
      icon: 'text-purple-600'
    }
  }
]

export function SystematicFrameworkGuide({ className = '' }: SystematicFrameworkGuideProps) {
  const [openSteps, setOpenSteps] = useState<Set<string>>(new Set(['goal']))
  const [showFullExample, setShowFullExample] = useState(false)

  const toggleStep = (stepId: string) => {
    const newOpenSteps = new Set(openSteps)
    if (newOpenSteps.has(stepId)) {
      newOpenSteps.delete(stepId)
    } else {
      newOpenSteps.add(stepId)
    }
    setOpenSteps(newOpenSteps)
  }

  const fullExamplePrompt = `Goal: I want a list of innovative productivity apps launched in 2024 that have fewer than 10,000 users but high ratings.

For each app, return:
1. App name and platform
2. Core unique feature  
3. Current user rating (with source)
4. Launch date
5. Why it's innovative

Be careful to ensure that the apps actually exist, were launched in 2024, and verify user counts are accurate from app store data.

For context: I'm a productivity blogger looking for hidden gems to feature. I avoid mainstream apps and prefer tools that solve specific workflow problems.`

  return (
    <div className={`space-y-6 ${className}`}>
      <Card className="bg-gradient-to-r from-indigo-50/50 to-purple-50/50 border-indigo-200/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            Systematic Prompt Framework
          </CardTitle>
          <p className="text-gray-600">
            Follow this proven 4-step structure to create comprehensive, accurate prompts that get better results.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {FRAMEWORK_STEPS.map((step, index) => {
              const isOpen = openSteps.has(step.id)
              const IconComponent = step.icon
              
              return (
                <Collapsible key={step.id} open={isOpen} onOpenChange={() => toggleStep(step.id)}>
                  <CollapsibleTrigger asChild>
                    <Button 
                      variant="outline" 
                      className={`w-full justify-between h-auto p-4 ${step.color.bg} ${step.color.border} hover:bg-opacity-80 transition-all duration-200`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${step.color.bg} border-2 ${step.color.border} flex items-center justify-center`}>
                          <IconComponent className={`w-5 h-5 ${step.color.icon}`} />
                        </div>
                        <div className="text-left">
                          <h3 className={`font-semibold ${step.color.text}`}>{step.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                        </div>
                      </div>
                      {isOpen ? (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="mt-4">
                    <div className={`p-4 rounded-lg border ${step.color.bg} ${step.color.border} space-y-4`}>
                      {/* Template */}
                      <div>
                        <h4 className={`font-medium ${step.color.text} mb-2 flex items-center gap-1`}>
                          📝 Template
                        </h4>
                        <div className="p-3 bg-white/60 rounded border font-mono text-sm">
                          {step.template}
                        </div>
                      </div>
                      
                      {/* Examples */}
                      <div>
                        <h4 className={`font-medium ${step.color.text} mb-2 flex items-center gap-1`}>
                          ✨ Examples
                        </h4>
                        <div className="space-y-2">
                          {step.examples.map((example, idx) => (
                            <div key={idx} className="p-3 bg-white/60 rounded border text-sm">
                              {example}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Tips */}
                      <div>
                        <h4 className={`font-medium ${step.color.text} mb-2 flex items-center gap-1`}>
                          💡 Pro Tips
                        </h4>
                        <ul className="space-y-1">
                          {step.tips.map((tip, idx) => (
                            <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                              <span className={`w-1.5 h-1.5 rounded-full ${step.color.icon.replace('text-', 'bg-')} mt-2 flex-shrink-0`} />
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )
            })}
          </div>
          
          {/* Complete Example */}
          <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                Complete Example
              </h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowFullExample(!showFullExample)}
              >
                {showFullExample ? 'Hide' : 'Show'} Full Prompt
              </Button>
            </div>
            
            {showFullExample && (
              <div className="p-4 bg-white rounded border font-mono text-sm whitespace-pre-line">
                {fullExamplePrompt}
              </div>
            )}
            
            <p className="text-sm text-gray-600 mt-2">
              This example combines all four framework elements into a comprehensive prompt that produces consistent, accurate results.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}