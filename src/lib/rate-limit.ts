import { Ratelimit } from '@upstash/ratelimit'

// Simple in-memory rate limiter for development
class SimpleRateLimiter {
  private limits = new Map<string, { count: number; window: number }>()

  async limit(key: string, maxRequests: number, windowMs: number) {
    const now = Date.now()
    const entry = this.limits.get(key)
    
    // Clean up expired entries
    if (entry && entry.window < now) {
      this.limits.delete(key)
    }
    
    const currentEntry = this.limits.get(key)
    
    if (!currentEntry) {
      // First request in window
      this.limits.set(key, { count: 1, window: now + windowMs })
      return {
        success: true,
        limit: maxRequests,
        remaining: maxRequests - 1,
        reset: new Date(now + windowMs)
      }
    } else {
      // Existing window
      if (currentEntry.count >= maxRequests) {
        // Rate limit exceeded
        return {
          success: false,
          limit: maxRequests,
          remaining: 0,
          reset: new Date(currentEntry.window)
        }
      } else {
        // Allow request
        currentEntry.count++
        return {
          success: true,
          limit: maxRequests,
          remaining: maxRequests - currentEntry.count,
          reset: new Date(currentEntry.window)
        }
      }
    }
  }
}

// Rate limit configurations for different endpoints
export const RATE_LIMIT_CONFIGS = {
  generate: {
    requests: 10,
    window: '1h',
    description: 'AI prompt generation'
  },
  analyze: {
    requests: 20, 
    window: '1h',
    description: 'Prompt analysis'
  },
  test: {
    requests: 5,
    window: '1h', 
    description: 'Prompt testing (expensive)'
  },
  chat: {
    requests: 50,
    window: '1h',
    description: 'Chat conversations'
  },
  save: {
    requests: 30,
    window: '1h',
    description: 'Save prompts'
  }
} as const

export type RateLimitEndpoint = keyof typeof RATE_LIMIT_CONFIGS

// Simple rate limiter instance for development
const simpleRateLimiter = new SimpleRateLimiter()

// Check if we're in production with KV available
const isProduction = process.env.VERCEL_ENV === 'production' || process.env.KV_REST_API_URL

// Initialize rate limiters
let rateLimitersInstance: any = null

if (isProduction) {
  try {
    const { kv } = require('@vercel/kv')
    console.log('[RATE_LIMIT] Using Vercel KV for production rate limiting')
    
    rateLimitersInstance = {
      generate: new Ratelimit({
        redis: kv,
        limiter: Ratelimit.slidingWindow(RATE_LIMIT_CONFIGS.generate.requests, RATE_LIMIT_CONFIGS.generate.window),
        analytics: true,
        prefix: 'ratelimit:generate'
      }),
      analyze: new Ratelimit({
        redis: kv,
        limiter: Ratelimit.slidingWindow(RATE_LIMIT_CONFIGS.analyze.requests, RATE_LIMIT_CONFIGS.analyze.window),
        analytics: true,
        prefix: 'ratelimit:analyze'
      }),
      test: new Ratelimit({
        redis: kv,
        limiter: Ratelimit.slidingWindow(RATE_LIMIT_CONFIGS.test.requests, RATE_LIMIT_CONFIGS.test.window),
        analytics: true,
        prefix: 'ratelimit:test'
      }),
      chat: new Ratelimit({
        redis: kv,
        limiter: Ratelimit.slidingWindow(RATE_LIMIT_CONFIGS.chat.requests, RATE_LIMIT_CONFIGS.chat.window),
        analytics: true,
        prefix: 'ratelimit:chat'
      }),
      save: new Ratelimit({
        redis: kv,
        limiter: Ratelimit.slidingWindow(RATE_LIMIT_CONFIGS.save.requests, RATE_LIMIT_CONFIGS.save.window),
        analytics: true,
        prefix: 'ratelimit:save'
      })
    }
  } catch (error) {
    console.error('[RATE_LIMIT] Failed to initialize KV, falling back to simple rate limiter:', error)
    rateLimitersInstance = null
  }
} else {
  console.log('[RATE_LIMIT] Using simple in-memory rate limiting for development')
  rateLimitersInstance = null
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: Date
  retryAfter?: number
}

/**
 * Apply rate limiting to a request
 */
export async function applyRateLimit(
  endpoint: RateLimitEndpoint,
  identifier: string
): Promise<RateLimitResult> {
  try {
    const config = RATE_LIMIT_CONFIGS[endpoint]
    
    if (rateLimitersInstance && rateLimitersInstance[endpoint]) {
      // Use Redis-based rate limiter (production)
      const rateLimiter = rateLimitersInstance[endpoint]
      const result = await rateLimiter.limit(identifier)
      
      return {
        success: result.success,
        limit: result.limit,
        remaining: result.remaining,
        reset: result.reset,
        retryAfter: result.success ? undefined : Math.ceil((result.reset.getTime() - Date.now()) / 1000)
      }
    } else {
      // Use simple in-memory rate limiter (development)
      const windowMs = config.window === '1h' ? 3600000 : 3600000 // Default to 1 hour
      const key = `${endpoint}:${identifier}`
      const result = await simpleRateLimiter.limit(key, config.requests, windowMs)
      
      return {
        success: result.success,
        limit: result.limit,
        remaining: result.remaining,
        reset: result.reset,
        retryAfter: result.success ? undefined : Math.ceil((result.reset.getTime() - Date.now()) / 1000)
      }
    }
  } catch (error) {
    console.error('[RATE_LIMIT] Error applying rate limit:', error)
    // Fail open - allow request if rate limiting fails
    return {
      success: true,
      limit: RATE_LIMIT_CONFIGS[endpoint].requests,
      remaining: RATE_LIMIT_CONFIGS[endpoint].requests - 1,
      reset: new Date(Date.now() + 3600000) // 1 hour from now
    }
  }
}

/**
 * Get user identifier for rate limiting
 * Prioritizes user ID, falls back to IP address
 */
export function getUserIdentifier(request: Request, userId?: string): string {
  if (userId) {
    return `user:${userId}`
  }
  
  // Try to get IP from various headers (Vercel, Cloudflare, etc.)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0] || realIp || 'unknown'
  
  return `ip:${ip}`
}

/**
 * Create rate limit error response
 */
export function createRateLimitErrorResponse(
  endpoint: RateLimitEndpoint,
  result: RateLimitResult
) {
  const config = RATE_LIMIT_CONFIGS[endpoint]
  
  // Create user-friendly time formatting
  const retryAfter = result.retryAfter || 0
  const minutes = Math.ceil(retryAfter / 60)
  const timeStr = retryAfter < 60 
    ? `${retryAfter} seconds` 
    : `${minutes} minute${minutes > 1 ? 's' : ''}`

  // Endpoint-specific messages
  const endpointMessages: Record<RateLimitEndpoint, string> = {
    generate: 'You\'ve reached the limit for prompt generation requests.',
    analyze: 'You\'ve reached the limit for prompt analysis requests.',
    test: 'You\'ve reached the limit for prompt testing. Testing uses 2x API calls, so limits are stricter.',
    chat: 'You\'ve reached the limit for chat conversations.',
    save: 'You\'ve reached the limit for saving prompts.'
  }
  
  return Response.json(
    {
      error: 'Rate limit exceeded',
      message: `${endpointMessages[endpoint]} You can make ${result.remaining} more requests. Try again in ${timeStr}.`,
      details: {
        endpoint,
        limit: result.limit,
        remaining: result.remaining,
        reset: result.reset.toISOString(),
        retryAfter: result.retryAfter,
        window: config.window,
        friendlyMessage: `Rate limit reached for ${config.description}. Try again in ${timeStr}.`
      }
    },
    {
      status: 429,
      headers: {
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': result.reset.getTime().toString(),
        'Retry-After': result.retryAfter?.toString() || '3600'
      }
    }
  )
}

/**
 * Middleware helper for rate limiting API routes
 */
export async function withRateLimit<T>(
  request: Request,
  endpoint: RateLimitEndpoint,
  userId: string | undefined,
  handler: () => Promise<T>
): Promise<T | Response> {
  const identifier = getUserIdentifier(request, userId)
  const rateLimitResult = await applyRateLimit(endpoint, identifier)
  
  if (!rateLimitResult.success) {
    console.warn(`[RATE_LIMIT] ${endpoint} rate limit exceeded for ${identifier}`, {
      limit: rateLimitResult.limit,
      remaining: rateLimitResult.remaining,
      reset: rateLimitResult.reset
    })
    
    return createRateLimitErrorResponse(endpoint, rateLimitResult)
  }
  
  console.log(`[RATE_LIMIT] ${endpoint} request allowed for ${identifier}`, {
    remaining: rateLimitResult.remaining,
    reset: rateLimitResult.reset
  })
  
  return handler()
}