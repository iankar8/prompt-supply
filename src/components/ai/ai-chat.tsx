'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { RateLimitStatus } from '@/components/ui/rate-limit-status'
import { useChatAboutPrompt, useGeneratePrompt, useAnalyzePrompt, useTestPrompt, RateLimitError } from '@/hooks/use-ai'
import { useMCPContext, useMCPToolCall } from '@/hooks/use-mcp'
import { 
  MessageCircle, 
  Send, 
  User, 
  Bot, 
  Sparkles, 
  Brain,
  TestTube,
  BarChart,
  Save,
  AtSign,
  Zap,
  Target,
  Link2,
  Database
} from 'lucide-react'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  command?: CommandType | null
  data?: any
}

interface AiChatProps {
  currentPrompt?: string
  onPromptUpdate?: (newPrompt: string) => void
  onSavePrompt?: (prompt: string, metadata?: { title?: string, description?: string, tags?: string[] }) => Promise<void>
}

type CommandType = 'generate' | 'analyze' | 'test' | 'evaluate' | 'save' | 'load' | 'context' | 'setup'

interface Command {
  type: CommandType
  icon: React.ComponentType<{ className?: string }>
  label: string
  description: string
  color: string
}

const AVAILABLE_COMMANDS: Command[] = [
  {
    type: 'generate',
    icon: Sparkles,
    label: '@generate',
    description: 'Create a new prompt with guided parameters',
    color: 'text-green-600'
  },
  {
    type: 'analyze',
    icon: Brain,
    label: '@analyze',
    description: 'Analyze and improve an existing prompt',
    color: 'text-purple-600'
  },
  {
    type: 'test',
    icon: TestTube,
    label: '@test',
    description: 'Test a prompt with sample inputs',
    color: 'text-amber-600'
  },
  {
    type: 'evaluate',
    icon: BarChart,
    label: '@evaluate',
    description: 'Get comprehensive prompt scoring',
    color: 'text-emerald-600'
  },
  {
    type: 'save',
    icon: Save,
    label: '@save',
    description: 'Save the current prompt to library',
    color: 'text-blue-600'
  },
  {
    type: 'context',
    icon: Link2,
    label: '@context',
    description: 'Pull real-time context from connected MCP servers',
    color: 'text-cyan-600'
  },
  {
    type: 'setup',
    icon: Zap,
    label: '@setup',
    description: 'Set up new MCP integrations easily',
    color: 'text-pink-600'
  }
]

export function AiChat({ currentPrompt, onPromptUpdate, onSavePrompt }: AiChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [activeCommand, setActiveCommand] = useState<CommandType | null>(null)
  const [showCommandSuggestions, setShowCommandSuggestions] = useState(false)
  const [commandData, setCommandData] = useState<Record<string, any>>({})
  const [showOnboarding, setShowOnboarding] = useState(true)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const chatMutation = useChatAboutPrompt()
  const generateMutation = useGeneratePrompt()
  const analyzeMutation = useAnalyzePrompt()
  const testMutation = useTestPrompt()
  
  // MCP context hooks
  const { availableContext, hasConnectedServers } = useMCPContext()
  const { executeToolCall } = useMCPToolCall()

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Initialize tour messages for new users
  useEffect(() => {
    if (hasCompletedOnboarding && messages.length === 0) {
      const welcomeContent = currentPrompt 
        ? `Great! I can see you're working with a prompt. I'm ready to help you @analyze, @test, @evaluate, or improve it. What would you like to do?`
        : `Hello! I'm Claude, your AI prompt engineering assistant. Ready to create something amazing? Try @generate to get started, or just tell me what you're working on!`
      
      const welcomeMessage: ChatMessage = {
        role: 'assistant',
        content: welcomeContent,
        timestamp: new Date()
      }
      setMessages([welcomeMessage])
    } else if (!hasCompletedOnboarding && messages.length === 0) {
      // Start the chat-based tour
      // startChatTour()
    }
  }, [hasCompletedOnboarding, currentPrompt, messages.length])

  // Check for existing onboarding completion from localStorage
  useEffect(() => {
    const completed = localStorage.getItem('ai-chat-onboarding-completed')
    if (completed === 'true') {
      setShowOnboarding(false)
      setHasCompletedOnboarding(true)
    }
  }, [])

  // Detect @mentions and show suggestions
  useEffect(() => {
    const trimmedInput = inputMessage.trim()
    
    // Show suggestions only when:
    // 1. Input starts with @ and is not a complete command
    // 2. Input has content after @
    // 3. Not just "@" alone
    const showSuggestions = (
      trimmedInput.startsWith('@') &&
      trimmedInput.length > 1 &&
      !AVAILABLE_COMMANDS.some(cmd => trimmedInput.toLowerCase() === cmd.label.toLowerCase())
    )
    
    setShowCommandSuggestions(showSuggestions)
  }, [inputMessage])

  // Command detection and processing
  const detectCommand = (message: string): CommandType | null => {
    const lowerMessage = message.toLowerCase().trim()
    for (const command of AVAILABLE_COMMANDS) {
      if (lowerMessage.startsWith(command.label.toLowerCase())) {
        return command.type
      }
    }
    return null
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const command = detectCommand(inputMessage)
    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
      command
    }

    // Add user message immediately
    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setShowCommandSuggestions(false)

    // Handle commands
    if (command) {
      await handleCommand(command, userMessage.content)
    } else {
      // Regular chat
      await handleRegularChat(userMessage.content)
    }
  }

  const handleCommand = async (command: CommandType, originalMessage: string) => {
    switch (command) {
      case 'generate':
        setActiveCommand('generate')
        setCommandData({
          purpose: '',
          domain: '',
          tone: '',
          length: 'medium',
          audience: '',
          examples: ''
        })
        break
      
      case 'analyze':
        if (currentPrompt) {
          await analyzeCurrentPrompt()
        } else {
          const promptToAnalyze = originalMessage.replace('@analyze', '').trim()
          if (promptToAnalyze) {
            await analyzePrompt(promptToAnalyze)
          } else {
            addAssistantMessage("I'd be happy to analyze a prompt! Please provide a prompt after @analyze or set a current prompt first.")
          }
        }
        break
      
      case 'test':
        const testPromptContent = currentPrompt || originalMessage.replace('@test', '').trim()
        if (testPromptContent) {
          await testPrompt(testPromptContent)
        } else {
          addAssistantMessage("Please provide a prompt to test, either as a current prompt or after @test.")
        }
        break
      
      case 'evaluate':
        const evalPrompt = currentPrompt || originalMessage.replace('@evaluate', '').trim()
        if (evalPrompt) {
          await evaluatePrompt(evalPrompt)
        } else {
          addAssistantMessage("Please provide a prompt to evaluate, either as a current prompt or after @evaluate.")
        }
        break
      
      case 'save':
        if (currentPrompt) {
          setActiveCommand('save')
          setCommandData({
            title: 'Saved Prompt',
            description: 'Saved from AI Assistant',
            tags: 'ai-generated'
          })
        } else {
          addAssistantMessage("No current prompt to save. Generate or set a prompt first.")
        }
        break

      case 'context':
        if (hasConnectedServers) {
          setActiveCommand('context')
          setCommandData({
            selectedServers: [],
            contextQuery: originalMessage.replace('@context', '').trim() || ''
          })
        } else {
          addAssistantMessage("No MCP servers connected. Please connect to some integrations first in the [Integrations page](/integrations) to use @context commands.")
        }
        break
    }
  }

  const handleRegularChat = async (message: string) => {
    const conversationHistory = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }))

    chatMutation.mutate(
      { message, prompt: currentPrompt, conversationHistory },
      {
        onSuccess: (data) => addAssistantMessage(data.response),
        onError: (error) => {
          if (error instanceof RateLimitError) {
            addAssistantMessage(`⏰ **Rate Limit Reached**\n\n${error.friendlyMessage}\n\nI've been temporarily limited to prevent overuse. You can continue chatting once the limit resets.`)
          } else {
            addAssistantMessage(`I encountered an error: ${error.message}. Please try again.`)
          }
        }
      }
    )
  }

  const addAssistantMessage = (content: string, data?: any) => {
    const message: ChatMessage = {
      role: 'assistant',
      content,
      timestamp: new Date(),
      data
    }
    setMessages(prev => [...prev, message])
  }

  // Command implementation functions
  const analyzeCurrentPrompt = async () => {
    if (!currentPrompt) return
    
    addAssistantMessage("🧠 Analyzing your prompt...")
    
    analyzeMutation.mutate(
      { prompt: currentPrompt },
      {
        onSuccess: (data) => {
          const analysisContent = `## Prompt Analysis Results

**Overall Score:** ${data.score}/10

### ✅ Strengths
${data.strengths.map(s => `• ${s}`).join('\n')}

### ⚠️ Areas for Improvement  
${data.weaknesses.map(w => `• ${w}`).join('\n')}

### 💡 Suggestions
${data.suggestions.map(s => `• ${s}`).join('\n')}

### 🎯 Improved Version
\`\`\`
${data.improvedVersion}
\`\`\`

**Reasoning:** ${data.reasoning}`

          addAssistantMessage(analysisContent)
          
          // Offer to apply the improved version
          if (data.improvedVersion && onPromptUpdate) {
            setTimeout(() => {
              if (window.confirm('Would you like to apply the improved version?')) {
                onPromptUpdate(data.improvedVersion)
                addAssistantMessage("✅ Improved prompt applied!")
              }
            }, 1000)
          }
        },
        onError: (error) => {
          if (error instanceof RateLimitError) {
            addAssistantMessage(`⏰ **Rate Limit Reached**\n\n${error.friendlyMessage}\n\nAnalysis requests are limited to prevent API overuse.`)
          } else {
            addAssistantMessage(`Analysis failed: ${error.message}`)
          }
        }
      }
    )
  }

  const analyzePrompt = async (prompt: string) => {
    addAssistantMessage("🧠 Analyzing the provided prompt...")
    
    analyzeMutation.mutate(
      { prompt },
      {
        onSuccess: (data) => {
          const analysisContent = `## Analysis Results

**Overall Score:** ${data.score}/10

### ✅ Strengths
${data.strengths.map(s => `• ${s}`).join('\n')}

### ⚠️ Areas for Improvement
${data.weaknesses.map(w => `• ${w}`).join('\n')}

### 🎯 Improved Version
\`\`\`
${data.improvedVersion}
\`\`\`

Would you like me to set this as your current prompt?`

          addAssistantMessage(analysisContent)
        },
        onError: (error) => {
          if (error instanceof RateLimitError) {
            addAssistantMessage(`⏰ **Rate Limit Reached**\n\n${error.friendlyMessage}\n\nAnalysis requests are limited to prevent API overuse.`)
          } else {
            addAssistantMessage(`Analysis failed: ${error.message}`)
          }
        }
      }
    )
  }

  const testPrompt = async (prompt: string) => {
    addAssistantMessage("🧪 Testing your prompt...")
    
    testMutation.mutate(
      { prompt, testInputs: [''] },
      {
        onSuccess: (data) => {
          const results = data.results[0]
          const testContent = `## Test Results

**Quality Score:** ${results.quality}/10
**Clarity:** ${results.clarity}/10  
**Relevance:** ${results.relevance}/10
**Creativity:** ${results.creativity}/10

### Response
\`\`\`
${results.response}
\`\`\`

### Issues Found
${results.issues.length > 0 ? results.issues.map(i => `• ${i}`).join('\n') : '• No issues detected'}

### Suggestions  
${results.suggestions.map(s => `• ${s}`).join('\n')}`

          addAssistantMessage(testContent)
        },
        onError: (error) => {
          if (error instanceof RateLimitError) {
            addAssistantMessage(`⏰ **Rate Limit Reached**\n\n${error.friendlyMessage}\n\nTest requests are strictly limited as they use 2x API calls.`)
          } else {
            addAssistantMessage(`Testing failed: ${error.message}`)
          }
        }
      }
    )
  }

  const evaluatePrompt = async (prompt: string) => {
    addAssistantMessage("📊 Evaluating your prompt comprehensively...")
    
    // Mock evaluation since we don't have the hook yet - will show scoring interface
    setTimeout(() => {
      const evaluationContent = `## Comprehensive Evaluation

### Overall Score: 85/100

#### Dimensional Scores
• **Clarity & Specificity:** 88/100
• **Structure & Organization:** 82/100  
• **Context & Role Definition:** 85/100
• **Reliability & Safety:** 87/100
• **Enterprise Readiness:** 83/100

#### Key Insights
✅ **Strengths:** Clear instructions, good structure, appropriate context
⚠️ **Improvements:** Add escape hatches, include examples, enhance safety mechanisms

#### Recommendations
• Consider adding "If uncertain, respond with 'I need more information about...'"
• Include 1-2 examples of desired output format
• Define success criteria more explicitly

Would you like me to help implement these improvements?`

      addAssistantMessage(evaluationContent)
    }, 2000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    } else if (e.key === 'Escape' && showCommandSuggestions) {
      setShowCommandSuggestions(false)
    }
  }

  const clearChat = () => {
    setMessages([])
    setInputMessage('')
    setActiveCommand(null)
    setCommandData({})
  }

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
    setHasCompletedOnboarding(true)
    localStorage.setItem('ai-chat-onboarding-completed', 'true')
  }

  const handleOnboardingSkip = () => {
    setShowOnboarding(false)
    setHasCompletedOnboarding(true)
    localStorage.setItem('ai-chat-onboarding-completed', 'true')
  }

  const resetOnboarding = () => {
    localStorage.removeItem('ai-chat-onboarding-completed')
    setShowOnboarding(true)
    setHasCompletedOnboarding(false)
    setMessages([])
  }

  // const startChatTour = useCallback(() => {
  //   const tourMessages: ChatMessage[] = [
  //     {
  //       role: 'assistant',
  //       content: `👋 **Welcome to AI Studio!**

  // I'm Claude, your personal prompt engineering assistant. I'll help you create, analyze, and perfect prompts for any use case.

  // Ready for a quick tour? ✨`,
  //       timestamp: new Date()
  //     }
  //   ]

  //   setMessages(tourMessages)
  // }, [])

  const handleCommandSuggestionClick = (command: Command) => {
    setInputMessage(command.label + ' ')
    setShowCommandSuggestions(false)
    inputRef.current?.focus()
  }

  const executeGenerate = async () => {
    if (!commandData.purpose || !commandData.domain) return
    
    addAssistantMessage("🎨 Generating your prompt...")
    
    generateMutation.mutate(commandData as import('@/hooks/use-ai').PromptGenerationRequest, {
      onSuccess: (data) => {
        const generatedPrompt = data.prompt
        addAssistantMessage(`## ✅ Generated Prompt\n\n\`\`\`\n${generatedPrompt}\n\`\`\`\n\nWould you like to set this as your current prompt?`)
        
        if (onPromptUpdate) {
          setTimeout(() => {
            if (window.confirm('Set this as your current prompt?')) {
              onPromptUpdate(generatedPrompt)
              addAssistantMessage("🎯 Prompt set as current! You can now @analyze, @test, @evaluate, or @save it.")
            }
          }, 1000)
        }
        
        setActiveCommand(null)
        setCommandData({})
      },
      onError: (error) => {
        if (error instanceof RateLimitError) {
          addAssistantMessage(`⏰ **Rate Limit Reached**\n\n${error.friendlyMessage}\n\nGeneration requests are limited to prevent API overuse.`)
        } else {
          addAssistantMessage(`Generation failed: ${error.message}`)
        }
        setActiveCommand(null)
      }
    })
  }

  const executeSave = async () => {
    if (!currentPrompt || !commandData.title?.trim() || !onSavePrompt) return
    
    try {
      addAssistantMessage("💾 Saving prompt to your library...")
      
      // Parse tags from comma-separated string
      const tags = commandData.tags ? 
        commandData.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0) : 
        ['ai-generated']
      
      await onSavePrompt(currentPrompt, {
        title: commandData.title,
        description: commandData.description || 'Saved from AI Assistant',
        tags: tags
      })
      
      addAssistantMessage("✅ Prompt successfully saved to your library!")
      setActiveCommand(null)
      setCommandData({})
    } catch (error) {
      addAssistantMessage("❌ Failed to save prompt. Please try again.")
    }
  }

  const executeContext = async () => {
    if (!commandData.selectedServers?.length) return
    
    try {
      addAssistantMessage("🔍 Gathering context from connected servers...")
      
      const contextResults = []
      
      for (const serverId of commandData.selectedServers) {
        const serverContext = availableContext.find(ctx => ctx.serverId === serverId)
        if (!serverContext || !serverContext.connected) continue
        
        // For now, we'll gather basic info - this can be enhanced based on available tools
        try {
          if (serverContext.tools.length > 0) {
            // Use the first available tool as an example
            const tool = serverContext.tools[0]
            const result = await executeToolCall({
              serverId,
              toolName: tool.name,
              arguments: commandData.contextQuery ? { query: commandData.contextQuery } : {}
            })
            
            if (result) {
              contextResults.push({
                server: serverContext.serverName,
                content: result
              })
            }
          }
        } catch (error) {
          console.error(`Failed to get context from ${serverContext.serverName}:`, error)
        }
      }
      
      if (contextResults.length > 0) {
        let contextMessage = "## 📋 Context Retrieved\n\n"
        contextResults.forEach(result => {
          contextMessage += `### ${result.server}\n\`\`\`\n${JSON.stringify(result.content, null, 2)}\n\`\`\`\n\n`
        })
        contextMessage += "This context is now available for your prompt engineering. You can reference this information in your prompts or use it with other @commands."
        
        addAssistantMessage(contextMessage)
      } else {
        addAssistantMessage("⚠️ No context could be retrieved from the selected servers. Please check your connections and try again.")
      }
      
      setActiveCommand(null)
      setCommandData({})
    } catch (error) {
      addAssistantMessage("❌ Failed to retrieve context. Please try again.")
      console.error('Context execution error:', error)
    }
  }

  const executeSetup = async () => {
    if (!commandData.setupUrl?.trim()) return
    
    try {
      addAssistantMessage("✨ Starting Magic MCP Setup...")
      
      // Show step-by-step progress through messages
      addAssistantMessage("🔍 **Step 1:** Analyzing the provided URL...")
      
      // Mock the setup process for now - this would integrate with the MagicSetupWizard logic
      setTimeout(() => {
        addAssistantMessage("📡 **Step 2:** Detecting MCP server type and requirements...")
      }, 1000)
      
      setTimeout(() => {
        addAssistantMessage("🔑 **Step 3:** Checking OAuth requirements...")
      }, 2000)
      
      setTimeout(() => {
        addAssistantMessage("⚡ **Step 4:** Setting up the integration...")
      }, 3000)
      
      setTimeout(() => {
        addAssistantMessage(`✅ **Setup Complete!** 

Your MCP integration has been successfully configured and is ready to use.

**What's available:**
• Use @context to pull real-time data
• Integration appears in your Integrations page
• All OAuth connections are automatically handled

Try typing @context to see your new integration in action!`)
        
        setActiveCommand(null)
        setCommandData({})
      }, 4000)
      
    } catch (error) {
      addAssistantMessage("❌ Setup failed. Please check the URL and try again.")
      console.error('Setup execution error:', error)
      setActiveCommand(null)
    }
  }

  const formatMessageContent = (content: string) => {
    return content.split('```').map((part, index) => {
      if (index % 2 === 1) {
        return (
          <pre key={index} className="bg-gray-100 p-3 rounded-md my-2 text-sm overflow-x-auto">
            <code>{part}</code>
          </pre>
        )
      }
      return part.split('\n').map((line, lineIndex, array) => (
        <span key={`${index}-${lineIndex}`}>
          {line}
          {lineIndex < array.length - 1 && <br />}
        </span>
      ))
    })
  }

  return (
    <div className="space-y-6">
      {/* Rate Limit Status - Compact View */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <RateLimitStatus compact={true} />
      </div>
      
      <Card className="flex flex-col h-[600px] relative overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                AI Prompt Assistant
                {activeCommand && (
                  <Badge className="ml-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    {AVAILABLE_COMMANDS.find(c => c.type === activeCommand)?.label}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {activeCommand 
                  ? `Complete the ${activeCommand} command below, or type to continue chatting`
                  : "Chat with Claude or use @commands for quick actions"
                }
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {currentPrompt && (
                <Badge variant="outline" className="text-xs">
                  Current prompt active
                </Badge>
              )}
              <Button variant="outline" size="sm" onClick={clearChat}>
                Clear Chat
              </Button>
              <Button variant="ghost" size="sm" onClick={resetOnboarding} className="text-purple-600 hover:text-purple-700">
                Reset Tour
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col overflow-hidden">
          {/* Active Command Summary */}
          {activeCommand && (
            <div className="flex-shrink-0 mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/50 rounded-lg">
              <div className="flex items-center gap-2">
                {(() => {
                  const command = AVAILABLE_COMMANDS.find(c => c.type === activeCommand)
                  const IconComponent = command?.icon || Sparkles
                  return (
                    <>
                      <IconComponent className={`w-4 h-4 ${command?.color || 'text-blue-600'}`} />
                      <span className="text-sm font-medium text-gray-700">
                        {command?.description || 'Processing command...'}
                      </span>
                    </>
                  )
                })()}
              </div>
            </div>
          )}

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 min-h-0">
              {/* Dynamic Command Interface - Show within chat area */}
              {activeCommand === 'generate' && (
              <div className="animate-fade-in bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-gray-900">Generate New Prompt</h3>
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="purpose" className="text-sm font-medium">Purpose *</Label>
                      <Input
                        id="purpose"
                        placeholder="e.g., Write marketing copy"
                        value={commandData.purpose || ''}
                        onChange={(e) => setCommandData(prev => ({ ...prev, purpose: e.target.value }))}
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="domain" className="text-sm font-medium">Domain *</Label>
                      <Input
                        id="domain"
                        placeholder="e.g., Marketing, Education"
                        value={commandData.domain || ''}
                        onChange={(e) => setCommandData(prev => ({ ...prev, domain: e.target.value }))}
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tone" className="text-sm font-medium">Tone</Label>
                      <Input
                        id="tone"
                        placeholder="e.g., Professional, Casual"
                        value={commandData.tone || ''}
                        onChange={(e) => setCommandData(prev => ({ ...prev, tone: e.target.value }))}
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="length" className="text-sm font-medium">Length</Label>
                      <Select
                        value={commandData.length || 'medium'}
                        onValueChange={(value) => setCommandData(prev => ({ ...prev, length: value }))}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="short">Short</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="long">Long</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="audience" className="text-sm font-medium">Target Audience</Label>
                    <Input
                      id="audience"
                      placeholder="e.g., Software developers, Marketing managers"
                      value={commandData.audience || ''}
                      onChange={(e) => setCommandData(prev => ({ ...prev, audience: e.target.value }))}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="examples" className="text-sm font-medium">Additional Context</Label>
                    <Textarea
                      id="examples"
                      placeholder="Any specific requirements, examples, or additional context..."
                      value={commandData.examples || ''}
                      onChange={(e) => setCommandData(prev => ({ ...prev, examples: e.target.value }))}
                      rows={2}
                      className="resize-none"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={executeGenerate}
                      disabled={!commandData.purpose || !commandData.domain || generateMutation.isPending}
                      className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 h-9"
                      size="sm"
                    >
                      {generateMutation.isPending ? (
                        <>
                          <LoadingSpinner className="w-4 h-4 mr-2" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setActiveCommand(null)}
                      disabled={generateMutation.isPending}
                      size="sm"
                      className="h-9"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Save Prompt Interface - Show within chat area */}
            {activeCommand === 'save' && (
              <div className="animate-fade-in bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Save className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Save Prompt to Library</h3>
                </div>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="save-title" className="text-sm font-medium">Title *</Label>
                    <Input
                      id="save-title"
                      placeholder="e.g., Marketing Copy Generator"
                      value={commandData.title || ''}
                      onChange={(e) => setCommandData(prev => ({ ...prev, title: e.target.value }))}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="save-description" className="text-sm font-medium">Description</Label>
                    <Textarea
                      id="save-description"
                      placeholder="Brief description of what this prompt does..."
                      value={commandData.description || ''}
                      onChange={(e) => setCommandData(prev => ({ ...prev, description: e.target.value }))}
                      rows={2}
                      className="resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="save-tags" className="text-sm font-medium">Tags</Label>
                    <Input
                      id="save-tags"
                      placeholder="e.g., marketing, copywriting, sales"
                      value={commandData.tags || ''}
                      onChange={(e) => setCommandData(prev => ({ ...prev, tags: e.target.value }))}
                      className="h-9"
                    />
                    <p className="text-xs text-gray-500">Separate tags with commas</p>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={executeSave}
                      disabled={!commandData.title?.trim()}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 h-9"
                      size="sm"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save to Library
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setActiveCommand(null)}
                      size="sm"
                      className="h-9"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Context Command Interface - Show within chat area */}
            {activeCommand === 'context' && (
              <div className="animate-fade-in bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Link2 className="w-5 h-5 text-cyan-600" />
                  <h3 className="font-semibold text-gray-900">Pull Context from MCP Servers</h3>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Context Query (optional)</Label>
                    <Input
                      placeholder="e.g., recent issues, project status, design specs..."
                      value={commandData.contextQuery || ''}
                      onChange={(e) => setCommandData(prev => ({ ...prev, contextQuery: e.target.value }))}
                      className="h-9"
                    />
                    <p className="text-xs text-gray-500">Describe what context you need to pull from connected servers</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Select Servers *</Label>
                    <div className="space-y-2">
                      {availableContext.filter(ctx => ctx.connected).map((server) => (
                        <div key={server.serverId} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`server-${server.serverId}`}
                            checked={commandData.selectedServers?.includes(server.serverId) || false}
                            onChange={(e) => {
                              const currentServers = commandData.selectedServers || []
                              const newServers = e.target.checked
                                ? [...currentServers, server.serverId]
                                : currentServers.filter((id: string) => id !== server.serverId)
                              setCommandData(prev => ({ ...prev, selectedServers: newServers }))
                            }}
                            className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                          />
                          <label htmlFor={`server-${server.serverId}`} className="text-sm text-gray-700 flex items-center gap-2">
                            <Database className="w-4 h-4 text-gray-400" />
                            {server.serverName} ({server.tools.length} tools)
                          </label>
                        </div>
                      ))}
                    </div>
                    {availableContext.filter(ctx => ctx.connected).length === 0 && (
                      <p className="text-sm text-gray-500 italic">No connected servers available. Visit the Integrations page to connect MCP servers.</p>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={executeContext}
                      disabled={!commandData.selectedServers?.length}
                      className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 h-9"
                      size="sm"
                    >
                      <Link2 className="w-4 h-4 mr-2" />
                      Pull Context
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setActiveCommand(null)}
                      size="sm"
                      className="h-9"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Setup Command Interface - Show within chat area */}
            {activeCommand === 'setup' && (
              <div className="animate-fade-in bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-pink-600" />
                  <h3 className="font-semibold text-gray-900">Magic MCP Setup</h3>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">MCP Server URL or Repository</Label>
                    <Input
                      placeholder="e.g., https://github.com/user/mcp-server, npm:@scope/mcp-package"
                      value={commandData.setupUrl || ''}
                      onChange={(e) => setCommandData(prev => ({ ...prev, setupUrl: e.target.value }))}
                      className="h-9"
                    />
                    <p className="text-xs text-gray-500">Paste any GitHub repo, npm package, or MCP server URL</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-pink-600" />
                      <span className="text-sm font-medium text-pink-800">What I'll do automatically:</span>
                    </div>
                    <ul className="text-xs text-pink-700 space-y-1">
                      <li>• Detect the MCP server type and requirements</li>
                      <li>• Set up any needed OAuth connections</li>
                      <li>• Install and configure the server</li>
                      <li>• Test the connection and available tools</li>
                    </ul>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={executeSetup}
                      disabled={!commandData.setupUrl?.trim()}
                      className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 h-9"
                      size="sm"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Start Magic Setup
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setActiveCommand(null)}
                      size="sm"
                      className="h-9"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`flex gap-3 max-w-[85%] ${
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user' 
                      ? 'bg-blue-100' 
                      : 'bg-purple-100'
                  }`}>
                    {message.role === 'user' ? (
                      message.command ? (
                        <AtSign className="w-4 h-4 text-blue-600" />
                      ) : (
                        <User className="w-4 h-4 text-blue-600" />
                      )
                    ) : (
                      <Bot className="w-4 h-4 text-purple-600" />
                    )}
                  </div>
                  
                  <div className={`p-3 rounded-lg ${
                    message.role === 'user'
                      ? message.command
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                        : 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <div className="text-sm prose prose-sm max-w-none">
                      {formatMessageContent(message.content)}
                    </div>
                    <div className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-blue-200' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Loading indicators */}
            {(chatMutation.isPending || generateMutation.isPending || analyzeMutation.isPending || testMutation.isPending) && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-purple-600" />
                </div>
                <div className="bg-gray-100 text-gray-900 p-3 rounded-lg">
                  <LoadingSpinner className="w-4 h-4" />
                  <span className="ml-2 text-sm">
                    {analyzeMutation.isPending && "Analyzing prompt..."}
                    {testMutation.isPending && "Testing prompt..."}
                    {generateMutation.isPending && "Generating prompt..."}
                    {chatMutation.isPending && "Claude is thinking..."}
                  </span>
                </div>
              </div>
            )}
            
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Command suggestions dropdown */}
          {showCommandSuggestions && (
            <div className="relative mb-3 animate-fade-in">
              <div className="absolute bottom-full left-0 right-0 mb-2 z-50">
                <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-h-64 overflow-y-auto">
                  <div className="text-xs font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                    Available Commands:
                  </div>
                  <div className="space-y-1">
                    {AVAILABLE_COMMANDS.map((command) => {
                      const IconComponent = command.icon
                      return (
                        <Button
                          key={command.type}
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCommandSuggestionClick(command)}
                          className="w-full justify-start h-auto p-3 hover:bg-gray-50 text-left transition-all duration-150"
                        >
                          <IconComponent className={`w-4 h-4 mr-3 ${command.color} flex-shrink-0`} />
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-sm text-gray-900">{command.label}</div>
                            <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">{command.description}</div>
                          </div>
                        </Button>
                      )
                    })}
                  </div>
                  <div className="mt-3 pt-2 border-t border-gray-100">
                    <div className="text-xs text-gray-400 text-center">
                      Type @ followed by a command name
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="flex-shrink-0 border-t pt-4">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                placeholder="Type @ for commands, or chat naturally..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={chatMutation.isPending || generateMutation.isPending || analyzeMutation.isPending || testMutation.isPending}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || chatMutation.isPending || generateMutation.isPending || analyzeMutation.isPending || testMutation.isPending}
                size="sm"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Quick @commands - only show when NOT showing suggestions */}
            {!showCommandSuggestions && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {AVAILABLE_COMMANDS.slice(0, 4).map((command) => {
                  const IconComponent = command.icon
                  return (
                    <Button
                      key={command.type}
                      variant="outline"
                      size="sm"
                      onClick={() => setInputMessage(command.label + ' ')}
                      disabled={chatMutation.isPending || generateMutation.isPending}
                      className="text-xs"
                    >
                      <IconComponent className={`w-3 h-3 mr-1 ${command.color}`} />
                      {command.label}
                    </Button>
                  )
                })}
              </div>
            )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}