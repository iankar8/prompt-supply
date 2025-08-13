'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Bot,
  Sparkles, 
  Brain,
  TestTube,
  BarChart,
  Save,
  Link2,
  Zap,
  ArrowRight,
  CheckCircle,
  AtSign,
  Wand2,
  Target,
  MessageCircle,
  Users,
  Coffee
} from 'lucide-react'

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  demo?: string
  color: string
  tips?: string[]
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to AI Studio!',
    description: 'Your personal prompt engineering workspace powered by Claude',
    icon: Bot,
    color: 'text-purple-600',
    tips: [
      'Chat naturally with Claude about prompts',
      'Use @commands for quick actions',
      'Connect external tools via integrations'
    ]
  },
  {
    id: 'commands',
    title: 'Supercharged @Commands',
    description: 'Type @ to see magical shortcuts that make prompt engineering effortless',
    icon: AtSign,
    demo: '@generate',
    color: 'text-blue-600',
    tips: [
      '@generate - Create prompts with guided steps',
      '@analyze - Get detailed improvements',
      '@test - Validate prompt performance'
    ]
  },
  {
    id: 'generate',
    title: 'Generate Perfect Prompts',
    description: 'Let Claude create tailored prompts for your specific needs',
    icon: Sparkles,
    demo: '@generate marketing copy for tech startups',
    color: 'text-green-600',
    tips: [
      'Specify purpose, domain, and tone',
      'Get optimized prompts instantly',
      'Apply directly to your workspace'
    ]
  },
  {
    id: 'analyze',
    title: 'Intelligent Analysis',
    description: 'Get expert feedback and improvements for any prompt',
    icon: Brain,
    demo: '@analyze [your prompt]',
    color: 'text-purple-600',
    tips: [
      'Detailed scoring and feedback',
      'Specific improvement suggestions', 
      'One-click apply improvements'
    ]
  },
  {
    id: 'context',
    title: 'Real-time Context',
    description: 'Pull live data from GitHub, Notion, Linear and more with @context',
    icon: Link2,
    demo: '@context recent issues',
    color: 'text-cyan-600',
    tips: [
      'Connect external tools in Integrations',
      'Pull real-time data into prompts',
      'Keep prompts updated automatically'
    ]
  },
  {
    id: 'ready',
    title: 'You\'re All Set!',
    description: 'Start chatting or try a command to experience the magic',
    icon: Target,
    color: 'text-emerald-600',
    tips: [
      'Try: "Help me write a prompt for..."',
      'Or use @generate to get started',
      'Explore integrations for advanced features'
    ]
  }
]

interface ChatOnboardingProps {
  onComplete: () => void
  onSkip: () => void
  currentPrompt?: string
}

export function ChatOnboarding({ onComplete, onSkip, currentPrompt }: ChatOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [animationPhase, setAnimationPhase] = useState<'enter' | 'stable' | 'exit'>('enter')

  const step = ONBOARDING_STEPS[currentStep]
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100

  // Auto-advance animation phases
  useEffect(() => {
    if (animationPhase === 'enter') {
      const timer = setTimeout(() => setAnimationPhase('stable'), 300)
      return () => clearTimeout(timer)
    }
  }, [animationPhase])

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setAnimationPhase('exit')
      setTimeout(() => {
        setCurrentStep(prev => prev + 1)
        setAnimationPhase('enter')
      }, 200)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setAnimationPhase('exit')
      setTimeout(() => {
        setCurrentStep(prev => prev - 1)
        setAnimationPhase('enter')
      }, 200)
    }
  }

  const handleComplete = () => {
    setAnimationPhase('exit')
    setTimeout(() => {
      setIsVisible(false)
      onComplete()
    }, 300)
  }

  const handleSkip = () => {
    setAnimationPhase('exit')
    setTimeout(() => {
      setIsVisible(false)
      onSkip()
    }, 300)
  }

  const handleDemoClick = (demo: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(demo).then(() => {
        // Simple feedback - could be enhanced with toast
        console.log('Copied to clipboard:', demo)
      }).catch(() => {
        console.log('Failed to copy to clipboard')
      })
    }
  }

  if (!isVisible) return null

  return (
    <div className={`
      transition-all duration-300 ease-out max-h-[500px] overflow-y-auto
      ${animationPhase === 'enter' ? 'animate-fade-in-up' : ''}
      ${animationPhase === 'exit' ? 'opacity-0 transform translate-y-4' : ''}
    `}>
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 shadow-lg">
        <CardContent className="p-6">
          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Getting Started ({currentStep + 1}/{ONBOARDING_STEPS.length})
              </span>
              <Button variant="ghost" size="sm" onClick={handleSkip} className="text-gray-500 hover:text-gray-700">
                Skip tour
              </Button>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Main content */}
          <div className={`
            transition-all duration-200 ease-out
            ${animationPhase === 'enter' ? 'animate-slide-in-right' : ''}
            ${animationPhase === 'exit' ? 'animate-slide-in-left opacity-0' : ''}
          `}>
            {/* Header */}
            <div className="text-center mb-6">
              <div className={`
                w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center
                bg-gradient-to-br from-purple-100 to-blue-100 border-2 border-white shadow-md
                transition-transform duration-300 ease-out animate-float
                ${animationPhase === 'stable' ? 'scale-100' : 'scale-95'}
              `}>
                <step.icon className={`w-8 h-8 ${step.color}`} />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {step.title}
              </h3>
              
              <p className="text-gray-600 max-w-md mx-auto">
                {step.description}
              </p>
            </div>

            {/* Demo/Example */}
            {step.demo && (
              <div className="mb-6">
                <div 
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover-lift cursor-pointer transition-all duration-200"
                  onClick={() => handleDemoClick(step.demo!)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <MessageCircle className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Try this:</span>
                  </div>
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-3 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200">
                    <code className="text-sm font-mono">{step.demo}</code>
                  </div>
                  <div className="text-xs text-gray-500 mt-2 text-center">
                    Click to copy to clipboard ↗
                  </div>
                </div>
              </div>
            )}

            {/* Tips */}
            {step.tips && (
              <div className="mb-6">
                <div className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-medium text-gray-700">Quick Tips:</span>
                  </div>
                  <div className="space-y-2">
                    {step.tips.map((tip, index) => (
                      <div 
                        key={index} 
                        className={`
                          flex items-start gap-2 text-sm text-gray-600
                          transition-all duration-300 ease-out
                          ${animationPhase === 'stable' ? 'animate-slide-in-left' : ''}
                        `}
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Special welcome step */}
            {currentStep === 0 && (
              <div className="text-center mb-6">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-white/50">
                    <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <div className="text-xs font-medium text-gray-700">For Product Teams</div>
                  </div>
                  <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-white/50">
                    <Wand2 className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <div className="text-xs font-medium text-gray-700">AI-Powered</div>
                  </div>
                  <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-white/50">
                    <Coffee className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <div className="text-xs font-medium text-gray-700">Simple & Fast</div>
                  </div>
                </div>
                
                {currentPrompt && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-sm font-medium">I see you have a prompt ready!</span>
                    </div>
                    <p className="text-xs text-yellow-700 mt-1">
                      I can help you analyze, test, or improve it.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Final step CTA */}
            {currentStep === ONBOARDING_STEPS.length - 1 && (
              <div className="text-center mb-6">
                <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs hover:bg-green-50"
                      onClick={() => {/* Could trigger @generate example */}}
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      Try @generate
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs hover:bg-blue-50"
                      onClick={() => {/* Could open integrations */}}
                    >
                      <Link2 className="w-3 h-3 mr-1" />
                      Integrations
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600">
                    Ready to create amazing prompts? Let's go! 🚀
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Previous
            </Button>

            <div className="flex gap-1">
              {ONBOARDING_STEPS.map((_, index) => (
                <div
                  key={index}
                  className={`
                    w-2 h-2 rounded-full transition-all duration-300
                    ${index === currentStep 
                      ? 'bg-purple-600 scale-125' 
                      : index < currentStep 
                        ? 'bg-green-500' 
                        : 'bg-gray-300'
                    }
                  `}
                />
              ))}
            </div>

            <Button
              onClick={handleNext}
              size="sm"
              className={`
                flex items-center gap-2 transition-all duration-200
                ${currentStep === ONBOARDING_STEPS.length - 1 
                  ? 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600' 
                  : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600'
                }
              `}
            >
              {currentStep === ONBOARDING_STEPS.length - 1 ? (
                <>
                  Start Chatting
                  <Zap className="w-4 h-4" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}