// src/features/chat/services/core/ServiceRegistry.ts
import { IAIApiService } from '../interfaces/IAIApiService';
import { IChatRoomService } from '../interfaces/IChatRoomService';
import { IMessageService } from '../interfaces/IMessageService';
import { INavigationService } from '../interfaces/INavigationService';
import { IStorageService } from '../interfaces/IStorageService';
import { IUIStateService } from '../interfaces/IUIStateService';
import { ChatMessage } from '../types';

export interface ServiceConfig {
  aiApiService: { new(): IAIApiService };
  chatRoomService: { new(): IChatRoomService };
  messageService: { new(): IMessageService };
  storageService: { new(): IStorageService };
  navigationService: { new(): INavigationService };
  uiStateService: {
    new(
      setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
      setIsTyping: React.Dispatch<React.SetStateAction<boolean>>,
      setDrafts: React.Dispatch<React.SetStateAction<Record<string, string>>>
    ): IUIStateService;
  };
}

export class ServiceRegistry {
  private static config: ServiceConfig | null = null;

  static register(config: ServiceConfig): void {
    this.config = config;
  }

  static getConfig(): ServiceConfig {
    if (!this.config) {
      throw new Error('ServiceRegistry not configured. Call register() first.');
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

  static createStorageService(): IStorageService {
    const config = this.getConfig();
    return new config.storageService();
  }

  static createNavigationService(): INavigationService {
    const config = this.getConfig();
    return new config.navigationService();
  }

  static createUIStateService(
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
    setIsTyping: React.Dispatch<React.SetStateAction<boolean>>,
    setDrafts: React.Dispatch<React.SetStateAction<Record<string, string>>>
  ): IUIStateService {
    const config = this.getConfig();
    return new config.uiStateService(setMessages, setIsTyping, setDrafts);
  }
} 