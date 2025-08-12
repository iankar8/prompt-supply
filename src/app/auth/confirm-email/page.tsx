'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useSupabase } from '@/components/providers'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import { 
  Mail, 
  CheckCircle, 
  RefreshCw, 
  ArrowRight, 
  Clock,
  Sparkles,
  MessageCircle,
  BookOpen
} from 'lucide-react'

// Force dynamic rendering to avoid SSR issues with client-only components
export const dynamic = 'force-dynamic'

export default function ConfirmEmailPage() {
  const [email, setEmail] = useState('')
  const [isResending, setIsResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { supabase, user } = useSupabase()

  // Get email from URL params if provided
  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  // Check if user is already confirmed
  useEffect(() => {
    if (user?.email_confirmed_at) {
      setIsConfirmed(true)
    }
  }, [user])

  // Poll for confirmation status
  useEffect(() => {
    if (isConfirmed) return

    const checkConfirmation = async () => {
      setIsChecking(true)
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        if (currentUser?.email_confirmed_at) {
          setIsConfirmed(true)
          toast({
            title: '🎉 Email confirmed!',
            description: 'Welcome to Prompt.Supply! Redirecting you to the app...',
          })
          
          // Redirect after a brief celebration
          setTimeout(() => {
            router.push('/ai-studio')
          }, 2000)
        }
      } catch (error) {
        console.error('Error checking confirmation:', error)
      } finally {
        setIsChecking(false)
      }
    }

    // Check every 3 seconds
    const interval = setInterval(checkConfirmation, 3000)
    
    // Initial check
    checkConfirmation()

    return () => clearInterval(interval)
  }, [isConfirmed, supabase, router])

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleResendConfirmation = async () => {
    if (!email) {
      toast({
        title: 'Email required',
        description: 'Please provide your email address to resend confirmation.',
        variant: 'destructive',
      })
      return
    }

    setIsResending(true)

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      })

      if (error) {
        toast({
          title: 'Error resending email',
          description: error.message,
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Confirmation email sent!',
        description: 'Check your inbox for the new confirmation email.',
      })

      // Set 60-second cooldown
      setResendCooldown(60)
    } catch (error) {
      console.error('Error resending confirmation:', error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsResending(false)
    }
  }

  if (isConfirmed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card className="border-green-200 bg-white/90 backdrop-blur-sm shadow-xl">
            <CardHeader className="text-center pb-3">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-4 animate-pulse">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-green-800">Email Confirmed! 🎉</CardTitle>
              <CardDescription className="text-green-600">
                Welcome to Prompt.Supply! Your account is now active.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-700 mb-3">
                  You now have access to:
                </p>
                <div className="space-y-2">
                  <Badge variant="outline" className="bg-white border-green-300 text-green-700 w-full justify-start">
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI Prompt Generation
                  </Badge>
                  <Badge variant="outline" className="bg-white border-green-300 text-green-700 w-full justify-start">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Claude AI Assistant
                  </Badge>
                  <Badge variant="outline" className="bg-white border-green-300 text-green-700 w-full justify-start">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Prompt Library
                  </Badge>
                </div>
              </div>
              
              <Button 
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                onClick={() => router.push('/ai-studio')}
              >
                Get Started <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Check Your Email
          </h2>
          <p className="text-gray-600">
            We've sent a confirmation link to{email && (
              <span className="font-medium text-blue-600 block mt-1">{email}</span>
            )}
          </p>
        </div>

        <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg">Almost there! 📧</CardTitle>
            <CardDescription>
              Follow these steps to complete your account setup:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Steps */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm font-medium">1</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Check your inbox</p>
                  <p className="text-xs text-gray-500">Look for an email from Prompt.Supply</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm font-medium">2</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Click the confirmation link</p>
                  <p className="text-xs text-gray-500">This will verify your email address</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  isChecking 
                    ? 'bg-orange-100 animate-pulse' 
                    : 'bg-gray-100'
                }`}>
                  {isChecking ? (
                    <RefreshCw className="w-3 h-3 text-orange-600 animate-spin" />
                  ) : (
                    <span className="text-gray-400 text-sm font-medium">3</span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Start using Prompt.Supply</p>
                  <p className="text-xs text-gray-500">
                    {isChecking ? 'Checking for confirmation...' : 'We\'ll redirect you automatically'}
                  </p>
                </div>
              </div>
            </div>

            {/* Status indicator */}
            {isChecking && (
              <div className="flex items-center justify-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <span className="text-sm text-blue-600 ml-2">Waiting for confirmation...</span>
              </div>
            )}

            {/* Resend section */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-3">
                Didn't receive the email? Check your spam folder or:
              </p>
              
              <div className="space-y-3">
                {/* Email input for resending */}
                <div>
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <Button
                  onClick={handleResendConfirmation}
                  disabled={isResending || resendCooldown > 0 || !email}
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : resendCooldown > 0 ? (
                    <>
                      <Clock className="w-4 h-4 mr-2" />
                      Resend in {resendCooldown}s
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Resend Email
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Back to signin */}
            <div className="text-center text-sm">
              <span className="text-gray-500">Already confirmed? </span>
              <Link href="/auth/signin" className="text-blue-600 hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* What's coming next */}
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              What's waiting for you:
            </h3>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• AI-powered prompt generation with Claude</li>
              <li>• Smart prompt analysis and optimization</li>
              <li>• Personal prompt library and templates</li>
              <li>• Chat interface with @commands</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}