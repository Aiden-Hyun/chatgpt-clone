// src/features/chat/services/core/ServiceRegistry.ts
import type { IChatRoomService } from "@/entities/chatRoom";
import type { Session } from "@/entities/session";
import { IAIApiService } from "../interfaces/IAIApiService";
import { IAnimationService } from "../interfaces/IAnimationService";
import { IAuthService } from "../interfaces/IAuthService";
import { IMessageService } from "../interfaces/IMessageService";
import { IMessageStateService } from "../interfaces/IMessageStateService";
import { INavigationService } from "../interfaces/INavigationService";
import { IRegenerationService } from "../interfaces/IRegenerationService";

import type { ChatMessage } from "@/entities/message";
import { ITypingStateService } from "../interfaces/ITypingStateService";
import { IUIStateService } from "../interfaces/IUIStateService";

export interface ServiceConfig {
  aiApiService: { new (): IAIApiService };
  chatRoomService: { new (): IChatRoomService };
  messageService: { new (): IMessageService };
  navigationService: { new (): INavigationService };
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
  typingStateService: {
    new (
      setIsTyping: React.Dispatch<React.SetStateAction<boolean>>
    ): ITypingStateService;
  };
  animationService: {
    new (
      setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
    ): IAnimationService;
  };
  regenerationService: {
    new (
      messageStateManager: any, // Using any to avoid circular dependency
      aiApiService: IAIApiService,
      messageService: IMessageService,
      animationService: IAnimationService,
      setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
      session: Session,
      selectedModel: string,
      roomId: number | null,
      isSearchMode: boolean
    ): IRegenerationService;
  };
  authService: { new (): IAuthService };

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

  static createNavigationService(): INavigationService {
    const config = this.getConfig();
    return new config.navigationService();
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
  ): ITypingStateService {
    const config = this.getConfig();
    return new config.typingStateService(setIsTyping);
  }

  static createAnimationService(
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
  ): IAnimationService {
    const config = this.getConfig();
    return new config.animationService(setMessages);
  }

  static createRegenerationService(
    messageStateManager: any, // Using any to avoid circular dependency
    aiApiService: IAIApiService,
    messageService: IMessageService,
    animationService: IAnimationService,
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
    session: Session,
    selectedModel: string,
    roomId: number | null,
    isSearchMode: boolean
  ): IRegenerationService {
    const config = this.getConfig();
    return new config.regenerationService(
      messageStateManager,
      aiApiService,
      messageService,
      animationService,
      setMessages,
      session,
      selectedModel,
      roomId,
      isSearchMode
    );
  }

  static createAuthService(): IAuthService {
    const config = this.getConfig();
    return new config.authService();
  }
}
