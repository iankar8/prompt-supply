'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown, ChevronRight, Building, Zap, Shield, Search, Code, Layers } from 'lucide-react'

interface EnterpriseTechniqueShowcaseProps {
  className?: string
}

interface Technique {
  id: string
  title: string
  description: string
  level: 'Advanced' | 'Expert' | 'Enterprise'
  icon: React.ComponentType<{ className?: string }>
  benefits: string[]
  example: {
    before: string
    after: string
    improvement: string
  }
  color: {
    bg: string
    border: string
    text: string
    icon: string
  }
}

const ENTERPRISE_TECHNIQUES: Technique[] = [
  {
    id: 'hyper-specific',
    title: 'Hyper-Specific Role Assignment',
    description: 'The "Manager Approach" - treat AI like a detailed employee with comprehensive job description',
    level: 'Enterprise',
    icon: Building,
    benefits: [
      'Consistent professional outputs',
      'Reduced ambiguity and errors',
      'Domain-specific expertise activation',
      'Clear decision-making authority'
    ],
    example: {
      before: '"You are a consultant. Help with this business problem."',
      after: '"You are a Senior Management Consultant with 10+ years in digital transformation, specializing in Fortune 500 retail companies. Your expertise includes change management, process optimization, and stakeholder alignment. You operate under strict confidentiality, prioritize data-driven recommendations, and communicate in executive-level language."',
      improvement: 'The hyper-specific approach activates domain expertise and sets clear professional standards, resulting in more authoritative and relevant advice.'
    },
    color: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-900',
      icon: 'text-blue-600'
    }
  },
  {
    id: 'structured-xml',
    title: 'Structured XML Output',
    description: 'Machine-parseable responses using XML-like tags for AI agent integration',
    level: 'Advanced',
    icon: Code,
    benefits: [
      'Perfect for AI agent systems',
      'Consistent data structure',
      'Easy automated processing',
      'Reliable integration pipelines'
    ],
    example: {
      before: '"Analyze this and give me your thoughts."',
      after: '"Analyze this customer feedback and respond in XML format:\n<analysis>\n  <sentiment>POSITIVE/NEGATIVE/NEUTRAL</sentiment>\n  <confidence>0-100%</confidence>\n  <key_issues>\n    <issue priority=\"HIGH/MEDIUM/LOW\">Description</issue>\n  </key_issues>\n  <recommendations>\n    <action>Specific action item</action>\n  </recommendations>\n</analysis>"',
      improvement: 'Structured output enables automated processing and integration with business systems, crucial for production AI agents.'
    },
    color: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-900',
      icon: 'text-purple-600'
    }
  },
  {
    id: 'escape-hatches',
    title: 'Escape Hatches & Reliability',
    description: 'Explicit instructions for handling uncertainty to prevent hallucination',
    level: 'Expert',
    icon: Shield,
    benefits: [
      'Prevents AI hallucination',
      'Increases trustworthiness',
      'Better error handling',
      'Explicit uncertainty handling'
    ],
    example: {
      before: '"Give me investment advice."',
      after: '"Analyze this investment opportunity. If you lack sufficient data (less than 2 years financial history, missing key metrics, or unclear market conditions), respond: \'INSUFFICIENT_DATA: [specify what\'s needed]\'. If confidence is below 70%, state \'LOW_CONFIDENCE\' and explain limitations."',
      improvement: 'Escape hatches prevent unreliable outputs and build trust by making the AI explicitly acknowledge its limitations.'
    },
    color: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-900',
      icon: 'text-amber-600'
    }
  },
  {
    id: 'debug-traces',
    title: 'Debug Traces & Transparency',
    description: 'Include AI reasoning process for debugging and system improvement',
    level: 'Advanced',
    icon: Search,
    benefits: [
      'Transparent decision-making',
      'Easier debugging and refinement',
      'Quality assurance insights',
      'Training data for improvements'
    ],
    example: {
      before: '"Classify this customer email as urgent or normal."',
      after: '"Classify this email priority. Include your reasoning:\n<classification>URGENT/NORMAL</classification>\n<thinking>\n1. Key indicators analyzed: [specific factors]\n2. Decision factors: [what led to classification]\n3. Confidence level: [percentage and why]\n</thinking>\n<recommended_action>What should happen next</recommended_action>"',
      improvement: 'Debug traces provide invaluable insight for system optimization and help identify areas for prompt improvement.'
    },
    color: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-900',
      icon: 'text-green-600'
    }
  },
  {
    id: 'meta-prompting',
    title: 'Meta-Prompting Optimization',
    description: 'Use AI to improve prompts by analyzing performance and suggesting enhancements',
    level: 'Expert',
    icon: Zap,
    benefits: [
      'Continuous improvement cycle',
      'AI leverages self-knowledge',
      'Faster iteration and optimization',
      'Discovery of non-obvious improvements'
    ],
    example: {
      before: '"Make this prompt better: [prompt text]"',
      after: '"You are an expert prompt engineer. Analyze this prompt: [current prompt]. Performance issues observed: [specific problems]. Sample bad outputs: [examples]. Requirements: [improvements needed]. Rewrite the prompt addressing these issues and explain key changes made."',
      improvement: 'Meta-prompting leverages AI\'s self-knowledge to suggest improvements you might not think of, accelerating optimization cycles.'
    },
    color: {
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      text: 'text-indigo-900',
      icon: 'text-indigo-600'
    }
  },
  {
    id: 'prompt-folding',
    title: 'Prompt Folding & Dynamic Generation',
    description: 'Multi-stage systems where prompts generate specialized sub-prompts based on context',
    level: 'Enterprise',
    icon: Layers,
    benefits: [
      'Adaptive workflow systems',
      'Context-aware specialization',
      'Efficient resource utilization',
      'Scalable AI agent architectures'
    ],
    example: {
      before: '"Handle this customer support request."',
      after: '"STAGE 1 - Classify request type: TECHNICAL/BILLING/FEATURE. STAGE 2 - Based on classification, generate specialized prompt: If TECHNICAL, create troubleshooting prompt. If BILLING, create account resolution prompt. If FEATURE, create product feedback prompt. Output the complete specialized prompt ready for execution."',
      improvement: 'Prompt folding creates adaptive systems that automatically generate optimal prompts for specific contexts, crucial for scalable AI agents.'
    },
    color: {
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      text: 'text-rose-900',
      icon: 'text-rose-600'
    }
  }
]

export function EnterpriseTechniquesShowcase({ className = '' }: EnterpriseTechniqueShowcaseProps) {
  const [openTechniques, setOpenTechniques] = useState<Set<string>>(new Set())

  const toggleTechnique = (techniqueId: string) => {
    const newOpenTechniques = new Set(openTechniques)
    if (newOpenTechniques.has(techniqueId)) {
      newOpenTechniques.delete(techniqueId)
    } else {
      newOpenTechniques.add(techniqueId)
    }
    setOpenTechniques(newOpenTechniques)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <Card className="bg-gradient-to-r from-slate-50 via-blue-50 to-purple-50 border-slate-200/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Building className="w-6 h-6 text-slate-600" />
            State-of-the-Art Enterprise Techniques
          </CardTitle>
          <p className="text-gray-600">
            Advanced prompting techniques used by top AI startups for production-grade systems.
            These methods are now integrated into your prompt generation.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {ENTERPRISE_TECHNIQUES.map((technique) => {
              const isOpen = openTechniques.has(technique.id)
              const IconComponent = technique.icon
              
              return (
                <Collapsible key={technique.id} open={isOpen} onOpenChange={() => toggleTechnique(technique.id)}>
                  <CollapsibleTrigger asChild>
                    <Button 
                      variant="outline" 
                      className={`w-full h-auto p-4 ${technique.color.bg} ${technique.color.border} hover:bg-opacity-80 transition-all duration-200`}
                    >
                      <div className="flex flex-col items-start gap-3 w-full">
                        <div className="flex items-center gap-3 w-full">
                          <div className={`w-10 h-10 rounded-lg ${technique.color.bg} border-2 ${technique.color.border} flex items-center justify-center`}>
                            <IconComponent className={`w-5 h-5 ${technique.color.icon}`} />
                          </div>
                          <div className="flex-1 text-left">
                            <h3 className={`font-semibold ${technique.color.text} text-sm`}>{technique.title}</h3>
                            <Badge variant="outline" className={`text-xs mt-1 ${technique.color.text} border-current`}>
                              {technique.level}
                            </Badge>
                          </div>
                          {isOpen ? (
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-500" />
                          )}
                        </div>
                        <p className="text-xs text-gray-600 text-left">
                          {technique.description}
                        </p>
                      </div>
                    </Button>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="mt-4">
                    <div className={`p-4 rounded-lg border ${technique.color.bg} ${technique.color.border} space-y-4`}>
                      {/* Benefits */}
                      <div>
                        <h4 className={`font-medium ${technique.color.text} mb-2 flex items-center gap-1`}>
                          ✨ Key Benefits
                        </h4>
                        <ul className="space-y-1">
                          {technique.benefits.map((benefit, idx) => (
                            <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                              <span className={`w-1.5 h-1.5 rounded-full ${technique.color.icon.replace('text-', 'bg-')} mt-2 flex-shrink-0`} />
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Before/After Example */}
                      <div>
                        <h4 className={`font-medium ${technique.color.text} mb-2 flex items-center gap-1`}>
                          🔄 Before → After
                        </h4>
                        <div className="space-y-3">
                          <div className="p-3 bg-red-50 border border-red-200 rounded text-sm">
                            <strong className="text-red-800">Before:</strong>
                            <p className="mt-1 text-red-700 font-mono">{technique.example.before}</p>
                          </div>
                          <div className="p-3 bg-green-50 border border-green-200 rounded text-sm">
                            <strong className="text-green-800">After:</strong>
                            <p className="mt-1 text-green-700 font-mono whitespace-pre-wrap">{technique.example.after}</p>
                          </div>
                          <div className="p-2 bg-white/60 rounded text-xs text-gray-600">
                            <strong>Why it works:</strong> {technique.example.improvement}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )
            })}
          </div>
          
          {/* Integration Notice */}
          <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200/50">
            <h3 className="font-semibold text-green-900 mb-2">✅ Fully Integrated</h3>
            <p className="text-sm text-green-800 mb-3">
              All these advanced techniques are now built into your prompt generation system. When you create prompts, 
              the AI automatically applies these enterprise-grade methods based on your requirements.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-green-100 text-green-800 border-green-200">Hyper-Specific Personas</Badge>
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">Structured Output</Badge>
              <Badge className="bg-amber-100 text-amber-800 border-amber-200">Escape Hatches</Badge>
              <Badge className="bg-purple-100 text-purple-800 border-purple-200">Debug Traces</Badge>
              <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">Meta-Prompting</Badge>
              <Badge className="bg-rose-100 text-rose-800 border-rose-200">Prompt Folding</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}