import { NextRequest, NextResponse } from 'next/server'
import { applyRateLimit, createRateLimitErrorResponse, getUserIdentifier, RateLimitEndpoint } from '@/lib/rate-limit'

// Routes that should be rate limited
const RATE_LIMITED_ROUTES = {
  '/api/ai/generate': 'generate' as RateLimitEndpoint,
  '/api/ai/analyze': 'analyze' as RateLimitEndpoint,
  '/api/ai/test': 'test' as RateLimitEndpoint,
  '/api/ai/chat': 'chat' as RateLimitEndpoint,
  '/api/prompts': 'save' as RateLimitEndpoint, // Assuming this is for saving prompts
} as const

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Check if this route should be rate limited
  const endpoint = RATE_LIMITED_ROUTES[pathname as keyof typeof RATE_LIMITED_ROUTES]
  
  if (!endpoint) {
    // No rate limiting needed for this route
    return NextResponse.next()
  }
  
  try {
    // Get user identifier (we'll need to extract user ID from request if available)
    // For now, we'll use IP-based rate limiting since we don't have user context in middleware
    const identifier = getUserIdentifier(request)
    
    // Apply rate limiting
    const rateLimitResult = await applyRateLimit(endpoint, identifier)
    
    if (!rateLimitResult.success) {
      console.warn(`[MIDDLEWARE] Rate limit exceeded for ${endpoint} at ${pathname}`, {
        identifier,
        remaining: rateLimitResult.remaining,
        reset: rateLimitResult.reset
      })
      
      return createRateLimitErrorResponse(endpoint, rateLimitResult)
    }
    
    // Add rate limit headers to successful requests
    const response = NextResponse.next()
    response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString())
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
    response.headers.set('X-RateLimit-Reset', rateLimitResult.reset.getTime().toString())
    
    console.log(`[MIDDLEWARE] Rate limit check passed for ${endpoint}`, {
      identifier,
      remaining: rateLimitResult.remaining
    })
    
    return response
    
  } catch (error) {
    console.error('[MIDDLEWARE] Rate limiting error:', error)
    // Fail open - allow request if rate limiting fails
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    // Match API routes that need rate limiting
    '/api/ai/:path*',
    '/api/prompts/:path*'
  ]
}