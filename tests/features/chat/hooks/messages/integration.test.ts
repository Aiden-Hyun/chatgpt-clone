// tests/features/chat/hooks/messages/integration.test.ts
import { act, renderHook } from '@testing-library/react';
import { useMessagesCombined } from '../../../../../src/features/chat/hooks/messages/useMessagesCombined';
import { sendMessageHandler } from '../../../../../src/features/chat/services/sendMessage/index';
import { ChatMessage } from '../../../../../src/features/chat/types';

// Mock the sendMessageHandler
const mockSendMessageHandler = sendMessageHandler as jest.MockedFunction<typeof sendMessageHandler>;

describe('Message Hooks Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('State Sharing Integration', () => {
    it('should share state between all hooks correctly', () => {
      const { result } = renderHook(() => useMessagesCombined(1));

      // Test that state updates are reflected across all hooks
      act(() => {
        result.current.setMessages([{ role: 'user', content: 'Test message' }]);
        result.current.setIsTyping(true);
      });

      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].content).toBe('Test message');
      expect(result.current.isTyping).toBe(true);
    });

    it('should maintain state consistency during message operations', () => {
      const { result } = renderHook(() => useMessagesCombined(1));

      // Simulate a complete message flow
      act(() => {
        result.current.setMessages([
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hi there!' }
        ]);
        result.current.setIsTyping(true);
      });

      expect(result.current.messages).toHaveLength(2);
      expect(result.current.messages[0].role).toBe('user');
      expect(result.current.messages[1].role).toBe('assistant');
      expect(result.current.isTyping).toBe(true);
    });
  });

  describe('Message Sending Integration', () => {
    it('should handle complete message sending flow', async () => {
      const { result } = renderHook(() => useMessagesCombined(1));
      const mockSetDrafts = jest.fn();

      mockSendMessageHandler.mockResolvedValue(undefined);

      // Set up initial state
      act(() => {
        result.current.setMessages([{ role: 'user', content: 'Previous message' }]);
      });

      // Send a new message
      await act(async () => {
        await result.current.sendMessage('New message', {}, mockSetDrafts);
      });

      expect(mockSendMessageHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          userContent: 'New message',
          numericRoomId: 1,
          setDrafts: mockSetDrafts,
        })
      );
    });

    it('should handle message sending errors gracefully', async () => {
      const { result } = renderHook(() => useMessagesCombined(1));
      const testError = new Error('Network error');

      mockSendMessageHandler.mockRejectedValue(testError);

      await act(async () => {
        try {
          await result.current.sendMessage('Test message', {}, jest.fn());
        } catch (error) {
          expect(error).toBe(testError);
        }
      });

      // State should remain consistent after error
      expect(result.current.messages).toEqual([]);
    });
  });

  describe('Message Regeneration Integration', () => {
    it('should handle complete message regeneration flow', async () => {
      const { result } = renderHook(() => useMessagesCombined(1));
      const mockSetDrafts = jest.fn();

      // Set up messages for regeneration
      const testMessages: ChatMessage[] = [
        { role: 'user', content: 'Original question' },
        { role: 'assistant', content: 'Original answer' }
      ];

      act(() => {
        result.current.setMessages(testMessages);
      });

      mockSendMessageHandler.mockResolvedValue(undefined);

      // Regenerate the assistant message
      await act(async () => {
        await result.current.regenerateMessage(1, {}, mockSetDrafts);
      });

      expect(mockSendMessageHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          userContent: 'Original question',
          regenerateIndex: 1,
          originalAssistantContent: 'Original answer',
          setDrafts: mockSetDrafts,
        })
      );
    });

    it('should handle regeneration errors gracefully', async () => {
      const { result } = renderHook(() => useMessagesCombined(1));
      const testError = new Error('Regeneration failed');

      const testMessages: ChatMessage[] = [
        { role: 'user', content: 'Question' },
        { role: 'assistant', content: 'Answer' }
      ];

      act(() => {
        result.current.setMessages(testMessages);
      });

      mockSendMessageHandler.mockRejectedValue(testError);

      await act(async () => {
        try {
          await result.current.regenerateMessage(1, {}, jest.fn());
        } catch (error) {
          expect(error).toBe(testError);
        }
      });

      // Messages should remain unchanged after error
      expect(result.current.messages).toEqual(testMessages);
    });
  });

  describe('Model Selection Integration', () => {
    it('should provide model selection functionality', () => {
      const { result } = renderHook(() => useMessagesCombined(1));

      expect(result.current.selectedModel).toBe('gpt-3.5-turbo');
      expect(typeof result.current.updateModel).toBe('function');
    });
  });

  describe('Loading State Integration', () => {
    it('should handle loading states correctly', () => {
      const { result } = renderHook(() => useMessagesCombined(1));

      expect(result.current.loading).toBe(true);
      expect(result.current.sending).toBe(false);
      expect(result.current.isTyping).toBe(false);
    });
  });

  describe('Error Handling Integration', () => {
    it('should maintain state consistency during errors', async () => {
      const { result } = renderHook(() => useMessagesCombined(1));

      // Set up initial state
      act(() => {
        result.current.setMessages([{ role: 'user', content: 'Initial message' }]);
        result.current.setIsTyping(true);
      });

      const initialMessages = result.current.messages;
      const initialTyping = result.current.isTyping;

      // Simulate an error during send
      mockSendMessageHandler.mockRejectedValue(new Error('Test error'));

      await act(async () => {
        try {
          await result.current.sendMessage('Failing message', {}, jest.fn());
        } catch (error) {
          // Error should be caught
        }
      });

      // State should remain consistent
      expect(result.current.messages).toEqual(initialMessages);
      expect(result.current.isTyping).toBe(initialTyping);
    });
  });

  describe('Backward Compatibility Integration', () => {
    it('should maintain the same interface as the original useMessages', () => {
      const { result } = renderHook(() => useMessagesCombined(1));

      // Check that all expected properties are present and functional
      expect(result.current.messages).toBeDefined();
      expect(result.current.loading).toBeDefined();
      expect(result.current.sending).toBeDefined();
      expect(result.current.isTyping).toBeDefined();
      expect(result.current.selectedModel).toBeDefined();
      expect(result.current.setMessages).toBeDefined();
      expect(result.current.setIsTyping).toBeDefined();
      expect(result.current.sendMessage).toBeDefined();
      expect(result.current.regenerateMessage).toBeDefined();
      expect(result.current.updateModel).toBeDefined();
    });
  });

  describe('Complex Scenarios Integration', () => {
    it('should handle rapid message operations', async () => {
      const { result } = renderHook(() => useMessagesCombined(1));

      mockSendMessageHandler.mockResolvedValue(undefined);

      // Perform multiple operations rapidly
      await act(async () => {
        await Promise.all([
          result.current.sendMessage('Message 1', {}, jest.fn()),
          result.current.sendMessage('Message 2', {}, jest.fn()),
        ]);
      });

      expect(mockSendMessageHandler).toHaveBeenCalledTimes(2);
    });

    it('should handle mixed operations (send + regenerate)', async () => {
      const { result } = renderHook(() => useMessagesCombined(1));

      const testMessages: ChatMessage[] = [
        { role: 'user', content: 'Question' },
        { role: 'assistant', content: 'Answer' }
      ];

      act(() => {
        result.current.setMessages(testMessages);
      });

      mockSendMessageHandler.mockResolvedValue(undefined);

      // Send a new message and regenerate an existing one
      await act(async () => {
        await Promise.all([
          result.current.sendMessage('New question', {}, jest.fn()),
          result.current.regenerateMessage(1, {}, jest.fn()),
        ]);
      });

      expect(mockSendMessageHandler).toHaveBeenCalledTimes(2);
    });

    it('should handle state updates during async operations', async () => {
      const { result } = renderHook(() => useMessagesCombined(1));

      // Create a controlled promise
      let resolvePromise: (value: void) => void;
      const controlledPromise = new Promise<void>(resolve => {
        resolvePromise = resolve;
      });

      mockSendMessageHandler.mockReturnValue(controlledPromise);

      // Start sending
      const sendPromise = act(async () => {
        return result.current.sendMessage('Test message', {}, jest.fn());
      });

      // Update state during the async operation
      act(() => {
        result.current.setMessages([{ role: 'user', content: 'Updated during send' }]);
        result.current.setIsTyping(true);
      });

      // Resolve the promise
      resolvePromise!();
      await sendPromise;

      // State should be consistent
      expect(result.current.messages).toEqual([{ role: 'user', content: 'Updated during send' }]);
      expect(result.current.isTyping).toBe(true);
    });
  });
}); 