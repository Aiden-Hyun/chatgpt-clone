// src/features/chat/services/implementations/OpenAIAPIService.ts
import { IAIApiService } from '../interfaces/IAIApiService';
import { fetchOpenAIResponse } from '../legacy/fetchOpenAIResponse';
import { AIApiRequest, AIApiResponse } from '../types';

export class OpenAIAPIService implements IAIApiService {
  async sendMessage(request: AIApiRequest, accessToken: string): Promise<AIApiResponse> {
    const payload = {
      roomId: request.roomId,
      messages: request.messages,
      model: request.model,
    };

    return fetchOpenAIResponse(payload, accessToken);
  }
} 