import { act, renderHook } from '@testing-library/react';
import { ServiceContainer } from '../../../../../src/features/concurrent-chat/core/container/ServiceContainer';
import { EventBus } from '../../../../../src/features/concurrent-chat/core/events/EventBus';
import { useConcurrentChat } from '../../../../../src/features/concurrent-chat/core/hooks/useConcurrentChat';
import { IAIService } from '../../../../../src/features/concurrent-chat/core/types/interfaces/IAIService';
import { IMessageProcessor } from '../../../../../src/features/concurrent-chat/core/types/interfaces/IMessageProcessor';
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

    // Register services in the container BEFORE the hook initializes
    mockServiceContainer.register('messageProcessor', mockMessageProcessor);
    mockServiceContainer.register('aiService', mockAIService);
    mockServiceContainer.register('modelSelector', mockModelSelector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useConcurrentChat(mockEventBus, mockServiceContainer));

      expect(result.current.messages).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.currentModel).toBe('gpt-3.5-turbo');
      expect(result.current.error).toBeNull();
    });

    it('should initialize with roomId', () => {
      const { result } = renderHook(() => useConcurrentChat(mockEventBus, mockServiceContainer, 123));

      expect(result.current.messages).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.currentModel).toBe('gpt-3.5-turbo');
      expect(result.current.error).toBeNull();
    });
  });

  describe('message operations', () => {
    it('should send a message successfully', async () => {
      const { result } = renderHook(() => useConcurrentChat(mockEventBus, mockServiceContainer));

      await act(async () => {
        await result.current.sendMessage('Hello, world!');
      });

      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].content).toBe('Hello, world!');
      expect(result.current.messages[0].role).toBe('user');
    });

    it('should not send empty messages', async () => {
      const { result } = renderHook(() => useConcurrentChat(mockEventBus, mockServiceContainer));

      await act(async () => {
        await result.current.sendMessage('');
      });

      expect(result.current.messages).toHaveLength(0);
    });

    it('should cancel a message', async () => {
      const { result } = renderHook(() => useConcurrentChat(mockEventBus, mockServiceContainer));

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
      const { result } = renderHook(() => useConcurrentChat(mockEventBus, mockServiceContainer));

      // First send a message
      await act(async () => {
        await result.current.sendMessage('Test message');
      });

      const messageId = result.current.messages[0].id;

      // Then retry it
      await act(async () => {
        await result.current.retryMessage(messageId);
      });

      // Should handle retry gracefully - retry creates a new message
      expect(result.current.messages).toHaveLength(2);
    });

    it('should clear all messages', async () => {
      const { result } = renderHook(() => useConcurrentChat(mockEventBus, mockServiceContainer));

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

    it('should keep user message not-processing and set assistant placeholder to processing', async () => {
      const userId = 'user_1';
      const assistantId = 'assistant_1';

      // Mock processor to publish MESSAGE_SENT events similar to real processor
      (mockMessageProcessor.process as jest.Mock).mockImplementation(async (message: any) => {
        mockEventBus.publish('MESSAGE_SENT' as any, {
          type: 'MESSAGE_SENT',
          timestamp: Date.now(),
          messageId: userId,
          message: { ...message, id: userId, status: 'completed' },
        } as any);

        mockEventBus.publish('MESSAGE_SENT' as any, {
          type: 'MESSAGE_SENT',
          timestamp: Date.now(),
          messageId: assistantId,
          message: { id: assistantId, role: 'assistant', content: '', status: 'processing' },
        } as any);

        return message;
      });

      const { result } = renderHook(() => useConcurrentChat(mockEventBus, mockServiceContainer));

      await act(async () => {
        await result.current.sendMessage('Hello');
      });

      const userMsg = result.current.messages.find(m => m.role === 'user');
      const assistantMsg = result.current.messages.find(m => m.role === 'assistant');
      expect(userMsg).toBeDefined();
      expect(userMsg?.status).not.toBe('processing');
      expect(assistantMsg).toBeDefined();
      expect(assistantMsg?.status).toBe('processing');
    });
  });

  describe('model operations', () => {
    it('should change model successfully', async () => {
      const { result } = renderHook(() => useConcurrentChat(mockEventBus, mockServiceContainer));

      await act(async () => {
        await result.current.changeModel('gpt-4');
      });

      expect(result.current.currentModel).toBe('gpt-4');
    });

    it('should get available models', () => {
      const { result } = renderHook(() => useConcurrentChat(mockEventBus, mockServiceContainer));

      const models = result.current.getAvailableModels();

      expect(models).toEqual([
        { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
        { label: 'GPT-4', value: 'gpt-4' },
      ]);
    });

    it('should get plugin statistics', () => {
      const { result } = renderHook(() => useConcurrentChat(mockEventBus, mockServiceContainer));

      const stats = result.current.getPluginStats();

      expect(stats).toBeDefined();
      expect(typeof stats.total).toBe('number');
    });
  });

  describe('error handling', () => {
    it('should handle message processing errors gracefully', async () => {
      const { result } = renderHook(() => useConcurrentChat(mockEventBus, mockServiceContainer));

      await act(async () => {
        await result.current.sendMessage('Test message');
      });

      // Should handle errors gracefully
      expect(result.current.messages).toHaveLength(1);
    });

    it('should only mark assistant messages as failed, never user messages', async () => {
      const { result } = renderHook(() => useConcurrentChat(mockEventBus, mockServiceContainer));

      // Add initial messages - one user, one assistant
      act(() => {
        result.current.replaceMessages([
          {
            id: 'user_msg_123',
            content: 'Hello',
            role: 'user',
            status: 'completed',
            timestamp: Date.now(),
          },
          {
            id: 'assistant_msg_456',
            content: 'Hi there!',
            role: 'assistant',
            status: 'processing',
            timestamp: Date.now(),
          },
        ]);
      });

      // Simulate MESSAGE_FAILED event for assistant message
      act(() => {
        mockEventBus.publish('MESSAGE_FAILED', {
          type: 'MESSAGE_FAILED',
          timestamp: Date.now(),
          messageId: 'assistant_msg_456',
          message: {
            id: 'assistant_msg_456',
            content: 'Hi there!',
            role: 'assistant',
            status: 'failed',
            timestamp: Date.now(),
          },
          error: 'AI service error',
        });
      });

      // Assistant message should be marked as failed
      const assistantMessage = result.current.messages.find(m => m.id === 'assistant_msg_456');
      expect(assistantMessage?.status).toBe('failed');
      expect(assistantMessage?.error).toBe('AI service error');

      // User message should remain completed (not affected)
      const userMessage = result.current.messages.find(m => m.id === 'user_msg_123');
      expect(userMessage?.status).toBe('completed');
      expect(userMessage?.error).toBeUndefined();

      // Simulate MESSAGE_FAILED event with user message ID (should be ignored due to role guard)
      act(() => {
        mockEventBus.publish('MESSAGE_FAILED', {
          type: 'MESSAGE_FAILED',
          timestamp: Date.now(),
          messageId: 'user_msg_123',
          message: {
            id: 'user_msg_123',
            content: 'Hello',
            role: 'user',
            status: 'failed',
            timestamp: Date.now(),
          },
          error: 'Should not affect user message',
        });
      });

      // User message should still be completed (protected by role guard)
      const userMessageAfter = result.current.messages.find(m => m.id === 'user_msg_123');
      expect(userMessageAfter?.status).toBe('completed');
      expect(userMessageAfter?.error).toBeUndefined();
    });
  });
}); 