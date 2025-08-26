// OpenAI API provider implementation
import { ChatMessage } from '../../business/entities/ChatMessage';
import { AIStreamResponse, IAIProvider } from '../../business/interfaces/IAIProvider';

export class OpenAIProvider implements IAIProvider {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
    this.baseUrl = 'https://api.openai.com/v1';
    
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }
  }

  async generateResponse(
    messages: ChatMessage[],
    model: string,
    onChunk?: (chunk: AIStreamResponse) => void
  ): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          stream: !!onChunk,
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      if (onChunk) {
        return this.handleStreamResponse(response, onChunk);
      } else {
        const data = await response.json();
        return data.choices[0]?.message?.content || '';
      }
    } catch (error) {
      console.error('OpenAI provider error:', error);
      throw error;
    }
  }

  private async handleStreamResponse(
    response: Response,
    onChunk: (chunk: AIStreamResponse) => void
  ): Promise<string> {
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response stream available');
    }

    let fullContent = '';
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          onChunk({ content: fullContent, isComplete: true });
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim() !== '');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              onChunk({ content: fullContent, isComplete: true });
              return fullContent;
            }

            try {
              const parsed = JSON.parse(data);
              const deltaContent = parsed.choices[0]?.delta?.content || '';
              
              if (deltaContent) {
                fullContent += deltaContent;
                onChunk({ 
                  content: fullContent, 
                  isComplete: false 
                });
              }
            } catch (parseError) {
              // Skip invalid JSON chunks
              continue;
            }
          }
        }
      }
    } catch (error) {
      onChunk({ 
        content: fullContent, 
        isComplete: true, 
        error: error instanceof Error ? error.message : 'Stream error' 
      });
      throw error;
    } finally {
      reader.releaseLock();
    }

    return fullContent;
  }

  supportsModel(model: string): boolean {
    const supportedModels = [
      'gpt-3.5-turbo',
      'gpt-4',
      'gpt-4-turbo',
      'gpt-4o',
      'gpt-4o-mini'
    ];
    return supportedModels.includes(model);
  }

  getAvailableModels(): string[] {
    return [
      'gpt-3.5-turbo',
      'gpt-4',
      'gpt-4-turbo',
      'gpt-4o',
      'gpt-4o-mini'
    ];
  }

  estimateCost(messages: ChatMessage[], model: string): number {
    // Rough cost estimation in cents
    const totalTokens = messages.reduce((sum, msg) => {
      return sum + Math.ceil(msg.content.length / 4);
    }, 0);

    const costs: Record<string, number> = {
      'gpt-3.5-turbo': 0.0015, // per 1K tokens
      'gpt-4': 0.03,
      'gpt-4-turbo': 0.01,
      'gpt-4o': 0.005,
      'gpt-4o-mini': 0.00015
    };

    const costPerToken = costs[model] || costs['gpt-3.5-turbo'];
    return Math.ceil((totalTokens / 1000) * costPerToken * 100); // in cents
  }
}
