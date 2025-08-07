/**
 * Interface for message processing in the concurrent chat system.
 * Follows SOLID principles with single responsibility for message processing.
 * 
 * This interface defines the contract for any message processor implementation,
 * allowing for flexible message types and async processing.
 */

/**
 * Represents a message in the concurrent chat system
 */
export interface ConcurrentMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  timestamp: number;
  roomId?: number;
  model?: string;
  error?: string;
  metadata?: Record<string, any>;
}

export interface IMessageProcessor {
  /**
   * Process a message asynchronously.
   * 
   * @param message - The message to process. Can be any type (string, object, null, undefined)
   * @returns Promise that resolves when processing is complete
   */
  process(message: any): Promise<any>;
}

/**
 * Default implementation of IMessageProcessor for testing purposes.
 * This provides a concrete implementation that satisfies the interface contract.
 */
export class DefaultMessageProcessor implements IMessageProcessor {
  async process(message: any): Promise<any> {
    // Default implementation - just return the message
    return Promise.resolve(message);
  }
}

/**
 * Factory function to create a message processor instance.
 * This allows the tests to work with concrete implementations.
 */
export function createMessageProcessor(): IMessageProcessor {
  return new DefaultMessageProcessor();
} 