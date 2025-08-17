// src/features/chat/services/implementations/ChatAPIService.ts
import { appConfig } from '@/shared/lib/config';
import { fetchJson } from '../../lib/fetch';
import { IAIApiService } from '../interfaces/IAIApiService';
import { AIApiRequest, AIApiResponse } from '../types';

export class ChatAPIService implements IAIApiService {
  async sendMessage(request: AIApiRequest, accessToken: string): Promise<AIApiResponse> {
    // Consolidated from legacy/fetchOpenAIResponse.ts with abort + timeout support via fetchJson
    const payload = {
      roomId: request.roomId,
      messages: request.messages,
      model: request.model,
      // Include idempotency and persistence control so the edge function can upsert reliably
      clientMessageId: request.clientMessageId,
      skipPersistence: request.skipPersistence,
      // Include search query for server-side search
      searchQuery: request.searchQuery,
    };

    console.log(`[ChatAPIService] Making API call for model: ${request.model}`);
    console.log(`[ChatAPIService] Request payload:`, {
      model: request.model,
      messageCount: request.messages.length,
    });

    const url = `${appConfig.edgeFunctionBaseUrl}/ai-chat`;
    const response = await fetchJson<AIApiResponse>(
      url,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      },
    );
    console.log(`[ChatAPIService] Received API response for model: ${request.model}`);
    return response;
  }
} 