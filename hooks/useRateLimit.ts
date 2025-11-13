import { useState, useCallback } from 'react';
import { RateLimiter } from '@/lib/rateLimiter';

interface UseRateLimitOptions {
  maxRequests: number;
  windowMs: number;
  onRateLimited?: (resetTime: number) => void;
}

export function useRateLimit(options: UseRateLimitOptions) {
  const [rateLimiter] = useState(() => new RateLimiter({
    maxRequests: options.maxRequests,
    windowMs: options.windowMs,
  }));

  const [isRateLimited, setIsRateLimited] = useState(false);
  const [resetTime, setResetTime] = useState(0);

  const checkRateLimit = useCallback((key: string, userId?: string): boolean => {
    const allowed = rateLimiter.isAllowed(key, userId);
    
    if (!allowed) {
      const resetTime = rateLimiter.getResetTime(key, userId);
      setIsRateLimited(true);
      setResetTime(resetTime);
      options.onRateLimited?.(resetTime);
      return false;
    }

    setIsRateLimited(false);
    setResetTime(0);
    return true;
  }, [rateLimiter, options]);

  const getRemainingRequests = useCallback((key: string, userId?: string): number => {
    return rateLimiter.getRemainingRequests(key, userId);
  }, [rateLimiter]);

  const getTimeUntilReset = useCallback((key: string, userId?: string): number => {
    const resetTime = rateLimiter.getResetTime(key, userId);
    return Math.max(0, resetTime - Date.now());
  }, [rateLimiter]);

  return {
    checkRateLimit,
    getRemainingRequests,
    getTimeUntilReset,
    isRateLimited,
    resetTime,
  };
}