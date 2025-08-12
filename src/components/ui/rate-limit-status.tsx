'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Clock, Zap, AlertTriangle, CheckCircle } from 'lucide-react'

interface RateLimitInfo {
  endpoint: string
  limit: number
  remaining: number
  used: number
  resetTime: Date
  retryAfter?: number
}

interface RateLimitStatusProps {
  className?: string
  compact?: boolean
}

export function RateLimitStatus({ className, compact = false }: RateLimitStatusProps) {
  const [rateLimits, setRateLimits] = useState<RateLimitInfo[]>([])
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Mock data - in a real app this would come from an API or context
  useEffect(() => {
    const mockData: RateLimitInfo[] = [
      {
        endpoint: 'generate',
        limit: 10,
        remaining: 7,
        used: 3,
        resetTime: new Date(Date.now() + 3200000), // 53 minutes from now
      },
      {
        endpoint: 'analyze', 
        limit: 20,
        remaining: 15,
        used: 5,
        resetTime: new Date(Date.now() + 3200000),
      },
      {
        endpoint: 'test',
        limit: 5,
        remaining: 2,
        used: 3,
        resetTime: new Date(Date.now() + 3200000),
      },
      {
        endpoint: 'chat',
        limit: 50,
        remaining: 42,
        used: 8,
        resetTime: new Date(Date.now() + 3200000),
      }
    ]
    setRateLimits(mockData)
  }, [])

  const getStatusColor = (remaining: number, limit: number) => {
    const usage = (limit - remaining) / limit
    if (usage < 0.5) return 'text-green-600'
    if (usage < 0.8) return 'text-amber-600'
    return 'text-red-600'
  }

  const getProgressColor = (remaining: number, limit: number) => {
    const usage = (limit - remaining) / limit
    if (usage < 0.5) return 'bg-green-500'
    if (usage < 0.8) return 'bg-amber-500'
    return 'bg-red-500'
  }

  const ProgressWithColor = ({ value, remaining, limit }: { value: number; remaining: number; limit: number }) => {
    const colorClass = getProgressColor(remaining, limit)
    return (
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div 
          className={`h-full transition-all ${colorClass}`}
          style={{ width: `${value}%` }}
        />
      </div>
    )
  }

  const getStatusIcon = (remaining: number, limit: number) => {
    const usage = (limit - remaining) / limit
    if (usage < 0.5) return <CheckCircle className="w-4 h-4 text-green-600" />
    if (usage < 0.8) return <Clock className="w-4 h-4 text-amber-600" />
    return <AlertTriangle className="w-4 h-4 text-red-600" />
  }

  const formatTimeUntilReset = (resetTime: Date) => {
    const now = new Date()
    const diff = resetTime.getTime() - now.getTime()
    const minutes = Math.ceil(diff / 1000 / 60)
    
    if (minutes < 60) {
      return `${minutes}m`
    }
    
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }

  const formatEndpointName = (endpoint: string) => {
    const names: Record<string, string> = {
      'generate': 'Generate',
      'analyze': 'Analyze', 
      'test': 'Test',
      'chat': 'Chat'
    }
    return names[endpoint] || endpoint
  }

  if (compact) {
    const criticalLimits = rateLimits.filter(rl => rl.remaining / rl.limit < 0.3)
    
    if (criticalLimits.length === 0) {
      return (
        <div className={`flex items-center gap-2 text-sm text-green-600 ${className}`}>
          <CheckCircle className="w-4 h-4" />
          <span>All limits OK</span>
        </div>
      )
    }

    return (
      <div className={`space-y-1 ${className}`}>
        {criticalLimits.map((limit) => (
          <div key={limit.endpoint} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              {getStatusIcon(limit.remaining, limit.limit)}
              <span className="font-medium">{formatEndpointName(limit.endpoint)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {limit.remaining}/{limit.limit}
              </Badge>
              <span className="text-xs text-gray-500">
                resets in {formatTimeUntilReset(limit.resetTime)}
              </span>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Zap className="w-4 h-4" />
          API Rate Limits
          <Badge variant="outline" className="text-xs ml-auto">
            Updated {lastUpdate.toLocaleTimeString()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {rateLimits.map((limit) => {
          const usagePercent = ((limit.limit - limit.remaining) / limit.limit) * 100
          
          return (
            <div key={limit.endpoint} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(limit.remaining, limit.limit)}
                  <span className="font-medium text-sm">{formatEndpointName(limit.endpoint)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-mono ${getStatusColor(limit.remaining, limit.limit)}`}>
                    {limit.remaining}/{limit.limit}
                  </span>
                  <span className="text-xs text-gray-500">
                    resets in {formatTimeUntilReset(limit.resetTime)}
                  </span>
                </div>
              </div>
              
              <ProgressWithColor 
                value={usagePercent} 
                remaining={limit.remaining}
                limit={limit.limit}
              />
              
              {limit.remaining === 0 && (
                <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                  <AlertTriangle className="w-3 h-3 inline mr-1" />
                  Rate limit exceeded. Requests will fail until reset.
                </div>
              )}
            </div>
          )
        })}
        
        <div className="pt-2 border-t text-xs text-gray-500">
          Rate limits reset every hour. Limits are per user (or IP for anonymous users).
        </div>
      </CardContent>
    </Card>
  )
}