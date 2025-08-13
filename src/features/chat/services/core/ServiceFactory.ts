// src/features/chat/services/core/ServiceFactory.ts
import { Session } from '@supabase/supabase-js';
import { IAIApiService } from '../interfaces/IAIApiService';
import { IMessageService } from '../interfaces/IMessageService';
import { IRegenerationService } from '../interfaces/IRegenerationService';
import { ChatMessage } from '../types';
import { OpenAIResponseProcessor } from './AIResponseProcessor';
import { MessageSenderService } from './MessageSenderService';
import { ServiceRegistry } from './ServiceRegistry';

export class ServiceFactory {
  /**
   * Creates a complete MessageSenderService with all dependencies
   */
  static createMessageSender(
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
    setIsTyping: React.Dispatch<React.SetStateAction<boolean>>,
    setDrafts: React.Dispatch<React.SetStateAction<Record<string, string>>>
  ): MessageSenderService {
    // Create all service instances using the registry
    const chatRoomService = ServiceRegistry.createChatRoomService();
    const messageService = ServiceRegistry.createMessageService();
    const aiApiService = ServiceRegistry.createAIApiService();
    const navigationService = ServiceRegistry.createNavigationService();
    const responseProcessor = new OpenAIResponseProcessor();

    // Use the new, more focused services
    const messageStateService = ServiceRegistry.createMessageStateService(setMessages);
    const typingStateService = ServiceRegistry.createTypingStateService(setIsTyping);
    const animationService = ServiceRegistry.createAnimationService(setMessages);

    // Create and return the orchestrator with all dependencies injected
    return new MessageSenderService(
      chatRoomService,
      messageService,
      aiApiService,
      navigationService,
      responseProcessor,
      messageStateService,
      typingStateService,
      animationService
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
    return ServiceRegistry.createUIStateService(setMessages, setIsTyping, setDrafts);
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

  static createRegenerationService(
    messageStateManager: any, // Using any to avoid circular dependency
    aiApiService: IAIApiService,
    messageService: IMessageService,
    animationService: any,
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
    session: Session,
    selectedModel: string,
    roomId: number | null
  ): IRegenerationService {
    return ServiceRegistry.createRegenerationService(
      messageStateManager,
      aiApiService,
      messageService,
      animationService,
      setMessages,
      session,
      selectedModel,
      roomId
    );
  }
} 