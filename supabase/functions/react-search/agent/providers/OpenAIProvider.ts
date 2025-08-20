import type { AIProvider, AIProviderConfig, AIProviderResponse } from "../types/AIProvider.ts";
import { config as appConfig } from "../../../shared/config.ts";

/**
 * OpenAI Provider Implementation
 * 
 * This class handles OpenAI API calls using direct fetch instead of SDK
 */
export class OpenAIProvider implements AIProvider {
  private apiKey: string;

  constructor() {
    this.apiKey = appConfig.secrets.openai.apiKey();
  }

  /**
   * Make a call to the OpenAI API
   * 
   * @param model - The OpenAI model to use
   * @param messages - Array of messages (system, user, assistant)
   * @param config - Configuration options
   * @returns Promise resolving to the OpenAI response
   */
  async call(model: string, messages: any[], config: AIProviderConfig): Promise<AIProviderResponse> {
    // Build the request configuration
    const requestConfig: any = {
      model,
      messages,
    };

    // Only include temperature if the model supports custom temperature
    if (config.supportsCustomTemperature !== false) {
      requestConfig.temperature = config.defaultTemperature || config.temperature || 0.1;
    }

    // Handle token parameter - use the correct parameter name for the model
    const tokenParameter = config.tokenParameter || 'max_tokens';
    const tokenValue = config.max_tokens || config.maxTokens || 200;
    requestConfig[tokenParameter] = tokenValue;

    // NEW: honor response_format for JSON mode
    if (config.response_format) {
      requestConfig.response_format = config.response_format;
    }

    console.log(`🤖 [OpenAIProvider] Making API call with config:`, {
      model,
      tokenParameter,
      tokenValue,
      temperature: requestConfig.temperature,
      supportsCustomTemperature: config.supportsCustomTemperature,
      response_format: requestConfig.response_format,
      messageCount: messages.length
    });

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestConfig),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error?.message || 'OpenAI API error');
      }

      return data;
    } catch (error) {
      console.error(`🤖 [OpenAIProvider] OpenAI API call failed:`, error);
      throw error;
    }
  }

  /**
   * Get the name of this provider
   * 
   * @returns Provider name
   */
  getName(): string {
    return 'openai';
  }
}
