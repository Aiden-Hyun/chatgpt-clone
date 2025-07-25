// src/features/chat/services/core/RetryService.ts
export interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  exponentialBackoff?: boolean;
}

export class RetryService {
  constructor(private config: RetryConfig) {}

  async retryOperation<T>(
    operation: () => Promise<T>,
    operationName: string,
    retryCount = 0
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (retryCount < this.config.maxRetries) {
        const delay = this.config.exponentialBackoff 
          ? this.config.retryDelay * Math.pow(2, retryCount)
          : this.config.retryDelay;
        
        await this.delay(delay);
        return this.retryOperation(operation, operationName, retryCount + 1);
      }
      
      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 