// src/features/chat/services/core/ServiceRegistry.ts
import type { IChatRoomService } from "@/entities/chatRoom";
import type { ChatMessage } from "@/entities/message";
import type { Session } from "@/entities/session";

import { IAIApiService } from "../interfaces/IAIApiService";
import { IAnimationService } from "../interfaces/IAnimationService";
import { IMessageService } from "../interfaces/IMessageService";
import { IMessageStateService } from "../interfaces/IMessageStateService";
import { IUIStateService } from "../interfaces/IUIStateService";

export interface ServiceConfig {
  aiApiService: { new (): IAIApiService };
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
  messageStateService: {
    new (
      setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
    ): IMessageStateService;
  };
  animationService: {
    new (
      setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
    ): IAnimationService;
  };

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

  static createAIApiService(): IAIApiService {
    const config = this.getConfig();
    return new config.aiApiService();
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
  static createMessageStateService(
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
  ): IMessageStateService {
    const config = this.getConfig();
    return new config.messageStateService(setMessages);
  }

  static createTypingStateService(
    setIsTyping: React.Dispatch<React.SetStateAction<boolean>>
  ) {
    return { setTyping: setIsTyping }; // Direct object - no need for service class
  }

  static createAnimationService(
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
  ): IAnimationService {
    const config = this.getConfig();
    return new config.animationService(setMessages);
  }


}
