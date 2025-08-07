import { renderHook, act } from '@testing-library/react';
import { EventBus } from '../../../../../src/features/concurrent-chat/core/events/EventBus';
import { ServiceContainer } from '../../../../../src/features/concurrent-chat/core/container/ServiceContainer';
import { useConcurrentChat } from '../../../../../src/features/concurrent-chat/core/hooks/useConcurrentChat';
import { IMessageProcessor } from '../../../../../src/features/concurrent-chat/core/types/interfaces/IMessageProcessor';
import { IAIService } from '../../../../../src/features/concurrent-chat/core/types/interfaces/IAIService';
import { IModelSelector } from '../../../../../src/features/concurrent-chat/core/types/interfaces/IModelSelector';

describe('useConcurrentChat', () => {
  let mockEventBus: EventBus;
  let mockServiceContainer: ServiceContainer;
  let mockMessageProcessor: jest.Mocked<IMessageProcessor>;
  let mockAIService: jest.Mocked<IAIService>;
  let mockModelSelector: jest.Mocked<IModelSelector>;

  beforeEach(() => {
    // Create real instances
    mockEventBus = new EventBus();
    mockServiceContainer = new ServiceContainer();

    mockMessageProcessor = {
      process: jest.fn().mockResolvedValue(undefined),
    } as any;

    mockAIService = {
      sendMessage: jest.fn().mockResolvedValue({}),
      sendMessageWithStreaming: jest.fn().mockResolvedValue({}),
    } as any;

    mockModelSelector = {
      getAvailableModels: jest.fn().mockReturnValue([
        { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
        { label: 'GPT-4', value: 'gpt-4' },
      ]),
      getCurrentModel: jest.fn().mockReturnValue('gpt-3.5-turbo'),
      setModel: jest.fn().mockResolvedValue(undefined),
      getModelForRoom: jest.fn().mockResolvedValue('gpt-3.5-turbo'),
    } as any;

    // Register services in the container
    mockServiceContainer.register('messageProcessor', mockMessageProcessor);
    mockServiceContainer.register('aiService', mockAIService);
    mockServiceContainer.register('modelSelector', mockModelSelector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useConcurrentChat());

      expect(result.current.messages).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.currentModel).toBe('gpt-3.5-turbo');
      expect(result.current.error).toBeNull();
    });

    it('should initialize with roomId', () => {
      const { result } = renderHook(() => useConcurrentChat(123));

      expect(result.current.messages).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.currentModel).toBe('gpt-3.5-turbo');
      expect(result.current.error).toBeNull();
    });
  });

  describe('message operations', () => {
    it('should send a message successfully', async () => {
      const { result } = renderHook(() => useConcurrentChat());

      await act(async () => {
        await result.current.sendMessage('Hello, world!');
      });

      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].content).toBe('Hello, world!');
      expect(result.current.messages[0].role).toBe('user');
    });

    it('should not send empty messages', async () => {
      const { result } = renderHook(() => useConcurrentChat());

      await act(async () => {
        await result.current.sendMessage('');
      });

      expect(result.current.messages).toHaveLength(0);
    });

    it('should cancel a message', async () => {
      const { result } = renderHook(() => useConcurrentChat());

      // First send a message
      await act(async () => {
        await result.current.sendMessage('Test message');
      });

      const messageId = result.current.messages[0].id;

      // Then cancel it
      await act(async () => {
        await result.current.cancelMessage(messageId);
      });

      // Should handle cancellation gracefully
      expect(result.current.messages).toHaveLength(1);
    });

    it('should retry a message', async () => {
      const { result } = renderHook(() => useConcurrentChat());

      // First send a message
      await act(async () => {
        await result.current.sendMessage('Test message');
      });

      const messageId = result.current.messages[0].id;

      // Then retry it
      await act(async () => {
        await result.current.retryMessage(messageId);
      });

      // Should handle retry gracefully
      expect(result.current.messages).toHaveLength(1);
    });

    it('should clear all messages', async () => {
      const { result } = renderHook(() => useConcurrentChat());

      // First send some messages
      await act(async () => {
        await result.current.sendMessage('Message 1');
        await result.current.sendMessage('Message 2');
      });

      expect(result.current.messages).toHaveLength(2);

      // Then clear them
      await act(async () => {
        await result.current.clearMessages();
      });

      expect(result.current.messages).toHaveLength(0);
    });
  });

  describe('model operations', () => {
    it('should change model successfully', async () => {
      const { result } = renderHook(() => useConcurrentChat());

      await act(async () => {
        await result.current.changeModel('gpt-4');
      });

      expect(result.current.currentModel).toBe('gpt-4');
    });

    it('should get available models', () => {
      const { result } = renderHook(() => useConcurrentChat());

      const models = result.current.getAvailableModels();

      expect(models).toEqual([
        { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
        { label: 'GPT-4', value: 'gpt-4' },
      ]);
    });

    it('should get plugin statistics', () => {
      const { result } = renderHook(() => useConcurrentChat());

      const stats = result.current.getPluginStats();

      expect(stats).toBeDefined();
      expect(typeof stats.total).toBe('number');
    });
  });

  describe('error handling', () => {
    it('should handle message processing errors gracefully', async () => {
      const { result } = renderHook(() => useConcurrentChat());

      await act(async () => {
        await result.current.sendMessage('Test message');
      });

      // Should handle errors gracefully
      expect(result.current.messages).toHaveLength(1);
    });
  });
}); 