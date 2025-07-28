import { act, renderHook } from '@testing-library/react';
import { useMessageState } from '../../../../../src/features/chat/hooks/messages/useMessageState';
import { ChatMessage } from '../../../../../src/features/chat/types';

describe('useMessageState', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useMessageState());

    expect(result.current.messages).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.sending).toBe(false);
    expect(result.current.isTyping).toBe(false);
  });

  it('should provide all required state setters', () => {
    const { result } = renderHook(() => useMessageState());

    expect(typeof result.current.setMessages).toBe('function');
    expect(typeof result.current.setLoading).toBe('function');
    expect(typeof result.current.setSending).toBe('function');
    expect(typeof result.current.setIsTyping).toBe('function');
  });

  it('should update messages state', () => {
    const { result } = renderHook(() => useMessageState());
    const testMessage: ChatMessage = { role: 'user', content: 'Hello' };

    act(() => {
      result.current.setMessages([testMessage]);
    });

    expect(result.current.messages).toEqual([testMessage]);
  });

  it('should update loading state', () => {
    const { result } = renderHook(() => useMessageState());

    act(() => {
      result.current.setLoading(false);
    });

    expect(result.current.loading).toBe(false);
  });

  it('should update sending state', () => {
    const { result } = renderHook(() => useMessageState());

    act(() => {
      result.current.setSending(true);
    });

    expect(result.current.sending).toBe(true);
  });

  it('should update typing state', () => {
    const { result } = renderHook(() => useMessageState());

    act(() => {
      result.current.setIsTyping(true);
    });

    expect(result.current.isTyping).toBe(true);
  });

  it('should handle multiple state updates', () => {
    const { result } = renderHook(() => useMessageState());
    const testMessages: ChatMessage[] = [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there!' }
    ];

    act(() => {
      result.current.setMessages(testMessages);
      result.current.setLoading(false);
      result.current.setSending(true);
      result.current.setIsTyping(true);
    });

    expect(result.current.messages).toEqual(testMessages);
    expect(result.current.loading).toBe(false);
    expect(result.current.sending).toBe(true);
    expect(result.current.isTyping).toBe(true);
  });

  it('should maintain state between renders', () => {
    const { result, rerender } = renderHook(() => useMessageState());
    const testMessage: ChatMessage = { role: 'user', content: 'Test' };

    act(() => {
      result.current.setMessages([testMessage]);
      result.current.setLoading(false);
    });

    rerender();

    expect(result.current.messages).toEqual([testMessage]);
    expect(result.current.loading).toBe(false);
  });

  it('should handle complex message arrays', () => {
    const { result } = renderHook(() => useMessageState());
    const complexMessages: ChatMessage[] = [
      { role: 'user', content: 'First message' },
      { role: 'assistant', content: 'First response' },
      { role: 'user', content: 'Second message' },
      { role: 'assistant', content: 'Second response' }
    ];

    act(() => {
      result.current.setMessages(complexMessages);
    });

    expect(result.current.messages).toHaveLength(4);
    expect(result.current.messages[0].role).toBe('user');
    expect(result.current.messages[1].role).toBe('assistant');
    expect(result.current.messages[2].role).toBe('user');
    expect(result.current.messages[3].role).toBe('assistant');
  });

  it('should handle empty message arrays', () => {
    const { result } = renderHook(() => useMessageState());

    act(() => {
      result.current.setMessages([]);
    });

    expect(result.current.messages).toEqual([]);
    expect(result.current.messages).toHaveLength(0);
  });

  it('should handle state transitions correctly', () => {
    const { result } = renderHook(() => useMessageState());

    // Initial state
    expect(result.current.loading).toBe(true);
    expect(result.current.sending).toBe(false);
    expect(result.current.isTyping).toBe(false);

    // Start sending
    act(() => {
      result.current.setSending(true);
      result.current.setIsTyping(true);
    });

    expect(result.current.sending).toBe(true);
    expect(result.current.isTyping).toBe(true);

    // Finish sending
    act(() => {
      result.current.setSending(false);
      result.current.setIsTyping(false);
    });

    expect(result.current.sending).toBe(false);
    expect(result.current.isTyping).toBe(false);
  });
}); 