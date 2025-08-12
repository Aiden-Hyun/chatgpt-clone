// src/features/chat/services/implementations/OpenAIAPIService.ts
import { IAIApiService } from '../interfaces/IAIApiService';
import { AIApiRequest, AIApiResponse } from '../types';

export class OpenAIAPIService implements IAIApiService {
  async sendMessage(request: AIApiRequest, accessToken: string): Promise<AIApiResponse> {
    // Consolidated from legacy/fetchOpenAIResponse.ts
    const payload = {
      roomId: request.roomId,
      messages: request.messages,
      model: request.model,
      clientMessageId: request.clientMessageId,
      skipPersistence: request.skipPersistence === true,
    };

    const res = await fetch('https://twzumsgzuwguketxbdet.functions.supabase.co/openai-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch (err) {
      console.error('Failed to parse OpenAI response:', text);
      throw err;
    }
  }
} 