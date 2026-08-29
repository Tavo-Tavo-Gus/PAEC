interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

export class RateLimitHandler {
  private defaultRetryConfig: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 30000, // 30 seconds
    backoffMultiplier: 2,
  };

  /**
   * Checks if an error is a rate limit error
   */
  isRateLimitError(error: any): boolean {
    if (error?.status) {
      return error.status === 429 || error.status === 503;
    }
    
    // Check for common rate limit error messages
    const message = error?.message?.toLowerCase() || '';
    return message.includes('rate limit') || 
           message.includes('too many requests') || 
           message.includes('service unavailable');
  }

  /**
   * Extracts retry-after header value
   */
  getRetryAfter(error: any): number {
    // Check for Retry-After header (in seconds)
    if (error?.headers?.['retry-after']) {
      return parseInt(error.headers['retry-after']) * 1000;
    }
    
    // Check for X-RateLimit-Reset header (timestamp)
    if (error?.headers?.['x-ratelimit-reset']) {
      const resetTime = parseInt(error.headers['x-ratelimit-reset']) * 1000;
      return Math.max(0, resetTime - Date.now());
    }
    
    return 0;
  }

  /**
   * Calculates delay for exponential backoff
   */
  calculateDelay(attempt: number, retryAfter?: number, config?: Partial<RetryConfig>): number {
    const finalConfig = { ...this.defaultRetryConfig, ...config };
    
    if (retryAfter && retryAfter > 0) {
      return Math.min(retryAfter, finalConfig.maxDelay);
    }
    
    const exponentialDelay = finalConfig.baseDelay * Math.pow(finalConfig.backoffMultiplier, attempt);
    const jitter = Math.random() * 0.1 * exponentialDelay; // Add 10% jitter
    
    return Math.min(exponentialDelay + jitter, finalConfig.maxDelay);
  }

  /**
   * Executes a function with automatic retry on rate limit errors
   */
  async withRetry<T>(
    fn: () => Promise<T>,
    config?: Partial<RetryConfig & { onRetry?: (attempt: number, delay: number) => void }>
  ): Promise<T> {
    const finalConfig = { ...this.defaultRetryConfig, ...config };
    let lastError: any;

    for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (!this.isRateLimitError(error) || attempt === finalConfig.maxRetries) {
          throw error;
        }

        const retryAfter = this.getRetryAfter(error);
        const delay = this.calculateDelay(attempt, retryAfter, finalConfig);
        
        config?.onRetry?.(attempt + 1, delay);
        
        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  /**
   * Creates a user-friendly error message
   */
  createUserMessage(error: any): string {
    if (error?.status === 429) {
      const retryAfter = this.getRetryAfter(error);
      if (retryAfter > 0) {
        const seconds = Math.ceil(retryAfter / 1000);
        return `Demasiadas solicitudes. Intenta de nuevo en ${seconds} segundos.`;
      }
      return 'Demasiadas solicitudes. Por favor, espera un momento antes de intentar de nuevo.';
    }
    
    if (error?.status === 503) {
      return 'El servicio está temporalmente no disponible. Intentando de nuevo...';
    }
    
    return 'Error de conexión. Reintentando automáticamente...';
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const rateLimitHandler = new RateLimitHandler();