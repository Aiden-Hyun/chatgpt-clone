// src/features/chat/services/core/ServiceFactory.ts
import type { ChatMessage } from "@/entities/message";

import { MessageOrchestrator } from "./message-sender";
import { appConfig } from "@/shared/lib/config";
import { fetchJson } from "../../lib/fetch";
import { getModelInfo } from "../../constants/models";
import { getLogger } from "@/shared/services/logger";
import { ServiceRegistry } from "./ServiceRegistry";

/**
 * Factory for creating service instances with proper dependency injection
 * Creates a complete MessageOrchestrator with all dependencies
 */
export class ServiceFactory {
  static createMessageSender(
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
    setIsTyping: React.Dispatch<React.SetStateAction<boolean>>
  ): MessageOrchestrator {
    // Create all service instances using the registry
    const chatRoomService = ServiceRegistry.createChatRoomService();
    const messageService = ServiceRegistry.createMessageService();
    // Inlined from ChatAPIService
    const sendMessageFn = async (
      request: any,
      accessToken: string,
      isSearchMode?: boolean
    ): Promise<any> => {
      const logger = getLogger("ChatAPIService");
      
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

      const url = isSearchMode
        ? `${appConfig.edgeFunctionBaseUrl}/react-search`
        : `${appConfig.edgeFunctionBaseUrl}/ai-chat`;
      const response = await fetchJson<any>(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      // Transform search response to match AIApiResponse format
      if (isSearchMode) {
        const searchResponse = response as {
          final_answer_md: string;
          citations: unknown[];
          time_warning?: string;
        };
        return {
          content: searchResponse.final_answer_md,
          model: request.model,
          citations: searchResponse.citations,
          time_warning: searchResponse.time_warning,
        };
      }

      return response;
    };
    // Response processor functions (inlined from AIResponseProcessor)
    const validateResponse = (response: any): boolean => {
      if (response.content) return true;
      if (!response?.choices?.[0]?.message?.content) return false;
      return true;
    };
    const extractContent = (response: any): string | null => {
      if (!validateResponse(response)) return null;
      return response.content || response.choices[0].message.content;
    };
    const responseProcessor = { validateResponse, extractContent };

    // Use the new, more focused services
    const messageStateService =
      ServiceRegistry.createMessageStateService(setMessages);
    const typingStateService = { setTyping: setIsTyping }; // Direct object instead of service
    const animationService =
      ServiceRegistry.createAnimationService(setMessages);

    // Create and return the orchestrator with all dependencies injected
    return new MessageOrchestrator(
      sendMessageFn,
      responseProcessor,
      chatRoomService,
      messageService,
      animationService,
      messageStateService,
      typingStateService
    );
  }

  /**
   * Creates individual services for testing or custom usage
   */
  static createChatRoomService() {
    return ServiceRegistry.createChatRoomService();
  }

  static createMessageService() {
    return ServiceRegistry.createMessageService();
  }



  /** @deprecated Use createMessageStateService, createTypingStateService, etc. instead */
  static createUIStateService(
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
    setIsTyping: React.Dispatch<React.SetStateAction<boolean>>,
    setDrafts: React.Dispatch<React.SetStateAction<Record<string, string>>>
  ) {
    return ServiceRegistry.createUIStateService(
      setMessages,
      setIsTyping,
      setDrafts
    );
  }

  // New service creators
  static createMessageStateService(
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
  ) {
    return ServiceRegistry.createMessageStateService(setMessages);
  }

  static createTypingStateService(
    setIsTyping: React.Dispatch<React.SetStateAction<boolean>>
  ) {
    return { setTyping: setIsTyping }; // Direct object instead of service class
  }

  static createAnimationService(
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
  ) {
    return ServiceRegistry.createAnimationService(setMessages);
  }
}
