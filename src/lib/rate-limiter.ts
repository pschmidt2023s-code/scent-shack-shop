/**
 * Enhanced client-side rate limiting with security monitoring
 */

export interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs?: number;
}

export class EnhancedRateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private blockedUntil: Map<string, number> = new Map();
  
  constructor(
    private config: RateLimitConfig
  ) {}
  
  isAllowed(key: string): boolean {
    const now = Date.now();
    
    // Check if currently blocked
    const blockExpiry = this.blockedUntil.get(key);
    if (blockExpiry && now < blockExpiry) {
      return false;
    }
    
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const recentAttempts = attempts.filter(time => now - time < this.config.windowMs);
    
    if (recentAttempts.length >= this.config.maxAttempts) {
      // Block the key for additional time if configured
      if (this.config.blockDurationMs) {
        this.blockedUntil.set(key, now + this.config.blockDurationMs);
      }
      return false;
    }
    
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    return true;
  }
  
  reset(key: string): void {
    this.attempts.delete(key);
    this.blockedUntil.delete(key);
  }
  
  getRemainingAttempts(key: string): number {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    const recentAttempts = attempts.filter(time => now - time < this.config.windowMs);
    return Math.max(0, this.config.maxAttempts - recentAttempts.length);
  }
  
  getBlockTimeRemaining(key: string): number {
    const blockExpiry = this.blockedUntil.get(key);
    if (!blockExpiry) return 0;
    return Math.max(0, blockExpiry - Date.now());
  }
}

// Predefined rate limiters for common use cases
export const authRateLimiter = new EnhancedRateLimiter({
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  blockDurationMs: 30 * 60 * 1000 // 30 minutes block after limit
});

export const apiRateLimiter = new EnhancedRateLimiter({
  maxAttempts: 100,
  windowMs: 60 * 1000, // 1 minute
  blockDurationMs: 5 * 60 * 1000 // 5 minutes block
});

export const chatRateLimiter = new EnhancedRateLimiter({
  maxAttempts: 10,
  windowMs: 60 * 1000, // 1 minute
  blockDurationMs: 2 * 60 * 1000 // 2 minutes block
});

export const newsletterRateLimiter = new EnhancedRateLimiter({
  maxAttempts: 3,
  windowMs: 60 * 1000, // 1 minute
  blockDurationMs: 10 * 60 * 1000 // 10 minutes block
});