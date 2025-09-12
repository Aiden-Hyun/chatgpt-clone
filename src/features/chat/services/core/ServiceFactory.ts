// src/features/chat/services/core/ServiceFactory.ts
import type { ChatMessage } from "@/entities/message";

import { MessageOrchestrator } from "./message-sender";
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
    const aiApiService = ServiceRegistry.createAIApiService();
    const navigationService = ServiceRegistry.createNavigationService();
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
    const typingStateService =
      ServiceRegistry.createTypingStateService(setIsTyping);
    const animationService =
      ServiceRegistry.createAnimationService(setMessages);

    // Create and return the orchestrator with all dependencies injected
    return new MessageOrchestrator(
      aiApiService,
      responseProcessor,
      chatRoomService,
      messageService,
      animationService,
      messageStateService,
      typingStateService,
      navigationService
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

  static createAIApiService() {
    return ServiceRegistry.createAIApiService();
  }

  static createNavigationService() {
    return ServiceRegistry.createNavigationService();
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
    return ServiceRegistry.createTypingStateService(setIsTyping);
  }

  static createAnimationService(
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
  ) {
    return ServiceRegistry.createAnimationService(setMessages);
  }
}
