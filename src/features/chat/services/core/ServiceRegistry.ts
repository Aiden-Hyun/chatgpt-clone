// src/features/chat/services/core/ServiceRegistry.ts
import type { IChatRoomService } from "@/entities/chatRoom";
import type { ChatMessage } from "@/entities/message";

import { IMessageService } from "../interfaces/IMessageService";
import { IUIStateService } from "../interfaces/IUIStateService";

export interface ServiceConfig {
  chatRoomService: { new (): IChatRoomService };
  messageService: { new (): IMessageService };
  /** @deprecated Use individual services instead */
  uiStateService?: {
    new (
      setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
      setIsTyping: React.Dispatch<React.SetStateAction<boolean>>,
      setDrafts: React.Dispatch<React.SetStateAction<Record<string, string>>>
    ): IUIStateService;
  };
  // New services

  // Drafts are now handled in hooks (useMessageInput) with storage persistence
}

export class ServiceRegistry {
  private static config: ServiceConfig | null = null;

  static register(config: ServiceConfig): void {
    this.config = config;
  }

  static getConfig(): ServiceConfig {
    if (!this.config) {
      throw new Error("ServiceRegistry not configured. Call register() first.");
    }
    return this.config;
  }

  static createChatRoomService(): IChatRoomService {
    const config = this.getConfig();
    return new config.chatRoomService();
  }

  static createMessageService(): IMessageService {
    const config = this.getConfig();
    return new config.messageService();
  }

  /** @deprecated Use createMessageStateService, createTypingStateService, etc. instead */
  static createUIStateService(
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
    setIsTyping: React.Dispatch<React.SetStateAction<boolean>>,
    setDrafts: React.Dispatch<React.SetStateAction<Record<string, string>>>
  ): IUIStateService {
    const config = this.getConfig();
    if (!config.uiStateService) {
      throw new Error(
        "uiStateService not registered. Use segregated services instead."
      );
    }
    return new config.uiStateService(setMessages, setIsTyping, setDrafts);
  }

  // New service creators

  static createTypingStateService(
    setIsTyping: React.Dispatch<React.SetStateAction<boolean>>
  ) {
    return { setTyping: setIsTyping }; // Direct object - no need for service class
  }
}
