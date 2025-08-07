import { IAIService } from '../types/interfaces/IAIService';

/**
 * ConcurrentAIService implements IAIService for AI API communication.
 * 
 * This service handles communication with the Supabase edge function
 * for AI chat functionality, supporting both regular and streaming responses.
 * 
 * Follows SOLID principles:
 * - Single Responsibility: Only handles AI service communication
 * - Open/Closed: Extensible for different AI providers
 * - Liskov Substitution: Implements IAIService interface
 * - Interface Segregation: Focused interface contract
 * - Dependency Inversion: Depends on abstractions
 */
export class ConcurrentAIService implements IAIService {
  private readonly EDGE_FUNCTION_BASE_URL = 'https://twzumsgzuwguketxbdet.functions.supabase.co';

  /**
   * Send a message to the AI service and get a response.
   * 
   * @param request - The request object containing roomId, messages, and model
   * @param session - The session object containing authentication tokens
   * @returns Promise that resolves with the AI response
   */
  async sendMessage(request: any, session: any): Promise<any> {
    // Validation
    if (!request) {
      throw new Error('Invalid request object');
    }
    if (!session) {
      throw new Error('Invalid session object');
    }
    if (!session.access_token) {
      throw new Error('No access token available');
    }
    if (!request.messages || !Array.isArray(request.messages)) {
      throw new Error('Messages array is required');
    }
    if (!request.model) {
      throw new Error('Model is required');
    }

    try {
      const response = await fetch(`${this.EDGE_FUNCTION_BASE_URL}/openai-chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log('🔍 API Error:', errorText);
        throw new Error(`AI API error: ${response.status} - ${response.statusText || 'Internal Server Error'}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // Re-throw with more context
      throw new Error(`Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Send a message to the AI service with streaming response.
   * 
   * @param request - The request object containing roomId, messages, and model
   * @param session - The session object containing authentication tokens
   * @param onChunk - Callback function to handle streaming chunks
   * @returns Promise that resolves when streaming is complete
   */
  async sendMessageWithStreaming(request: any, session: any, onChunk: (chunk: string) => void): Promise<any> {
    // Validation
    if (!request) {
      throw new Error('Invalid request object');
    }
    if (!session) {
      throw new Error('Invalid session object');
    }
    if (!session.access_token) {
      throw new Error('No access token available');
    }
    if (!onChunk || typeof onChunk !== 'function') {
      throw new Error('onChunk callback is required');
    }

    try {
      const response = await fetch(`${this.EDGE_FUNCTION_BASE_URL}/openai-chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...request,
          stream: true, // Enable streaming
        }),
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status} - ${response.statusText || 'Internal Server Error'}`);
      }

      if (!response.body) {
        throw new Error('Response body is not available for streaming');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6); // Remove 'data: ' prefix
              
              if (data === '[DONE]') {
                // Streaming complete
                return {
                  id: `stream-${Date.now()}`,
                  content: fullContent,
                  model: request.model || 'gpt-3.5-turbo',
                  timestamp: Date.now(),
                  streamed: true,
                };
              }

              try {
                const parsed = JSON.parse(data);
                if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta) {
                  const content = parsed.choices[0].delta.content;
                  if (content) {
                    fullContent += content;
                    onChunk(content);
                  }
                }
              } catch (parseError) {
                // Ignore parse errors for malformed JSON in stream
                console.warn('Failed to parse streaming chunk:', parseError);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      return {
        id: `stream-${Date.now()}`,
        content: fullContent,
        model: request.model || 'gpt-3.5-turbo',
        timestamp: Date.now(),
        streamed: true,
      };
    } catch (error) {
      // Re-throw with more context
      throw new Error(`Failed to send streaming message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get the base URL for the edge function.
   * Useful for testing and configuration.
   */
  getBaseUrl(): string {
    return this.EDGE_FUNCTION_BASE_URL;
  }

  /**
   * Set a custom base URL for the edge function.
   * Useful for testing and different environments.
   */
  setBaseUrl(url: string): void {
    if (!url || typeof url !== 'string') {
      throw new Error('Base URL must be a non-empty string');
    }
    (this as any).EDGE_FUNCTION_BASE_URL = url;
  }
} 