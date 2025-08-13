// src/features/chat/services/implementations/OpenAIAPIService.ts
import { appConfig } from '@/shared/lib/config';
import { fetchJson } from '../../lib/fetch';
import { IAIApiService } from '../interfaces/IAIApiService';
import { AIApiRequest, AIApiResponse } from '../types';

export class OpenAIAPIService implements IAIApiService {
  async sendMessage(request: AIApiRequest, accessToken: string): Promise<AIApiResponse> {
    // Consolidated from legacy/fetchOpenAIResponse.ts with abort + timeout support via fetchJson
    const payload = {
      roomId: request.roomId,
      messages: request.messages,
      model: request.model,
      // Include idempotency and persistence control so the edge function can upsert reliably
      clientMessageId: request.clientMessageId,
      skipPersistence: request.skipPersistence,
    };

    const url = `${appConfig.edgeFunctionBaseUrl}/openai-chat`;
    return await fetchJson<AIApiResponse>(
      url,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      },
      30000
    );
  }
} 