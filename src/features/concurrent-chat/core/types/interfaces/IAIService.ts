/**
 * Interface for AI service communication in the concurrent chat system.
 * Follows SOLID principles with single responsibility for AI service interaction.
 * 
 * This interface defines the contract for any AI service implementation,
 * supporting both regular message sending and streaming responses.
 */
export interface IAIService {
  /**
   * Send a message to the AI service and get a response.
   * 
   * @param request - The request object containing roomId, messages, and model
   * @param session - The session object containing authentication tokens
   * @returns Promise that resolves with the AI response
   */
  sendMessage(request: any, session: any): Promise<any>;

  /**
   * Send a message to the AI service with streaming response.
   * 
   * @param request - The request object containing roomId, messages, and model
   * @param session - The session object containing authentication tokens
   * @param onChunk - Callback function to handle streaming chunks
   * @returns Promise that resolves when streaming is complete
   */
  sendMessageWithStreaming(request: any, session: any, onChunk: (chunk: string) => void): Promise<any>;
}

/**
 * Default implementation of IAIService for testing purposes.
 * This provides a concrete implementation that satisfies the interface contract.
 */
export class DefaultAIService implements IAIService {
  async sendMessage(request: any, session: any): Promise<any> {
    // Default implementation - return a mock response
    return Promise.resolve({
      id: 'mock-response-id',
      content: 'Mock AI response',
      model: request?.model || 'gpt-3.5-turbo',
      timestamp: Date.now()
    });
  }

  async sendMessageWithStreaming(request: any, session: any, onChunk: (chunk: string) => void): Promise<any> {
    // Default implementation - simulate streaming
    const mockChunks = ['Hello', ' ', 'world', '!'];
    
    for (const chunk of mockChunks) {
      onChunk(chunk);
      // Simulate some delay between chunks
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    return Promise.resolve({
      id: 'mock-streaming-response-id',
      content: mockChunks.join(''),
      model: request?.model || 'gpt-3.5-turbo',
      timestamp: Date.now()
    });
  }
}

/**
 * Factory function to create an AI service instance.
 * This allows the tests to work with concrete implementations.
 */
export function createAIService(): IAIService {
  return new DefaultAIService();
} 