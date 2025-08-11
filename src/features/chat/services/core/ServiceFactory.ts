// src/features/chat/services/core/ServiceFactory.ts
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
    const uiStateService = ServiceRegistry.createUIStateService(setMessages, setIsTyping, setDrafts);
    const responseProcessor = new OpenAIResponseProcessor();

    // Create and return the orchestrator with all dependencies injected
    return new MessageSenderService(
      chatRoomService,
      messageService,
      aiApiService,
      navigationService,
      uiStateService,
      responseProcessor
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

  static createUIStateService(
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
    setIsTyping: React.Dispatch<React.SetStateAction<boolean>>,
    setDrafts: React.Dispatch<React.SetStateAction<Record<string, string>>>
  ) {
    return ServiceRegistry.createUIStateService(setMessages, setIsTyping, setDrafts);
  }
} 