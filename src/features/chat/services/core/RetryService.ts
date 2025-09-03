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
    retryCount = 0,
    signal?: AbortSignal
  ): Promise<T> {
    try {
      // Respect abort before starting
      if (signal?.aborted) {
        const error = new Error("The operation was aborted");
        (error as { name: string }).name = "AbortError";
        throw error;
      }
      return await operation();
    } catch (error) {
      // Do not retry on Abort/Timeout
      const name = (error as { name?: string })?.name;
      if (name === "AbortError" || name === "TimeoutError") {
        throw error;
      }
      if (retryCount < this.config.maxRetries) {
        const delay = this.config.exponentialBackoff
          ? this.config.retryDelay * Math.pow(2, retryCount)
          : this.config.retryDelay;

        await this.delay(delay, signal);
        return this.retryOperation(
          operation,
          operationName,
          retryCount + 1,
          signal
        );
      }

      throw error;
    }
  }

  private delay(ms: number, signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      if (signal?.aborted) {
        const error = new Error("The operation was aborted");
        (error as { name: string }).name = "AbortError";
        reject(error);
        return;
      }
      const id = setTimeout(() => {
        resolve();
      }, ms);
      if (signal) {
        const onAbort = () => {
          clearTimeout(id);
          const error = new Error("The operation was aborted");
          (error as { name: string }).name = "AbortError";
          reject(error);
        };
        signal.addEventListener("abort", onAbort, { once: true });
      }
    });
  }
}
