import { ServiceConfig } from '@/features/chat/services/core/ServiceRegistry';
import { IAIApiService } from '@/features/chat/services/interfaces/IAIApiService';
import { IAnimationService } from '@/features/chat/services/interfaces/IAnimationService';
import { IChatRoomService } from '@/features/chat/services/interfaces/IChatRoomService';
import { IMessageService } from '@/features/chat/services/interfaces/IMessageService';
import { IMessageStateService } from '@/features/chat/services/interfaces/IMessageStateService';
import { INavigationService } from '@/features/chat/services/interfaces/INavigationService';
import { IRegenerationService } from '@/features/chat/services/interfaces/IRegenerationService';
import { ITypingStateService } from '@/features/chat/services/interfaces/ITypingStateService';

export const createMockServiceConfig = (): ServiceConfig => {
  const mockAIApiService: IAIApiService = {
    sendMessage: jest.fn().mockResolvedValue({
      content: 'Assistant response',
    }),
  };

  const mockChatRoomService: IChatRoomService = {
    createRoom: jest.fn().mockResolvedValue(1),
    updateRoom: jest.fn().mockResolvedValue(undefined),
    getRoom: jest.fn().mockResolvedValue({
      id: 1,
      name: 'Test Room',
      model: 'gpt-3.5-turbo',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
    deleteRoom: jest.fn().mockResolvedValue(undefined),
  };

  const mockMessageService: IMessageService = {
    insertMessages: jest.fn().mockResolvedValue(undefined),
    updateAssistantMessage: jest.fn().mockResolvedValue(undefined),
    loadMessages: jest.fn().mockResolvedValue([]),
    deleteMessages: jest.fn().mockResolvedValue(undefined),
  };

  const mockMessageStateService: IMessageStateService = {
    updateMessageState: jest.fn(),
    addErrorMessage: jest.fn(),
  };

  const mockNavigationService: INavigationService = {
    navigateToRoom: jest.fn().mockResolvedValue(undefined),
    navigateToHome: jest.fn().mockResolvedValue(undefined),
    navigateToNewChat: jest.fn().mockResolvedValue(undefined),
    handleNewRoomNavigation: jest.fn().mockResolvedValue(undefined),
  };

  const mockRegenerationService: IRegenerationService = {
    regenerateMessage: jest.fn().mockResolvedValue(undefined),
    isRegenerating: jest.fn().mockReturnValue(false),
  };

  const mockTypingStateService: ITypingStateService = {
    setTyping: jest.fn(),
  };
  
  const mockAnimationService: IAnimationService = {
    animateMessage: jest.fn(),
  };

  return {
    aiApiService: jest.fn(() => mockAIApiService),
    chatRoomService: jest.fn(() => mockChatRoomService),
    messageService: jest.fn(() => mockMessageService),
    navigationService: jest.fn(() => mockNavigationService),
    messageStateService: jest.fn(() => mockMessageStateService),
    typingStateService: jest.fn(() => mockTypingStateService),
    animationService: jest.fn(() => mockAnimationService),
    regenerationService: jest.fn(() => mockRegenerationService),
  } as unknown as ServiceConfig;
};
