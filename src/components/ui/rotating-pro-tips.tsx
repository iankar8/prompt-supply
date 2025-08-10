'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Lightbulb, Target, Zap, BookOpen, Users, Layers, RefreshCw, Brain, Building, Shield, Code, Search } from 'lucide-react'

interface ProTip {
  id: string
  title: string
  description: string
  category: 'clarity' | 'examples' | 'structure' | 'context' | 'iteration' | 'advanced' | 'enterprise'
  icon: React.ComponentType<{ className?: string }>
  color: {
    bg: string
    text: string
    icon: string
  }
}

const PRO_TIPS: ProTip[] = [
  {
    id: '1',
    title: 'Be Specific',
    description: 'Include clear context, desired format, and specific requirements rather than vague instructions.',
    category: 'clarity',
    icon: Target,
    color: { bg: 'bg-blue-50', text: 'text-blue-900', icon: 'text-blue-600' }
  },
  {
    id: '2',
    title: 'Use Examples',
    description: 'Provide examples of desired outputs to guide the AI toward your expectations.',
    category: 'examples',
    icon: BookOpen,
    color: { bg: 'bg-green-50', text: 'text-green-900', icon: 'text-green-600' }
  },
  {
    id: '3',
    title: 'Iterate & Test',
    description: 'Use our testing tools to refine prompts based on actual AI responses and feedback.',
    category: 'iteration',
    icon: RefreshCw,
    color: { bg: 'bg-purple-50', text: 'text-purple-900', icon: 'text-purple-600' }
  },
  {
    id: '4',
    title: 'Set Clear Context',
    description: 'Start with background information and role definition to establish the right mindset.',
    category: 'context',
    icon: Users,
    color: { bg: 'bg-amber-50', text: 'text-amber-900', icon: 'text-amber-600' }
  },
  {
    id: '5',
    title: 'Structure Your Request',
    description: 'Break complex tasks into numbered steps or bullet points for better comprehension.',
    category: 'structure',
    icon: Layers,
    color: { bg: 'bg-indigo-50', text: 'text-indigo-900', icon: 'text-indigo-600' }
  },
  {
    id: '6',
    title: 'Define Output Format',
    description: 'Specify exactly how you want the response formatted: list, paragraph, table, etc.',
    category: 'clarity',
    icon: Zap,
    color: { bg: 'bg-rose-50', text: 'text-rose-900', icon: 'text-rose-600' }
  },
  {
    id: '7',
    title: 'Use Constraints Wisely',
    description: 'Set word limits, style guides, or other boundaries to focus the AI\'s response.',
    category: 'advanced',
    icon: Target,
    color: { bg: 'bg-cyan-50', text: 'text-cyan-900', icon: 'text-cyan-600' }
  },
  {
    id: '8',
    title: 'Provide Counter-Examples',
    description: 'Show what you DON\'T want alongside positive examples for clearer guidance.',
    category: 'examples',
    icon: Lightbulb,
    color: { bg: 'bg-orange-50', text: 'text-orange-900', icon: 'text-orange-600' }
  },
  {
    id: '9',
    title: 'Test Edge Cases',
    description: 'Try your prompt with unusual inputs to identify and fix potential weaknesses.',
    category: 'iteration',
    icon: RefreshCw,
    color: { bg: 'bg-teal-50', text: 'text-teal-900', icon: 'text-teal-600' }
  },
  {
    id: '10',
    title: 'Layer Your Instructions',
    description: 'Start with general guidelines, then add specific requirements and examples.',
    category: 'structure',
    icon: Layers,
    color: { bg: 'bg-violet-50', text: 'text-violet-900', icon: 'text-violet-600' }
  },
  // Enterprise-grade techniques
  {
    id: '11',
    title: 'Hyper-Specific Personas',
    description: 'Define comprehensive roles with detailed responsibilities, expertise areas, and operating constraints. Treat AI like a new employee with complete job description.',
    category: 'enterprise',
    icon: Building,
    color: { bg: 'bg-slate-50', text: 'text-slate-900', icon: 'text-slate-600' }
  },
  {
    id: '12',
    title: 'Use XML Output Structure',
    description: 'Implement machine-parseable responses using XML-like tags for AI agent integration and consistent data structure.',
    category: 'enterprise',
    icon: Code,
    color: { bg: 'bg-purple-50', text: 'text-purple-900', icon: 'text-purple-600' }
  },
  {
    id: '13',
    title: 'Add Escape Hatches',
    description: 'Include explicit instructions for handling uncertainty: "If you cannot determine X with high confidence, respond with \'INSUFFICIENT_DATA\'."',
    category: 'enterprise',
    icon: Shield,
    color: { bg: 'bg-amber-50', text: 'text-amber-900', icon: 'text-amber-600' }
  },
  {
    id: '14',
    title: 'Include Debug Traces',
    description: 'Ask for reasoning explanations with <thinking> sections to improve debugging and system refinement.',
    category: 'enterprise',
    icon: Search,
    color: { bg: 'bg-green-50', text: 'text-green-900', icon: 'text-green-600' }
  },
  {
    id: '15',
    title: 'Apply Meta-Prompting',
    description: 'Use AI to improve prompts by providing current performance issues and desired improvements for iterative optimization.',
    category: 'enterprise',
    icon: Brain,
    color: { bg: 'bg-indigo-50', text: 'text-indigo-900', icon: 'text-indigo-600' }
  },
  {
    id: '16',
    title: 'Systematic Framework',
    description: 'Follow the Goal → Format → Verification → Context structure for comprehensive, professional-grade prompts.',
    category: 'enterprise',
    icon: Target,
    color: { bg: 'bg-blue-50', text: 'text-blue-900', icon: 'text-blue-600' }
  }
]

interface RotatingProTipsProps {
  className?: string
  rotationInterval?: number
}

export function RotatingProTips({ className = '', rotationInterval = 8000 }: RotatingProTipsProps) {
  const [currentTipIndex, setCurrentTipIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isHovered) return

    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentTipIndex((prev) => (prev + 1) % PRO_TIPS.length)
        setIsAnimating(false)
      }, 150) // Half the transition duration
    }, rotationInterval)

    return () => clearInterval(interval)
  }, [isHovered, rotationInterval])

  const goToTip = (index: number) => {
    if (index === currentTipIndex) return
    
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentTipIndex(index)
      setIsAnimating(false)
    }, 150)
  }

  const currentTip = PRO_TIPS[currentTipIndex]
  const IconComponent = currentTip.icon

  return (
    <Card 
      className={`mt-8 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Pro Tips for Better Prompts
        </CardTitle>
        <CardDescription>
          Expert advice from Claude to improve your prompt engineering skills
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Main Tip Display */}
          <div 
            className={`relative overflow-hidden transition-all duration-300 ${
              isAnimating ? 'opacity-0 transform translate-y-2' : 'opacity-100 transform translate-y-0'
            }`}
          >
            <div className={`p-6 rounded-xl border-2 border-opacity-20 ${currentTip.color.bg} border-gray-200 relative group hover:shadow-lg transition-all duration-300`}>
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 ${currentTip.color.bg} rounded-xl flex items-center justify-center ring-4 ring-white shadow-md flex-shrink-0`}>
                  <IconComponent className={`w-6 h-6 ${currentTip.color.icon}`} />
                </div>
                <div className="flex-1">
                  <h3 className={`text-xl font-bold mb-3 ${currentTip.color.text}`}>
                    {currentTip.title}
                  </h3>
                  <p className={`text-base leading-relaxed ${currentTip.color.text.replace('900', '700')}`}>
                    {currentTip.description}
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${currentTip.color.bg} ${currentTip.color.text} border border-current border-opacity-20`}>
                      {currentTip.category.charAt(0).toUpperCase() + currentTip.category.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Clean Progress Indicator */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              Tip {currentTipIndex + 1} of {PRO_TIPS.length} • {currentTip.category.charAt(0).toUpperCase() + currentTip.category.slice(1)}
            </div>
            {!isHovered && (
              <div className="text-xs text-gray-400">
                Auto-rotating • Hover to pause
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}