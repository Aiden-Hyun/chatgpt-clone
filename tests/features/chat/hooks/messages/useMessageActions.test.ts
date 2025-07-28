import { act, renderHook } from '@testing-library/react';
import { useMessageActions } from '../../../../../src/features/chat/hooks/messages/useMessageActions';
import { useMessageState } from '../../../../../src/features/chat/hooks/messages/useMessageState';
import { sendMessageHandler } from '../../../../../src/features/chat/services/sendMessage/index';

// Mock the sendMessageHandler
const mockSendMessageHandler = sendMessageHandler as jest.MockedFunction<typeof sendMessageHandler>;

describe('useMessageActions', () => {
  let messageState: ReturnType<typeof useMessageState>;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create a fresh message state for each test
    const { result } = renderHook(() => useMessageState());
    messageState = result.current;
  });

  it('should initialize with correct interface', () => {
    const { result } = renderHook(() => useMessageActions(1, messageState));

    expect(result.current.sendMessage).toBeDefined();
    expect(typeof result.current.sendMessage).toBe('function');
    expect(result.current.sending).toBe(false);
  });

  it('should not send message when content is empty', async () => {
    const { result } = renderHook(() => useMessageActions(1, messageState));

    await act(async () => {
      await result.current.sendMessage('', {}, jest.fn());
    });

    expect(mockSendMessageHandler).not.toHaveBeenCalled();
  });

  it('should not send message when content is only whitespace', async () => {
    const { result } = renderHook(() => useMessageActions(1, messageState));

    await act(async () => {
      await result.current.sendMessage('   ', {}, jest.fn());
    });

    expect(mockSendMessageHandler).not.toHaveBeenCalled();
  });

  it('should send message with correct parameters', async () => {
    const { result } = renderHook(() => useMessageActions(1, messageState));
    const mockSetDrafts = jest.fn();
    const testContent = 'Hello, world!';
    const testDrafts = { '1': 'previous draft' };

    mockSendMessageHandler.mockResolvedValue(undefined);

    await act(async () => {
      await result.current.sendMessage(testContent, testDrafts, mockSetDrafts);
    });

    expect(mockSendMessageHandler).toHaveBeenCalledWith({
      userContent: testContent,
      numericRoomId: 1,
      messages: messageState.messages,
      setMessages: messageState.setMessages,
      setIsTyping: messageState.setIsTyping,
      setDrafts: mockSetDrafts,
      model: 'gpt-3.5-turbo',
    });
  });

  it('should handle sending state correctly', async () => {
    const { result } = renderHook(() => useMessageActions(1, messageState));

    // Mock a delayed response
    mockSendMessageHandler.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    const sendPromise = act(async () => {
      return result.current.sendMessage('Test message', {}, jest.fn());
    });

    // Check that sending state is set to true
    expect(result.current.sending).toBe(true);

    await sendPromise;

    // Check that sending state is set back to false
    expect(result.current.sending).toBe(false);
  });

  it('should handle errors correctly', async () => {
    const { result } = renderHook(() => useMessageActions(1, messageState));
    const testError = new Error('Network error');

    mockSendMessageHandler.mockRejectedValue(testError);

    await act(async () => {
      try {
        await result.current.sendMessage('Test message', {}, jest.fn());
      } catch (error) {
        expect(error).toBe(testError);
      }
    });

    // Check that sending state is reset on error
    expect(result.current.sending).toBe(false);
  });

  it('should work with null room ID', async () => {
    const { result } = renderHook(() => useMessageActions(null, messageState));

    mockSendMessageHandler.mockResolvedValue(undefined);

    await act(async () => {
      await result.current.sendMessage('Test message', {}, jest.fn());
    });

    expect(mockSendMessageHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        numericRoomId: null,
      })
    );
  });

  it('should trim message content', async () => {
    const { result } = renderHook(() => useMessageActions(1, messageState));

    mockSendMessageHandler.mockResolvedValue(undefined);

    await act(async () => {
      await result.current.sendMessage('  Hello, world!  ', {}, jest.fn());
    });

    expect(mockSendMessageHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        userContent: 'Hello, world!',
      })
    );
  });

  it('should handle multiple rapid sends', async () => {
    const { result } = renderHook(() => useMessageActions(1, messageState));

    mockSendMessageHandler.mockResolvedValue(undefined);

    // Send multiple messages rapidly
    await act(async () => {
      await Promise.all([
        result.current.sendMessage('First message', {}, jest.fn()),
        result.current.sendMessage('Second message', {}, jest.fn()),
        result.current.sendMessage('Third message', {}, jest.fn()),
      ]);
    });

    expect(mockSendMessageHandler).toHaveBeenCalledTimes(3);
  });

  it('should pass drafts correctly', async () => {
    const { result } = renderHook(() => useMessageActions(1, messageState));
    const mockSetDrafts = jest.fn();
    const testDrafts = {
      '1': 'draft 1',
      '2': 'draft 2',
    };

    mockSendMessageHandler.mockResolvedValue(undefined);

    await act(async () => {
      await result.current.sendMessage('Test message', testDrafts, mockSetDrafts);
    });

    expect(mockSendMessageHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        setDrafts: mockSetDrafts,
      })
    );
  });

  it('should handle empty drafts object', async () => {
    const { result } = renderHook(() => useMessageActions(1, messageState));
    const mockSetDrafts = jest.fn();

    mockSendMessageHandler.mockResolvedValue(undefined);

    await act(async () => {
      await result.current.sendMessage('Test message', {}, mockSetDrafts);
    });

    expect(mockSendMessageHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        setDrafts: mockSetDrafts,
      })
    );
  });

  it('should maintain sending state during async operations', async () => {
    const { result } = renderHook(() => useMessageActions(1, messageState));

    // Create a promise that we can control
    let resolvePromise: (value: void) => void;
    const controlledPromise = new Promise<void>(resolve => {
      resolvePromise = resolve;
    });

    mockSendMessageHandler.mockReturnValue(controlledPromise);

    // Start sending
    const sendPromise = act(async () => {
      return result.current.sendMessage('Test message', {}, jest.fn());
    });

    // Check that sending is true during the operation
    expect(result.current.sending).toBe(true);

    // Resolve the promise
    resolvePromise!(undefined);
    await sendPromise;

    // Check that sending is false after completion
    expect(result.current.sending).toBe(false);
  });
}); 