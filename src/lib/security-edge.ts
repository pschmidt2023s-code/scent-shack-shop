/**
 * Enhanced security utilities for Supabase Edge Functions
 */

// Enhanced CORS headers with security
export const securityHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'",
};

// Rate limiting for edge functions using in-memory store
class EdgeRateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();

  constructor(
    private maxAttempts: number = 10,
    private windowMs: number = 15 * 60 * 1000 // 15 minutes
  ) {}

  isAllowed(key: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(key);

    if (!record || now > record.resetTime) {
      // Reset or first attempt
      this.attempts.set(key, { count: 1, resetTime: now + this.windowMs });
      return true;
    }

    if (record.count >= this.maxAttempts) {
      return false;
    }

    record.count++;
    return true;
  }

  getRemainingAttempts(key: string): number {
    const record = this.attempts.get(key);
    if (!record || Date.now() > record.resetTime) {
      return this.maxAttempts;
    }
    return Math.max(0, this.maxAttempts - record.count);
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.attempts.entries()) {
      if (now > record.resetTime) {
        this.attempts.delete(key);
      }
    }
  }
}

// Pre-configured rate limiters
export const authRateLimiter = new EdgeRateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes
export const paymentRateLimiter = new EdgeRateLimiter(3, 5 * 60 * 1000); // 3 attempts per 5 minutes
export const generalRateLimiter = new EdgeRateLimiter(50, 60 * 1000); // 50 requests per minute

// Get client identifier for rate limiting
export const getClientKey = (req: Request): string => {
  const ip = req.headers.get('x-forwarded-for') || 
            req.headers.get('x-real-ip') || 
            'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';
  return `${ip}:${userAgent.slice(0, 50)}`;
};

// Validate Origin header for CSRF protection
export const validateOrigin = (req: Request, allowedOrigins: string[]): boolean => {
  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');
  
  // For non-browser requests (no origin), check referer
  const sourceUrl = origin || referer;
  
  if (!sourceUrl) {
    return false; // Reject requests with no origin/referer
  }

  try {
    const url = new URL(sourceUrl);
    return allowedOrigins.some(allowed => {
      try {
        const allowedUrl = new URL(allowed);
        return url.hostname === allowedUrl.hostname;
      } catch {
        return false;
      }
    });
  } catch {
    return false;
  }
};

// Sanitize inputs for logging
export const sanitizeForLog = (data: any): any => {
  if (typeof data === 'string') {
    return data.replace(/[<>\"'&]/g, '');
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitizeForLog);
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      // Skip sensitive fields
      if (['password', 'token', 'secret', 'key'].some(sensitive => 
        key.toLowerCase().includes(sensitive)
      )) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeForLog(value);
      }
    }
    return sanitized;
  }
  
  return data;
};

// Security response helpers
export const createSecurityResponse = (
  data: any, 
  status: number = 200, 
  additionalHeaders: Record<string, string> = {}
): Response => {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...securityHeaders,
      ...additionalHeaders,
    },
  });
};

export const createRateLimitResponse = (remainingAttempts: number): Response => {
  return createSecurityResponse(
    { 
      error: 'Rate limit exceeded', 
      remainingAttempts,
      resetTime: Date.now() + 15 * 60 * 1000 
    }, 
    429,
    { 'Retry-After': '900' } // 15 minutes
  );
};

// Periodic cleanup for rate limiters
setInterval(() => {
  authRateLimiter.cleanup();
  paymentRateLimiter.cleanup();
  generalRateLimiter.cleanup();
}, 60 * 1000); // Cleanup every minute