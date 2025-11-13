interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyGenerator?: (endpoint: string, userId?: string) => string;
}

interface RequestRecord {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private requests: Map<string, RequestRecord> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = {
      keyGenerator: (endpoint, userId) => `${endpoint}:${userId || 'anonymous'}`,
      ...config,
    };
  }

  private generateKey(endpoint: string, userId?: string): string {
    return this.config.keyGenerator!(endpoint, userId);
  }

  private cleanupExpiredRecords(): void {
    const now = Date.now();
    for (const [key, record] of this.requests.entries()) {
      if (now >= record.resetTime) {
        this.requests.delete(key);
      }
    }
  }

  public isAllowed(endpoint: string, userId?: string): boolean {
    this.cleanupExpiredRecords();
    
    const key = this.generateKey(endpoint, userId);
    const now = Date.now();
    const record = this.requests.get(key);

    if (!record) {
      // First request for this key
      this.requests.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs,
      });
      return true;
    }

    if (now >= record.resetTime) {
      // Window has expired, reset
      this.requests.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs,
      });
      return true;
    }

    if (record.count >= this.config.maxRequests) {
      // Rate limit exceeded
      return false;
    }

    // Increment count
    record.count++;
    return true;
  }

  public getRemainingRequests(endpoint: string, userId?: string): number {
    const key = this.generateKey(endpoint, userId);
    const record = this.requests.get(key);
    
    if (!record || Date.now() >= record.resetTime) {
      return this.config.maxRequests;
    }
    
    return Math.max(0, this.config.maxRequests - record.count);
  }

  public getResetTime(endpoint: string, userId?: string): number {
    const key = this.generateKey(endpoint, userId);
    const record = this.requests.get(key);
    
    if (!record || Date.now() >= record.resetTime) {
      return 0;
    }
    
    return record.resetTime;
  }
}

// Rate limiter instances for different operations
export const apiRateLimiter = new RateLimiter({
  maxRequests: 100, // 100 requests
  windowMs: 60 * 1000, // per minute
});

export const authRateLimiter = new RateLimiter({
  maxRequests: 5, // 5 attempts
  windowMs: 15 * 60 * 1000, // per 15 minutes
});

export const databaseRateLimiter = new RateLimiter({
  maxRequests: 50, // 50 requests
  windowMs: 60 * 1000, // per minute
});

export { RateLimiter };