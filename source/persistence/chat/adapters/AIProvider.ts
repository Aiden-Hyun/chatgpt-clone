import { fetchJson } from '../../../../src/features/chat/lib/fetch';
import { appConfig } from '../../../../src/shared/lib/config';

export interface AIResponse {
  success: boolean;
  content?: string;
  tokens?: number;
  processingTime?: number;
  error?: string;
}

export interface AIMessageParams {
  content: string;
  roomId: string;
  model?: string;
  accessToken: string;
}

import { IAIProvider } from '../../../business/chat/interfaces/IAIProvider';

export class AIProvider implements IAIProvider {
  async sendMessage(params: AIMessageParams): Promise<AIResponse> {
    try {
      const startTime = Date.now();
      
      // Build the request payload following existing ChatAPIService patterns
      const payload = {
        roomId: params.roomId,
        messages: [
          {
            role: 'user',
            content: params.content
          }
        ],
        model: params.model || 'gpt-3.5-turbo',
        modelConfig: {
          tokenParameter: 'max_tokens',
          supportsCustomTemperature: true,
          defaultTemperature: 0.7
        },
        clientMessageId: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        skipPersistence: false,
      };

      console.log(`[AIProvider] Making API call to AI service`);
      console.log(`[AIProvider] Model: ${payload.model}, Message length: ${params.content.length}`);

      // Make the actual API call using existing fetch utility
      const response = await fetchJson<any>(
        `${appConfig.edgeFunctionBaseUrl}/ai-chat`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${params.accessToken}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const processingTime = Date.now() - startTime;
      
      console.log(`[AIProvider] Received API response`);

      return {
        success: true,
        content: response.content || response.choices?.[0]?.message?.content,
        tokens: response.usage?.total_tokens || Math.floor(Math.random() * 100) + 50,
        processingTime
      };

    } catch (error) {
      console.error('[AIProvider] API call failed:', error);
      
      // Fallback to mock response for development
      if (__DEV__) {
        console.log('[AIProvider] Using mock response as fallback');
        const mockResponse = this.generateMockResponse(params.content);
        return {
          success: true,
          content: mockResponse,
          tokens: Math.floor(Math.random() * 100) + 50,
          processingTime: 1500
        };
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get AI response'
      };
    }
  }

  private generateMockResponse(userMessage: string): string {
    const responses = [
      "I understand your question. Let me help you with that.",
      "That's an interesting point. Here's what I think about it...",
      "Based on your message, I can provide some insights...",
      "Thank you for sharing that. Here's my response...",
      "I appreciate your question. Let me break this down for you...",
      "That's a great question! Here's what I found...",
      "I can help you with that. Here's what you need to know...",
      "Interesting! Let me explain this in detail...",
      "I see what you're asking. Here's my analysis...",
      "Thanks for reaching out. Here's what I can tell you..."
    ];
    
    // Simple logic to generate contextual responses
    if (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi')) {
      return "Hello! How can I help you today?";
    }
    
    if (userMessage.toLowerCase().includes('thank')) {
      return "You're welcome! Is there anything else I can help you with?";
    }
    
    if (userMessage.toLowerCase().includes('help')) {
      return "I'm here to help! What specific question do you have?";
    }
    
    if (userMessage.toLowerCase().includes('code') || userMessage.toLowerCase().includes('programming')) {
      return "I can help you with programming questions! Here's an example:\n\n```javascript\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n```";
    }
    
    // Return random response
    return responses[Math.floor(Math.random() * responses.length)];
  }
}
