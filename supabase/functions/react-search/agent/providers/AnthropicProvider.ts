import { callAnthropic } from "../../../ai-chat/providers/anthropic.ts";
import type { AIProvider, AIProviderConfig, AIProviderResponse } from "../types/AIProvider.ts";

/**
 * AnthropicProvider - Implementation for Anthropic Claude API
 * 
 * This provider handles calls to Anthropic's Claude models using the existing
 * callAnthropic utility function.
 */
export class AnthropicProvider implements AIProvider {
  getName(): string {
    return 'anthropic';
  }

  async call(model: string, messages: any[], config: AIProviderConfig): Promise<AIProviderResponse> {
    try {
      const response = await callAnthropic(model, messages, config);
      return response;
    } catch (error) {
      console.error(`[AnthropicProvider] Error calling Anthropic API:`, error);
      throw new Error(`Anthropic API call failed: ${error.message}`);
    }
  }
}
