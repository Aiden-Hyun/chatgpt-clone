// src/features/chat/services/implementations/ChatAPIService.ts
import type { AIApiRequest, AIApiResponse } from "@/entities/message";
import { appConfig } from "@/shared/lib/config";
import { getLogger } from "@/shared/services/logger";

import { getModelInfo } from "../../constants/models";
import { fetchJson } from "../../lib/fetch";
import { IAIApiService } from "../interfaces/IAIApiService";

export class ChatAPIService implements IAIApiService {
  private logger = getLogger("ChatAPIService");

  async sendMessage(
    request: AIApiRequest,
    accessToken: string,
    isSearchMode?: boolean
  ): Promise<AIApiResponse> {
    // Get model configuration from client-side models
    const modelInfo = getModelInfo(request.model);

    // Validate search mode is supported for this model
    if (isSearchMode && !modelInfo?.capabilities.search) {
      throw new Error(`Search is not supported for model: ${request.model}`);
    }

    // Consolidated from legacy/fetchOpenAIResponse.ts with abort + timeout support via fetchJson
    const payload = isSearchMode
      ? {
          question:
            request.messages[request.messages.length - 1]?.content || "",
          model: request.model,
          modelConfig: {
            tokenParameter: modelInfo?.tokenParameter || "max_tokens",
            supportsCustomTemperature:
              modelInfo?.supportsCustomTemperature ?? true,
            defaultTemperature: modelInfo?.defaultTemperature || 0.7,
          },
        }
      : {
          roomId: request.roomId,
          messages: request.messages,
          model: request.model,
          modelConfig: {
            tokenParameter: modelInfo?.tokenParameter || "max_tokens",
            supportsCustomTemperature:
              modelInfo?.supportsCustomTemperature ?? true,
            defaultTemperature: modelInfo?.defaultTemperature || 0.7,
          },
          // Include idempotency and persistence control so the edge function can upsert reliably
          clientMessageId: request.clientMessageId,
          skipPersistence: request.skipPersistence,
        };

    this.logger.debug(
      `Making API call for ${isSearchMode ? "search" : "chat"} mode`
    );
    this.logger.debug("Request payload", {
      isSearchMode,
      model: request.model,
      messageCount: request.messages.length,
      modelConfig: payload.modelConfig,
    });

    const url = isSearchMode
      ? `${appConfig.edgeFunctionBaseUrl}/react-search`
      : `${appConfig.edgeFunctionBaseUrl}/ai-chat`;
    const response = await fetchJson<AIApiResponse>(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });
    this.logger.debug(
      `Received API response for ${isSearchMode ? "search" : "chat"} mode`
    );

    // Transform search response to match AIApiResponse format
    if (isSearchMode) {
      const searchResponse = response as {
        final_answer_md: string;
        citations: unknown[];
        time_warning?: string;
      };
      return {
        content: searchResponse.final_answer_md,
        model: request.model, // Use the actual model instead of hardcoded 'react-search'
        citations: searchResponse.citations,
        time_warning: searchResponse.time_warning,
      } as AIApiResponse;
    }

    return response as AIApiResponse;
  }
}
