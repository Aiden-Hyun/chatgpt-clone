// src/features/chat/services/interfaces/IAIApiService.ts
import type { AIApiRequest, AIApiResponse } from "@/entities/message";

export interface IAIApiService {
  /**
   * Send a request to the AI API and get a response
   */
  sendMessage(
    request: AIApiRequest,
    accessToken: string,
    isSearchMode?: boolean
  ): Promise<AIApiResponse>;
}
