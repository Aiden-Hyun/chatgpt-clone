// src/features/chat/services/core/AIResponseProcessor.ts
import { AIApiResponse } from '../types';

export interface IAIResponseProcessor {
  validateResponse(response: AIApiResponse): boolean;
  extractContent(response: AIApiResponse): string | null;
}

export class OpenAIResponseProcessor implements IAIResponseProcessor {
  validateResponse(response: AIApiResponse): boolean {
    if (!response || !response.choices || !Array.isArray(response.choices)) {
      return false;
    }

    const firstChoice = response.choices[0];
    if (!firstChoice || !firstChoice.message || !firstChoice.message.content) {
      return false;
    }

    return true;
  }

  extractContent(response: AIApiResponse): string | null {
    if (!this.validateResponse(response)) {
      return null;
    }

    return response.choices[0].message.content;
  }
} 