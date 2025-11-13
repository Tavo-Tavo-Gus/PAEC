import { useState, useCallback } from 'react';
import { rateLimitHandler } from '@/lib/errorHandler';

interface UseApiWithRetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  onRetry?: (attempt: number, delay: number) => void;
  onRateLimited?: (retryAfter: number) => void;
}

export function useApiWithRetry<T extends any[], R>(
  apiFunction: (...args: T) => Promise<R>,
  options: UseApiWithRetryOptions = {}
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);

  const execute = useCallback(async (...args: T): Promise<R | null> => {
    setLoading(true);
    setError(null);
    setRetryAfter(null);

    try {
      const result = await rateLimitHandler.withRetry(
        () => apiFunction(...args),
        {
          maxRetries: options.maxRetries || 3,
          onRetry: (attempt, delay) => {
            options.onRetry?.(attempt, delay);
          }
        }
      );

      return result;
    } catch (err) {
      if (rateLimitHandler.isRateLimitError(err)) {
        const retryAfterMs = rateLimitHandler.getRetryAfter(err);
        setRetryAfter(retryAfterMs);
        setError(rateLimitHandler.createUserMessage(err));
        options.onRateLimited?.(retryAfterMs);
      } else {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, options]);

  const retry = useCallback(() => {
    setError(null);
    setRetryAfter(null);
  }, []);

  return {
    execute,
    retry,
    loading,
    error,
    retryAfter,
  };
}