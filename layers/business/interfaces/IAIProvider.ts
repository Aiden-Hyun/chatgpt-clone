// Business layer interface - Port for AI API providers
import { ChatMessage } from '../entities/ChatMessage';

export interface AIStreamResponse {
  content: string;
  isComplete: boolean;
  error?: string;
}

export interface IAIProvider {
  /**
   * Generate AI response for messages
   */
  generateResponse(
    messages: ChatMessage[],
    model: string,
    onChunk?: (chunk: AIStreamResponse) => void
  ): Promise<string>;
  
  /**
   * Check if a model is supported
   */
  supportsModel(model: string): boolean;
  
  /**
   * Get available models
   */
  getAvailableModels(): string[];
  
  /**
   * Estimate cost for a request (in cents)
   */
  estimateCost(messages: ChatMessage[], model: string): number;
}
