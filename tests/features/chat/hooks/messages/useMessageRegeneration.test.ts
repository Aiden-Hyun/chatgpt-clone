import { act, renderHook } from '@testing-library/react';
import { useMessageRegeneration } from '../../../../../src/features/chat/hooks/messages/useMessageRegeneration';
import { useMessageState } from '../../../../../src/features/chat/hooks/messages/useMessageState';
import { sendMessageHandler } from '../../../../../src/features/chat/services/sendMessage/index';
import { ChatMessage } from '../../../../../src/features/chat/types';

// Mock the sendMessageHandler
const mockSendMessageHandler = sendMessageHandler as jest.MockedFunction<typeof sendMessageHandler>;

describe('useMessageRegeneration', () => {
  let messageState: ReturnType<typeof useMessageState>;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create a fresh message state for each test
    const { result } = renderHook(() => useMessageState());
    messageState = result.current;
  });

  it('should initialize with correct interface', () => {
    const { result } = renderHook(() => useMessageRegeneration(1, messageState));

    expect(result.current.regenerateMessage).toBeDefined();
    expect(typeof result.current.regenerateMessage).toBe('function');
  });

  it('should not regenerate when index is out of bounds (negative)', async () => {
    const { result } = renderHook(() => useMessageRegeneration(1, messageState));

    await act(async () => {
      await result.current.regenerateMessage(-1, {}, jest.fn());
    });

    expect(mockSendMessageHandler).not.toHaveBeenCalled();
  });

  it('should not regenerate when index is out of bounds (too high)', async () => {
    const { result } = renderHook(() => useMessageRegeneration(1, messageState));

    await act(async () => {
      await result.current.regenerateMessage(10, {}, jest.fn());
    });

    expect(mockSendMessageHandler).not.toHaveBeenCalled();
  });

  it('should not regenerate user messages', async () => {
    const { result } = renderHook(() => useMessageRegeneration(1, messageState));

    // Set up messages with a user message at index 0
    act(() => {
      messageState.setMessages([
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there!' }
      ]);
    });

    await act(async () => {
      await result.current.regenerateMessage(0, {}, jest.fn());
    });

    expect(mockSendMessageHandler).not.toHaveBeenCalled();
  });

  it('should not regenerate when previous message is not user', async () => {
    const { result } = renderHook(() => useMessageRegeneration(1, messageState));

    // Set up messages with assistant message at index 1, but no user message before it
    act(() => {
      messageState.setMessages([
        { role: 'assistant', content: 'First assistant message' },
        { role: 'assistant', content: 'Second assistant message' }
      ]);
    });

    await act(async () => {
      await result.current.regenerateMessage(1, {}, jest.fn());
    });

    expect(mockSendMessageHandler).not.toHaveBeenCalled();
  });

  it('should regenerate assistant message correctly', async () => {
    const { result } = renderHook(() => useMessageRegeneration(1, messageState));
    const mockSetDrafts = jest.fn();

    const testMessages: ChatMessage[] = [
      { role: 'user', content: 'Hello, how are you?' },
      { role: 'assistant', content: 'I am doing well, thank you!' }
    ];

    // Set up messages
    act(() => {
      messageState.setMessages(testMessages);
    });

    mockSendMessageHandler.mockResolvedValue(undefined);

    await act(async () => {
      await result.current.regenerateMessage(1, {}, mockSetDrafts);
    });

    expect(mockSendMessageHandler).toHaveBeenCalledWith({
      userContent: 'Hello, how are you?',
      numericRoomId: 1,
      messages: [testMessages[0]], // Only the user message
      setMessages: messageState.setMessages,
      setIsTyping: messageState.setIsTyping,
      setDrafts: mockSetDrafts,
      model: 'gpt-3.5-turbo',
      regenerateIndex: 1,
      originalAssistantContent: 'I am doing well, thank you!',
    });
  });

  it('should handle regeneration with multiple messages', async () => {
    const { result } = renderHook(() => useMessageRegeneration(1, messageState));

    const testMessages: ChatMessage[] = [
      { role: 'user', content: 'First question' },
      { role: 'assistant', content: 'First answer' },
      { role: 'user', content: 'Second question' },
      { role: 'assistant', content: 'Second answer' }
    ];

    // Set up messages
    act(() => {
      messageState.setMessages(testMessages);
    });

    mockSendMessageHandler.mockResolvedValue(undefined);

    await act(async () => {
      await result.current.regenerateMessage(3, {}, jest.fn());
    });

    // Should include all messages up to the user message before the assistant message to regenerate
    expect(mockSendMessageHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        userContent: 'Second question',
        messages: testMessages.slice(0, 3), // First 3 messages
        regenerateIndex: 3,
        originalAssistantContent: 'Second answer',
      })
    );
  });

  it('should work with null room ID', async () => {
    const { result } = renderHook(() => useMessageRegeneration(null, messageState));

    const testMessages: ChatMessage[] = [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there!' }
    ];

    act(() => {
      messageState.setMessages(testMessages);
    });

    mockSendMessageHandler.mockResolvedValue(undefined);

    await act(async () => {
      await result.current.regenerateMessage(1, {}, jest.fn());
    });

    expect(mockSendMessageHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        numericRoomId: null,
      })
    );
  });

  it('should handle errors during regeneration', async () => {
    const { result } = renderHook(() => useMessageRegeneration(1, messageState));
    const testError = new Error('Regeneration failed');

    const testMessages: ChatMessage[] = [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there!' }
    ];

    act(() => {
      messageState.setMessages(testMessages);
    });

    mockSendMessageHandler.mockRejectedValue(testError);

    await act(async () => {
      try {
        await result.current.regenerateMessage(1, {}, jest.fn());
      } catch (error) {
        expect(error).toBe(testError);
      }
    });
  });

  it('should handle regeneration with complex message history', async () => {
    const { result } = renderHook(() => useMessageRegeneration(1, messageState));

    const complexMessages: ChatMessage[] = [
      { role: 'user', content: 'Start conversation' },
      { role: 'assistant', content: 'Hello!' },
      { role: 'user', content: 'Ask about weather' },
      { role: 'assistant', content: 'The weather is sunny' },
      { role: 'user', content: 'Ask about temperature' },
      { role: 'assistant', content: 'It is 25°C' }
    ];

    act(() => {
      messageState.setMessages(complexMessages);
    });

    mockSendMessageHandler.mockResolvedValue(undefined);

    await act(async () => {
      await result.current.regenerateMessage(5, {}, jest.fn());
    });

    expect(mockSendMessageHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        userContent: 'Ask about temperature',
        messages: complexMessages.slice(0, 5), // All messages up to the user message
        regenerateIndex: 5,
        originalAssistantContent: 'It is 25°C',
      })
    );
  });

  it('should handle regeneration with empty messages array', async () => {
    const { result } = renderHook(() => useMessageRegeneration(1, messageState));

    act(() => {
      messageState.setMessages([]);
    });

    await act(async () => {
      await result.current.regenerateMessage(0, {}, jest.fn());
    });

    expect(mockSendMessageHandler).not.toHaveBeenCalled();
  });

  it('should handle regeneration with single message', async () => {
    const { result } = renderHook(() => useMessageRegeneration(1, messageState));

    const singleMessage: ChatMessage[] = [
      { role: 'assistant', content: 'Single message' }
    ];

    act(() => {
      messageState.setMessages(singleMessage);
    });

    await act(async () => {
      await result.current.regenerateMessage(0, {}, jest.fn());
    });

    expect(mockSendMessageHandler).not.toHaveBeenCalled();
  });

  it('should pass drafts correctly during regeneration', async () => {
    const { result } = renderHook(() => useMessageRegeneration(1, messageState));
    const mockSetDrafts = jest.fn();
    const testDrafts = {
      '1': 'draft 1',
      '2': 'draft 2',
    };

    const testMessages: ChatMessage[] = [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there!' }
    ];

    act(() => {
      messageState.setMessages(testMessages);
    });

    mockSendMessageHandler.mockResolvedValue(undefined);

    await act(async () => {
      await result.current.regenerateMessage(1, testDrafts, mockSetDrafts);
    });

    expect(mockSendMessageHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        setDrafts: mockSetDrafts,
      })
    );
  });

  it('should handle multiple regeneration attempts', async () => {
    const { result } = renderHook(() => useMessageRegeneration(1, messageState));

    const testMessages: ChatMessage[] = [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there!' }
    ];

    act(() => {
      messageState.setMessages(testMessages);
    });

    mockSendMessageHandler.mockResolvedValue(undefined);

    // Try to regenerate the same message multiple times
    await act(async () => {
      await Promise.all([
        result.current.regenerateMessage(1, {}, jest.fn()),
        result.current.regenerateMessage(1, {}, jest.fn()),
        result.current.regenerateMessage(1, {}, jest.fn()),
      ]);
    });

    expect(mockSendMessageHandler).toHaveBeenCalledTimes(3);
  });
}); 