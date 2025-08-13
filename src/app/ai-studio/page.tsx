'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/components/providers'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { AiChat } from '@/components/ai/ai-chat'
import { RotatingProTips } from '@/components/ui/rotating-pro-tips'
import { usePrompts, useCreatePrompt } from '@/hooks/use-supabase-query'
import { 
  MessageCircle, 
  BookOpen,
  Zap,
  Sparkles,
  Settings,
  Link2,
  Target
} from 'lucide-react'

// Force dynamic rendering to avoid SSR issues with client-only components
export const dynamic = 'force-dynamic'

export default function AIStudioPage() {
  const { user } = useSupabase()
  const router = useRouter()
  const [currentPrompt, setCurrentPrompt] = useState('')
  const [activeTab, setActiveTab] = useState('assistant')
  
  // Fetch saved prompts and mutation for creating new ones
  const { data: prompts = [], isLoading: promptsLoading } = usePrompts()
  const createPromptMutation = useCreatePrompt()

  useEffect(() => {
    // Temporarily allow anonymous access for debugging
    if (!user) {
      console.warn('AI Studio: No user found, allowing anonymous access for debugging')
      // router.push('/auth/signin') // Commented out for debugging
    }
  }, [user, router])

  // Temporarily allow anonymous access for debugging
  // if (!user) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <LoadingSpinner className="h-8 w-8" />
  //     </div>
  //   )
  // }

  const handleSavePrompt = async (promptContent: string, metadata?: { title?: string, description?: string, tags?: string[] }) => {
    if (!promptContent.trim()) return

    try {
      await createPromptMutation.mutateAsync({
        title: metadata?.title || 'Generated Prompt',
        content: promptContent,
        description: metadata?.description || 'Created via AI Assistant',
        is_template: false,
        is_favorite: false,
        tags: metadata?.tags || ['ai-generated'],
        folder_id: null,
        persona_id: null,
        position: 0,
        use_count: 0,
        last_used: null,
        variables: null,
        user_id: user!.id
      })
    } catch (error) {
      console.error('Failed to save prompt:', error)
      throw error // Re-throw so the UI can show the error
    }
  }

  const handlePromptGenerated = (prompt: string) => {
    setCurrentPrompt(prompt)
  }

  const handlePromptImproved = (improvedPrompt: string) => {
    setCurrentPrompt(improvedPrompt)
  }

  const handleLoadPrompt = (promptContent: string) => {
    setCurrentPrompt(promptContent)
    setActiveTab('analyzer') // Switch to analyzer to work with the loaded prompt
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none"></div>
      
      {/* Header */}
      <div className="relative bg-white/80 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-between items-start mb-8">
            {/* Navigation */}
            <div className="flex gap-2">
              <Link href="/integrations">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Link2 className="w-4 h-4" />
                  Integrations
                </Button>
              </Link>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </Button>
            </div>

            {/* User menu placeholder */}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {user?.email}
              </Badge>
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex justify-center items-center gap-4 mb-6 animate-fade-in-up">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25 animate-pulse-gentle">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent animate-gradient">
                Prompt.Supply
              </h1>
            </div>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Generate, analyze, test, and refine prompts with Claude's expertise
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Current Prompt Display */}
        {currentPrompt && (
          <Card className="mb-8 bg-gradient-to-r from-blue-50/50 to-purple-50/50 border border-blue-200/50 backdrop-blur-sm shadow-lg shadow-blue-500/10 animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-blue-900">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                Current Working Prompt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl border border-blue-200/30 text-sm font-mono shadow-inner">
                {currentPrompt}
              </div>
              <div className="flex gap-2 mt-4">
                <Badge variant="outline" className="bg-blue-50/50 border-blue-200/50 text-blue-700">Ready for analysis</Badge>
                <Badge variant="outline" className="bg-green-50/50 border-green-200/50 text-green-700">Available for testing</Badge>
                <Badge variant="outline" className="bg-purple-50/50 border-purple-200/50 text-purple-700">Chat assistance available</Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Studio Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 bg-white/50 backdrop-blur-sm border border-white/20 shadow-lg p-2 rounded-xl">
            <TabsTrigger value="library" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:scale-105">
              <BookOpen className="w-4 h-4" />
              Prompt Library
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:scale-105">
              <MessageCircle className="w-4 h-4" />
              AI Assistant
            </TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="space-y-6 animate-fade-in">
            <Card className="bg-white/50 backdrop-blur-sm border border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  Your Prompt Library
                </CardTitle>
                <p className="text-gray-600 text-lg">
                  Browse and load your saved prompts. Click on any prompt to start working with it.
                </p>
              </CardHeader>
              <CardContent>
                {promptsLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
                  </div>
                ) : prompts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {prompts.map((prompt: any, index: number) => (
                      <Card key={prompt.id} className="cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white/80 backdrop-blur-sm border border-white/30 hover:border-purple-300/50 group animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }} onClick={() => handleLoadPrompt(prompt.content)}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="truncate text-base group-hover:text-purple-700 transition-colors">{prompt.title}</CardTitle>
                            {prompt.is_favorite ? (
                              <span className="ml-2 text-yellow-500 animate-pulse" aria-label="Favorite">★</span>
                            ) : null}
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          {prompt.description ? (
                            <p className="mt-1 text-sm text-gray-600 line-clamp-2">{prompt.description}</p>
                          ) : null}
                          <div className="mt-4">
                            <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gradient-to-br from-gray-50/50 to-blue-50/30 p-3 rounded-lg border border-gray-200/50 max-h-24 overflow-auto backdrop-blur-sm">{prompt.content}</pre>
                          </div>
                          {prompt.tags?.length ? (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {prompt.tags.slice(0, 3).map((tag: string) => (
                                <Badge key={tag} variant="secondary" className="bg-purple-100/70 text-purple-700 border-purple-200/50">{tag}</Badge>
                              ))}
                              {prompt.tags.length > 3 && (
                                <Badge variant="outline" className="bg-gray-100/70 text-gray-600 border-gray-200/50">+{prompt.tags.length - 3}</Badge>
                              )}
                            </div>
                          ) : null}
                          <div className="mt-4 pt-3 border-t border-gray-200/50">
                            <Button size="sm" className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg transition-all duration-300">
                              Load Prompt
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 animate-fade-in">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse-gentle">
                      <BookOpen className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-700 mb-3">No saved prompts yet</h3>
                    <p className="text-gray-500 mb-8 text-lg max-w-md mx-auto">
                      Use the AI Assistant to create and save your first prompt with @generate commands
                    </p>
                    <Button 
                      onClick={() => setActiveTab('chat')} 
                      className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Start Creating
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat" className="space-y-6 animate-fade-in">
            <AiChat 
              currentPrompt={currentPrompt} 
              onPromptUpdate={setCurrentPrompt}
              onSavePrompt={handleSavePrompt}
            />
          </TabsContent>
        </Tabs>

        {/* Rotating Pro Tips */}
        <RotatingProTips />
      </div>
    </div>
  )
}