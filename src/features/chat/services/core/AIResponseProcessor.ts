// src/features/chat/services/core/AIResponseProcessor.ts
import type { AIApiResponse } from "@/entities/message";

export interface IAIResponseProcessor {
  validateResponse(response: AIApiResponse): boolean;
  extractContent(response: AIApiResponse): string | null;
}

export class OpenAIResponseProcessor implements IAIResponseProcessor {
  validateResponse(response: AIApiResponse): boolean {
    // Handle search responses (direct content format)
    if (response.content) {
      return true;
    }

    // Handle chat responses (choices format)
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

    // Handle search responses (direct content format)
    if (response.content) {
      return response.content;
    }

    // Handle chat responses (choices format)
    return response.choices![0].message.content;
  }
}
