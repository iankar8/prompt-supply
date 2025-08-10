'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSupabase } from '@/components/providers'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { 
  Zap, 
  Brain, 
  Sparkles, 
  Target, 
  BarChart, 
  Building, 
  ArrowRight,
  Star,
  CheckCircle,
  Globe,
  Shield,
  Lightbulb,
  Code,
  TrendingUp,
  Users,
  Play,
  ChevronDown
} from 'lucide-react'

// Force dynamic rendering to avoid SSR issues with client-only components
export const dynamic = 'force-dynamic'

export default function Home() {
  const { user } = useSupabase()
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (user) {
      router.push('/ai-studio')
    } else {
      setIsVisible(true)
    }
  }, [user, router])

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    )
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 animate-pulse"></div>
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        <div className="max-w-7xl mx-auto text-center">
          {/* Logo & Brand */}
          <div className="animate-fade-in-up mb-8">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/25 animate-pulse-gentle">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
                  Prompt.Supply
                </h1>
                <p className="text-purple-300 text-sm font-medium">Enterprise AI Studio</p>
              </div>
            </div>
          </div>

          {/* Hero Headline */}
          <div className="animate-fade-in-up mb-12" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                The Future of
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
                AI Prompt Engineering
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Generate, analyze, test, and refine prompts with{' '}
              <span className="text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text font-semibold">
                state-of-the-art techniques
              </span>{' '}
              used by top AI startups. Built with Claude's enterprise-grade intelligence.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="animate-fade-in-up flex flex-col sm:flex-row gap-6 justify-center mb-16" style={{ animationDelay: '0.4s' }}>
            <Button size="lg" asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-2xl shadow-purple-500/25 px-8 py-4 text-lg font-semibold rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-3xl hover:shadow-purple-500/40">
              <Link href="/auth/signup" className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Start Creating for Free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="border-2 border-gray-600 bg-gray-900/50 hover:bg-gray-800/50 text-white px-8 py-4 text-lg font-semibold rounded-2xl transition-all duration-300 hover:scale-105 backdrop-blur-sm">
              <Link href="/auth/signin" className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                Sign In
              </Link>
            </Button>
          </div>

          {/* Social Proof */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <div className="flex items-center justify-center gap-8 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">1000+</div>
                <div className="text-sm text-gray-400">Prompts Generated</div>
              </div>
              <div className="w-px h-12 bg-gray-600"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">50+</div>
                <div className="text-sm text-gray-400">Enterprise Users</div>
              </div>
              <div className="w-px h-12 bg-gray-600"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">99.9%</div>
                <div className="text-sm text-gray-400">Uptime</div>
              </div>
            </div>
            <div className="flex justify-center items-center gap-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="ml-2 text-gray-300">Rated 5/5 by prompt engineers</span>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-gray-400" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-transparent to-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h3 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Enterprise-Grade Features
            </h3>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Everything you need to create, manage, and optimize AI prompts at scale
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: 'AI Prompt Generator',
                description: 'Generate sophisticated prompts using state-of-the-art techniques from top AI startups',
                gradient: 'from-blue-500 to-cyan-500',
                features: ['Hyper-specific personas', 'Systematic framework', 'Enterprise patterns']
              },
              {
                icon: BarChart,
                title: 'Advanced Analytics',
                description: 'Multi-dimensional scoring, debug traces, and performance insights for optimization',
                gradient: 'from-purple-500 to-pink-500',
                features: ['Quality scoring', 'Debug traces', 'Performance metrics']
              },
              {
                icon: Building,
                title: 'Enterprise Ready',
                description: 'Production-grade reliability with escape hatches, XML output, and safety mechanisms',
                gradient: 'from-green-500 to-emerald-500',
                features: ['Structured output', 'Error handling', 'Safety protocols']
              },
              {
                icon: Target,
                title: 'Systematic Framework',
                description: 'Goal → Format → Verification → Context methodology for consistent results',
                gradient: 'from-orange-500 to-red-500',
                features: ['4-part structure', 'Verification checks', 'Context awareness']
              },
              {
                icon: Code,
                title: 'Meta-Prompting',
                description: 'Use AI to improve prompts iteratively based on performance feedback',
                gradient: 'from-indigo-500 to-purple-500',
                features: ['Self-improvement', 'Performance feedback', 'Iterative optimization']
              },
              {
                icon: Shield,
                title: 'Reliability First',
                description: 'Built-in escape hatches and uncertainty handling to prevent hallucination',
                gradient: 'from-teal-500 to-blue-500',
                features: ['Escape mechanisms', 'Confidence levels', 'Quality assurance']
              }
            ].map((feature, index) => (
              <Card 
                key={index} 
                className="bg-gray-900/50 backdrop-blur-sm border-gray-700/50 hover:border-gray-600/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl group animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="pb-4">
                  <div className={`w-14 h-14 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-xl text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-300 mb-4 text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                  <div className="space-y-2">
                    {feature.features.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-gray-400">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-4 bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-pink-900/20">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Trusted by AI Engineers Worldwide
          </h3>
          <p className="text-gray-300 text-lg mb-16">Join the community building the future of AI interaction</p>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: Users, stat: '10,000+', label: 'Active Users' },
              { icon: Zap, stat: '1M+', label: 'Prompts Generated' },
              { icon: TrendingUp, stat: '95%', label: 'Success Rate' },
              { icon: Globe, stat: '40+', label: 'Countries' }
            ].map((item, index) => (
              <div key={index} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.2}s` }}>
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-3xl p-8 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:scale-105">
                  <item.icon className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                  <div className="text-4xl font-bold text-white mb-2">{item.stat}</div>
                  <div className="text-gray-400">{item.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-3xl p-12 border border-gray-700/50 shadow-2xl">
            <Lightbulb className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
            <h3 className="text-4xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Ready to Transform Your AI Workflow?
            </h3>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Join thousands of engineers using enterprise-grade prompt engineering tools. 
              Start creating better prompts in minutes, not hours.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button size="lg" asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-2xl shadow-purple-500/25 px-10 py-4 text-lg font-semibold rounded-2xl transition-all duration-300 hover:scale-105">
                <Link href="/auth/signup" className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="border-2 border-gray-600 bg-gray-900/50 hover:bg-gray-800/50 text-white px-10 py-4 text-lg font-semibold rounded-2xl transition-all duration-300 hover:scale-105">
                <Link href="/auth/signin">
                  Sign In
                </Link>
              </Button>
            </div>

            <div className="flex justify-center items-center gap-6 mt-8 pt-8 border-t border-gray-700/50">
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-4 py-2">
                <CheckCircle className="w-4 h-4 mr-2" />
                Free Forever
              </Badge>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 px-4 py-2">
                <Shield className="w-4 h-4 mr-2" />
                Enterprise Security
              </Badge>
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 px-4 py-2">
                <Zap className="w-4 h-4 mr-2" />
                Claude Powered
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-gray-800">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Prompt.Supply</span>
          </div>
          <p className="text-gray-400 text-sm max-w-2xl mx-auto">
            Built with Next.js, Supabase, and Claude AI. Designed for the modern AI engineer who demands excellence in prompt engineering.
          </p>
          <div className="mt-6 text-gray-500 text-xs">
            © 2024 Prompt.Supply. Empowering the future of AI interaction.
          </div>
        </div>
      </footer>
    </div>
  )
}
