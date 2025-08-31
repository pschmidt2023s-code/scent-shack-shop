/**
 * Security utilities for enhanced protection
 */

// Content Security Policy configuration
export const CSP_DIRECTIVES = {
  'default-src': "'self'",
  'script-src': "'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://checkout.stripe.com",
  'style-src': "'self' 'unsafe-inline' https://fonts.googleapis.com",
  'font-src': "'self' https://fonts.gstatic.com",
  'img-src': "'self' data: https: blob:",
  'connect-src': "'self' https://api.stripe.com https://tqswuibgnkdvrfocwjou.supabase.co wss://tqswuibgnkdvrfocwjou.supabase.co",
  'frame-src': "'self' https://js.stripe.com https://checkout.stripe.com",
  'object-src': "'none'",
  'base-uri': "'self'",
  'form-action': "'self'"
};

// Generate CSP header string
export const generateCSPHeader = (): string => {
  return Object.entries(CSP_DIRECTIVES)
    .map(([directive, value]) => `${directive} ${value}`)
    .join('; ');
};

// Rate limiting helper for client-side
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 15 * 60 * 1000 // 15 minutes
  ) {}
  
  isAllowed(key: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const recentAttempts = attempts.filter(time => now - time < this.windowMs);
    
    if (recentAttempts.length >= this.maxAttempts) {
      return false;
    }
    
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    return true;
  }
  
  reset(key: string): void {
    this.attempts.delete(key);
  }
}

// Auth rate limiter instances
export const authRateLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes
export const newsletterRateLimiter = new RateLimiter(3, 60 * 1000); // 3 attempts per minute

// Secure random string generation
export const generateSecureToken = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomArray = new Uint8Array(length);
  crypto.getRandomValues(randomArray);
  
  for (let i = 0; i < length; i++) {
    result += chars[randomArray[i] % chars.length];
  }
  
  return result;
};

// Secure headers for fetch requests
export const getSecureHeaders = (additionalHeaders: HeadersInit = {}): HeadersInit => {
  return {
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    ...additionalHeaders
  };
};

// Validate and sanitize URLs
export const validateUrl = (url: string, allowedDomains?: string[]): { isValid: boolean; sanitizedUrl?: string } => {
  if (!url || typeof url !== 'string') {
    return { isValid: false };
  }
  
  try {
    const urlObj = new URL(url);
    
    // Only allow http and https
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { isValid: false };
    }
    
    // Check allowed domains if specified
    if (allowedDomains && !allowedDomains.some(domain => 
      urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain)
    )) {
      return { isValid: false };
    }
    
    return { 
      isValid: true, 
      sanitizedUrl: urlObj.toString() 
    };
  } catch {
    return { isValid: false };
  }
};

// Data masking for sensitive information
export const maskEmail = (email: string): string => {
  if (!email || !email.includes('@')) return '***';
  
  const [local, domain] = email.split('@');
  const maskedLocal = local.length > 2 
    ? local[0] + '*'.repeat(local.length - 2) + local.slice(-1)
    : '*'.repeat(local.length);
  
  return `${maskedLocal}@${domain}`;
};

export const maskPhoneNumber = (phone: string): string => {
  if (!phone) return '***';
  
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 4) return '*'.repeat(cleaned.length);
  
  return '*'.repeat(cleaned.length - 4) + cleaned.slice(-4);
};