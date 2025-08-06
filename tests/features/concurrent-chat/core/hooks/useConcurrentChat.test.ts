import { act, renderHook } from '@testing-library/react-hooks';
import { ServiceContainer } from '../../../../../src/features/concurrent-chat/core/container/ServiceContainer';
import { EventBus } from '../../../../../src/features/concurrent-chat/core/events/EventBus';
import { useConcurrentChat } from '../../../../../src/features/concurrent-chat/core/hooks/useConcurrentChat';
import { PluginManager } from '../../../../../src/features/concurrent-chat/plugins/PluginManager';

describe('useConcurrentChat', () => {
  let mockEventBus: jest.Mocked<EventBus>;
  let mockServiceContainer: jest.Mocked<ServiceContainer>;
  let mockPluginManager: jest.Mocked<PluginManager>;

  beforeEach(() => {
    mockEventBus = {
      subscribe: jest.fn(),
      publish: jest.fn(),
      unsubscribe: jest.fn(),
      unsubscribeById: jest.fn(),
      hasSubscribers: jest.fn(),
      getEventHistory: jest.fn(),
    } as any;

    mockServiceContainer = {
      register: jest.fn(),
      registerFactory: jest.fn(),
      get: jest.fn(),
      has: jest.fn(),
      clear: jest.fn(),
    } as any;

    mockPluginManager = {
      registerPlugin: jest.fn(),
      unregisterPlugin: jest.fn(),
      getPlugin: jest.fn(),
      getAllPlugins: jest.fn(),
      initializeAllPlugins: jest.fn(),
      startAllPlugins: jest.fn(),
      stopAllPlugins: jest.fn(),
      destroyAllPlugins: jest.fn(),
      publishEventToPlugins: jest.fn(),
    } as any;
  });

  describe('hook initialization', () => {
    it('should initialize with empty state', () => {
      const { result } = renderHook(() => useConcurrentChat({
        eventBus: mockEventBus,
        serviceContainer: mockServiceContainer,
        pluginManager: mockPluginManager
      }));

      expect(result.current.messages).toEqual([]);
      expect(result.current.processingMessages).toEqual(new Set());
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should initialize with provided dependencies', () => {
      const { result } = renderHook(() => useConcurrentChat({
        eventBus: mockEventBus,
        serviceContainer: mockServiceContainer,
        pluginManager: mockPluginManager
      }));

      expect(result.current.eventBus).toBe(mockEventBus);
      expect(result.current.serviceContainer).toBe(mockServiceContainer);
      expect(result.current.pluginManager).toBe(mockPluginManager);
    });

    it('should initialize plugin system', () => {
      renderHook(() => useConcurrentChat({
        eventBus: mockEventBus,
        serviceContainer: mockServiceContainer,
        pluginManager: mockPluginManager
      }));

      expect(mockPluginManager.initializeAllPlugins).toHaveBeenCalled();
    });

    it('should subscribe to events', () => {
      renderHook(() => useConcurrentChat({
        eventBus: mockEventBus,
        serviceContainer: mockServiceContainer,
        pluginManager: mockPluginManager
      }));

      expect(mockEventBus.subscribe).toHaveBeenCalled();
    });
  });

  describe('message sending', () => {
    it('should send message successfully', async () => {
      const { result } = renderHook(() => useConcurrentChat({
        eventBus: mockEventBus,
        serviceContainer: mockServiceContainer,
        pluginManager: mockPluginManager
      }));

      await act(async () => {
        await result.current.sendMessage('Hello world', 123);
      });

      expect(result.current.messages.length).toBeGreaterThan(0);
      expect(result.current.processingMessages.size).toBeGreaterThan(0);
    });

    it('should handle message sending errors', async () => {
      mockEventBus.publish.mockRejectedValue(new Error('Send failed'));
      
      const { result } = renderHook(() => useConcurrentChat({
        eventBus: mockEventBus,
        serviceContainer: mockServiceContainer,
        pluginManager: mockPluginManager
      }));

      await act(async () => {
        await result.current.sendMessage('Hello world', 123);
      });

      expect(result.current.error).toBeDefined();
    });

    it('should handle empty message content', async () => {
      const { result } = renderHook(() => useConcurrentChat({
        eventBus: mockEventBus,
        serviceContainer: mockServiceContainer,
        pluginManager: mockPluginManager
      }));

      await act(async () => {
        await result.current.sendMessage('', 123);
      });

      expect(result.current.error).toBeDefined();
    });

    it('should handle null message content', async () => {
      const { result } = renderHook(() => useConcurrentChat({
        eventBus: mockEventBus,
        serviceContainer: mockServiceContainer,
        pluginManager: mockPluginManager
      }));

      await act(async () => {
        await result.current.sendMessage(null as any, 123);
      });

      expect(result.current.error).toBeDefined();
    });

    it('should handle concurrent message sending', async () => {
      const { result } = renderHook(() => useConcurrentChat({
        eventBus: mockEventBus,
        serviceContainer: mockServiceContainer,
        pluginManager: mockPluginManager
      }));

      await act(async () => {
        const promises = [
          result.current.sendMessage('Message 1', 123),
          result.current.sendMessage('Message 2', 123),
          result.current.sendMessage('Message 3', 123)
        ];
        await Promise.all(promises);
      });

      expect(result.current.processingMessages.size).toBe(3);
    });
  });

  describe('message processing state', () => {
    it('should track message processing state', async () => {
      const { result } = renderHook(() => useConcurrentChat({
        eventBus: mockEventBus,
        serviceContainer: mockServiceContainer,
        pluginManager: mockPluginManager
      }));

      await act(async () => {
        await result.current.sendMessage('Hello world', 123);
      });

      expect(result.current.processingMessages.size).toBeGreaterThan(0);
      expect(result.current.isLoading).toBe(true);
    });

    it('should handle message completion', async () => {
      const { result } = renderHook(() => useConcurrentChat({
        eventBus: mockEventBus,
        serviceContainer: mockServiceContainer,
        pluginManager: mockPluginManager
      }));

      await act(async () => {
        await result.current.sendMessage('Hello world', 123);
      });

      // Simulate message completion
      act(() => {
        result.current.handleMessageCompleted('msg-123');
      });

      expect(result.current.processingMessages.has('msg-123')).toBe(false);
    });

    it('should handle message failure', async () => {
      const { result } = renderHook(() => useConcurrentChat({
        eventBus: mockEventBus,
        serviceContainer: mockServiceContainer,
        pluginManager: mockPluginManager
      }));

      await act(async () => {
        await result.current.sendMessage('Hello world', 123);
      });

      // Simulate message failure
      act(() => {
        result.current.handleMessageFailed('msg-123', new Error('Failed'));
      });

      expect(result.current.processingMessages.has('msg-123')).toBe(false);
      expect(result.current.error).toBeDefined();
    });

    it('should handle message cancellation', async () => {
      const { result } = renderHook(() => useConcurrentChat({
        eventBus: mockEventBus,
        serviceContainer: mockServiceContainer,
        pluginManager: mockPluginManager
      }));

      await act(async () => {
        await result.current.sendMessage('Hello world', 123);
      });

      // Simulate message cancellation
      act(() => {
        result.current.cancelMessage('msg-123');
      });

      expect(result.current.processingMessages.has('msg-123')).toBe(false);
    });
  });

  describe('message retry functionality', () => {
    it('should retry failed message', async () => {
      const { result } = renderHook(() => useConcurrentChat({
        eventBus: mockEventBus,
        serviceContainer: mockServiceContainer,
        pluginManager: mockPluginManager
      }));

      await act(async () => {
        await result.current.retryMessage('msg-123');
      });

      expect(mockEventBus.publish).toHaveBeenCalledWith('message.retry', {
        messageId: 'msg-123'
      });
    });

    it('should handle retry errors', async () => {
      mockEventBus.publish.mockRejectedValue(new Error('Retry failed'));
      
      const { result } = renderHook(() => useConcurrentChat({
        eventBus: mockEventBus,
        serviceContainer: mockServiceContainer,
        pluginManager: mockPluginManager
      }));

      await act(async () => {
        await result.current.retryMessage('msg-123');
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe('message clearing', () => {
    it('should clear all messages', async () => {
      const { result } = renderHook(() => useConcurrentChat({
        eventBus: mockEventBus,
        serviceContainer: mockServiceContainer,
        pluginManager: mockPluginManager
      }));

      // Add some messages first
      await act(async () => {
        await result.current.sendMessage('Message 1', 123);
        await result.current.sendMessage('Message 2', 123);
      });

      // Clear messages
      await act(async () => {
        await result.current.clearMessages(123);
      });

      expect(result.current.messages).toEqual([]);
    });

    it('should handle clear errors', async () => {
      mockEventBus.publish.mockRejectedValue(new Error('Clear failed'));
      
      const { result } = renderHook(() => useConcurrentChat({
        eventBus: mockEventBus,
        serviceContainer: mockServiceContainer,
        pluginManager: mockPluginManager
      }));

      await act(async () => {
        await result.current.clearMessages(123);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe('session management', () => {
    it('should handle session changes', () => {
      const { result, rerender } = renderHook(
        ({ session }) => useConcurrentChat({
          eventBus: mockEventBus,
          serviceContainer: mockServiceContainer,
          pluginManager: mockPluginManager,
          session
        }),
        {
          initialProps: { session: { user: { id: 'user1' } } }
        }
      );

      rerender({ session: { user: { id: 'user2' } } });

      expect(result.current.session).toEqual({ user: { id: 'user2' } });
    });

    it('should clear state on session change', () => {
      const { result, rerender } = renderHook(
        ({ session }) => useConcurrentChat({
          eventBus: mockEventBus,
          serviceContainer: mockServiceContainer,
          pluginManager: mockPluginManager,
          session
        }),
        {
          initialProps: { session: { user: { id: 'user1' } } }
        }
      );

      // Add some state
      act(() => {
        result.current.messages = [{ id: 'msg-1', content: 'test', role: 'user' }];
        result.current.processingMessages.add('msg-1');
      });

      // Change session
      rerender({ session: { user: { id: 'user2' } } });

      expect(result.current.messages).toEqual([]);
      expect(result.current.processingMessages.size).toBe(0);
    });
  });

  describe('abort controller management', () => {
    it('should create abort controllers for messages', async () => {
      const { result } = renderHook(() => useConcurrentChat({
        eventBus: mockEventBus,
        serviceContainer: mockServiceContainer,
        pluginManager: mockPluginManager
      }));

      await act(async () => {
        await result.current.sendMessage('Hello world', 123);
      });

      const abortControllers = (result.current as any).abortControllers;
      expect(abortControllers.size).toBeGreaterThan(0);
    });

    it('should cleanup abort controllers on unmount', () => {
      const { result, unmount } = renderHook(() => useConcurrentChat({
        eventBus: mockEventBus,
        serviceContainer: mockServiceContainer,
        pluginManager: mockPluginManager
      }));

      // Add some abort controllers
      const abortControllers = (result.current as any).abortControllers;
      const mockAbortController = { abort: jest.fn() };
      abortControllers.set('msg-123', mockAbortController);

      unmount();

      expect(mockAbortController.abort).toHaveBeenCalled();
    });

    it('should cleanup abort controllers on message completion', async () => {
      const { result } = renderHook(() => useConcurrentChat({
        eventBus: mockEventBus,
        serviceContainer: mockServiceContainer,
        pluginManager: mockPluginManager
      }));

      await act(async () => {
        await result.current.sendMessage('Hello world', 123);
      });

      const abortControllers = (result.current as any).abortControllers;
      const mockAbortController = { abort: jest.fn() };
      abortControllers.set('msg-123', mockAbortController);

      act(() => {
        result.current.handleMessageCompleted('msg-123');
      });

      expect(abortControllers.has('msg-123')).toBe(false);
    });
  });

  describe('plugin integration', () => {
    it('should integrate with plugin system', () => {
      renderHook(() => useConcurrentChat({
        eventBus: mockEventBus,
        serviceContainer: mockServiceContainer,
        pluginManager: mockPluginManager
      }));

      expect(mockPluginManager.initializeAllPlugins).toHaveBeenCalled();
      expect(mockPluginManager.startAllPlugins).toHaveBeenCalled();
    });

    it('should handle plugin events', () => {
      const { result } = renderHook(() => useConcurrentChat({
        eventBus: mockEventBus,
        serviceContainer: mockServiceContainer,
        pluginManager: mockPluginManager
      }));

      act(() => {
        result.current.handlePluginEvent('plugin.event', { data: 'test' });
      });

      expect(mockPluginManager.publishEventToPlugins).toHaveBeenCalledWith('plugin.event', { data: 'test' });
    });

    it('should handle plugin errors', () => {
      const { result } = renderHook(() => useConcurrentChat({
        eventBus: mockEventBus,
        serviceContainer: mockServiceContainer,
        pluginManager: mockPluginManager
      }));

      act(() => {
        result.current.handlePluginError(new Error('Plugin error'));
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe('event-driven state updates', () => {
    it('should update state on message events', () => {
      const { result } = renderHook(() => useConcurrentChat({
        eventBus: mockEventBus,
        serviceContainer: mockServiceContainer,
        pluginManager: mockPluginManager
      }));

      act(() => {
        result.current.handleMessageEvent('message.sent', { messageId: 'msg-123' });
      });

      expect(result.current.processingMessages.has('msg-123')).toBe(true);
    });

    it('should update state on completion events', () => {
      const { result } = renderHook(() => useConcurrentChat({
        eventBus: mockEventBus,
        serviceContainer: mockServiceContainer,
        pluginManager: mockPluginManager
      }));

      // Add a processing message first
      act(() => {
        result.current.processingMessages.add('msg-123');
      });

      act(() => {
        result.current.handleMessageEvent('message.completed', { messageId: 'msg-123' });
      });

      expect(result.current.processingMessages.has('msg-123')).toBe(false);
    });

    it('should update state on error events', () => {
      const { result } = renderHook(() => useConcurrentChat({
        eventBus: mockEventBus,
        serviceContainer: mockServiceContainer,
        pluginManager: mockPluginManager
      }));

      act(() => {
        result.current.handleMessageEvent('message.error', { 
          messageId: 'msg-123', 
          error: new Error('Test error') 
        });
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.processingMessages.has('msg-123')).toBe(false);
    });
  });

  describe('extensible action system', () => {
    it('should support custom actions', () => {
      const { result } = renderHook(() => useConcurrentChat({
        eventBus: mockEventBus,
        serviceContainer: mockServiceContainer,
        pluginManager: mockPluginManager
      }));

      const customAction = jest.fn();
      act(() => {
        result.current.registerAction('custom.action', customAction);
      });

      act(() => {
        result.current.executeAction('custom.action', { data: 'test' });
      });

      expect(customAction).toHaveBeenCalledWith({ data: 'test' });
    });

    it('should handle action errors', () => {
      const { result } = renderHook(() => useConcurrentChat({
        eventBus: mockEventBus,
        serviceContainer: mockServiceContainer,
        pluginManager: mockPluginManager
      }));

      const errorAction = jest.fn().mockImplementation(() => {
        throw new Error('Action failed');
      });

      act(() => {
        result.current.registerAction('error.action', errorAction);
      });

      act(() => {
        result.current.executeAction('error.action', { data: 'test' });
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe('dependency injection integration', () => {
    it('should use service container for dependencies', () => {
      const mockMessageService = { sendMessage: jest.fn() };
      mockServiceContainer.get.mockReturnValue(mockMessageService);

      const { result } = renderHook(() => useConcurrentChat({
        eventBus: mockEventBus,
        serviceContainer: mockServiceContainer,
        pluginManager: mockPluginManager
      }));

      expect(mockServiceContainer.get).toHaveBeenCalled();
    });

    it('should handle missing services gracefully', () => {
      mockServiceContainer.get.mockReturnValue(undefined);

      const { result } = renderHook(() => useConcurrentChat({
        eventBus: mockEventBus,
        serviceContainer: mockServiceContainer,
        pluginManager: mockPluginManager
      }));

      expect(result.current.error).toBeDefined();
    });
  });

  describe('model selection integration', () => {
    it('should handle model changes', async () => {
      const { result } = renderHook(() => useConcurrentChat({
        eventBus: mockEventBus,
        serviceContainer: mockServiceContainer,
        pluginManager: mockPluginManager
      }));

      await act(async () => {
        await result.current.changeModel('gpt-4', 123);
      });

      expect(mockEventBus.publish).toHaveBeenCalledWith('model.changed', {
        model: 'gpt-4',
        roomId: 123
      });
    });

    it('should handle model change errors', async () => {
      mockEventBus.publish.mockRejectedValue(new Error('Model change failed'));
      
      const { result } = renderHook(() => useConcurrentChat({
        eventBus: mockEventBus,
        serviceContainer: mockServiceContainer,
        pluginManager: mockPluginManager
      }));

      await act(async () => {
        await result.current.changeModel('gpt-4', 123);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe('performance considerations', () => {
    it('should handle many messages efficiently', async () => {
      const { result } = renderHook(() => useConcurrentChat({
        eventBus: mockEventBus,
        serviceContainer: mockServiceContainer,
        pluginManager: mockPluginManager
      }));

      const startTime = Date.now();

      await act(async () => {
        const promises = Array.from({ length: 100 }, (_, i) => 
          result.current.sendMessage(`Message ${i}`, 123)
        );
        await Promise.all(promises);
      });

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(10000); // Should complete within 10 seconds
    });

    it('should handle frequent state updates efficiently', () => {
      const { result } = renderHook(() => useConcurrentChat({
        eventBus: mockEventBus,
        serviceContainer: mockServiceContainer,
        pluginManager: mockPluginManager
      }));

      const startTime = Date.now();

      act(() => {
        for (let i = 0; i < 1000; i++) {
          result.current.processingMessages.add(`msg-${i}`);
        }
      });

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });

  describe('error handling', () => {
    it('should handle initialization errors', () => {
      mockPluginManager.initializeAllPlugins.mockRejectedValue(new Error('Init failed'));

      const { result } = renderHook(() => useConcurrentChat({
        eventBus: mockEventBus,
        serviceContainer: mockServiceContainer,
        pluginManager: mockPluginManager
      }));

      expect(result.current.error).toBeDefined();
    });

    it('should handle event subscription errors', () => {
      mockEventBus.subscribe.mockImplementation(() => {
        throw new Error('Subscription failed');
      });

      const { result } = renderHook(() => useConcurrentChat({
        eventBus: mockEventBus,
        serviceContainer: mockServiceContainer,
        pluginManager: mockPluginManager
      }));

      expect(result.current.error).toBeDefined();
    });

    it('should clear errors when appropriate', () => {
      const { result } = renderHook(() => useConcurrentChat({
        eventBus: mockEventBus,
        serviceContainer: mockServiceContainer,
        pluginManager: mockPluginManager
      }));

      // Set an error
      act(() => {
        result.current.error = new Error('Test error');
      });

      // Clear error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('cleanup and unmounting', () => {
    it('should cleanup on unmount', () => {
      const { result, unmount } = renderHook(() => useConcurrentChat({
        eventBus: mockEventBus,
        serviceContainer: mockServiceContainer,
        pluginManager: mockPluginManager
      }));

      unmount();

      expect(mockEventBus.unsubscribe).toHaveBeenCalled();
      expect(mockPluginManager.destroyAllPlugins).toHaveBeenCalled();
    });

    it('should handle cleanup errors gracefully', () => {
      mockPluginManager.destroyAllPlugins.mockRejectedValue(new Error('Cleanup failed'));

      const { unmount } = renderHook(() => useConcurrentChat({
        eventBus: mockEventBus,
        serviceContainer: mockServiceContainer,
        pluginManager: mockPluginManager
      }));

      // Should not throw
      expect(() => unmount()).not.toThrow();
    });
  });
}); 