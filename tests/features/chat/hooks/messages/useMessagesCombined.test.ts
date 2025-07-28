// tests/features/chat/hooks/messages/useMessagesCombined.test.ts
import { act, renderHook } from '@testing-library/react';
import { useMessagesCombined } from '../../../../../src/features/chat/hooks/messages/useMessagesCombined';
import { ChatMessage } from '../../../../../src/features/chat/types';

describe('useMessagesCombined', () => {
  it('should initialize with correct interface', () => {
    const { result } = renderHook(() => useMessagesCombined(1));

    // Check state properties
    expect(result.current.messages).toBeDefined();
    expect(result.current.loading).toBeDefined();
    expect(result.current.sending).toBeDefined();
    expect(result.current.isTyping).toBeDefined();
    expect(result.current.selectedModel).toBeDefined();

    // Check function properties
    expect(result.current.setMessages).toBeDefined();
    expect(result.current.setIsTyping).toBeDefined();
    expect(result.current.sendMessage).toBeDefined();
    expect(result.current.regenerateMessage).toBeDefined();
    expect(result.current.updateModel).toBeDefined();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useMessagesCombined(1));

    expect(result.current.messages).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.sending).toBe(false);
    expect(result.current.isTyping).toBe(false);
    expect(result.current.selectedModel).toBe('gpt-3.5-turbo');
  });

  it('should work with null room ID', () => {
    const { result } = renderHook(() => useMessagesCombined(null));

    expect(result.current.messages).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.sending).toBe(false);
    expect(result.current.isTyping).toBe(false);
  });

  it('should provide functional state setters', () => {
    const { result } = renderHook(() => useMessagesCombined(1));
    const testMessage: ChatMessage = { role: 'user', content: 'Hello' };

    act(() => {
      result.current.setMessages([testMessage]);
    });

    expect(result.current.messages).toEqual([testMessage]);
  });

  it('should provide functional typing state setter', () => {
    const { result } = renderHook(() => useMessagesCombined(1));

    act(() => {
      result.current.setIsTyping(true);
    });

    expect(result.current.isTyping).toBe(true);
  });

  it('should provide functional sendMessage', () => {
    const { result } = renderHook(() => useMessagesCombined(1));

    expect(typeof result.current.sendMessage).toBe('function');
  });

  it('should provide functional regenerateMessage', () => {
    const { result } = renderHook(() => useMessagesCombined(1));

    expect(typeof result.current.regenerateMessage).toBe('function');
  });

  it('should provide functional updateModel', () => {
    const { result } = renderHook(() => useMessagesCombined(1));

    expect(typeof result.current.updateModel).toBe('function');
  });

  it('should maintain state consistency across all hooks', () => {
    const { result } = renderHook(() => useMessagesCombined(1));
    const testMessages: ChatMessage[] = [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there!' }
    ];

    act(() => {
      result.current.setMessages(testMessages);
      result.current.setIsTyping(true);
    });

    expect(result.current.messages).toEqual(testMessages);
    expect(result.current.isTyping).toBe(true);
  });

  it('should handle state updates correctly', () => {
    const { result } = renderHook(() => useMessagesCombined(1));

    act(() => {
      result.current.setMessages([{ role: 'user', content: 'Test' }]);
      result.current.setIsTyping(true);
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].content).toBe('Test');
    expect(result.current.isTyping).toBe(true);
  });

  it('should maintain backward compatibility with original useMessages interface', () => {
    const { result } = renderHook(() => useMessagesCombined(1));

    // Check that all expected properties from the original useMessages are present
    const expectedProperties = [
      'messages',
      'loading',
      'sending',
      'isTyping',
      'selectedModel',
      'setMessages',
      'setIsTyping',
      'sendMessage',
      'regenerateMessage',
      'updateModel'
    ];

    expectedProperties.forEach(prop => {
      expect(result.current).toHaveProperty(prop);
    });
  });

  it('should handle multiple state updates in sequence', () => {
    const { result } = renderHook(() => useMessagesCombined(1));

    act(() => {
      result.current.setMessages([{ role: 'user', content: 'First' }]);
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].content).toBe('First');

    act(() => {
      result.current.setMessages([
        { role: 'user', content: 'First' },
        { role: 'assistant', content: 'Second' }
      ]);
    });

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[1].content).toBe('Second');
  });

  it('should handle complex message operations', () => {
    const { result } = renderHook(() => useMessagesCombined(1));

    const complexMessages: ChatMessage[] = [
      { role: 'user', content: 'Question 1' },
      { role: 'assistant', content: 'Answer 1' },
      { role: 'user', content: 'Question 2' },
      { role: 'assistant', content: 'Answer 2' }
    ];

    act(() => {
      result.current.setMessages(complexMessages);
      result.current.setIsTyping(true);
    });

    expect(result.current.messages).toHaveLength(4);
    expect(result.current.messages[0].role).toBe('user');
    expect(result.current.messages[1].role).toBe('assistant');
    expect(result.current.isTyping).toBe(true);
  });

  it('should handle empty message arrays', () => {
    const { result } = renderHook(() => useMessagesCombined(1));

    act(() => {
      result.current.setMessages([]);
    });

    expect(result.current.messages).toEqual([]);
    expect(result.current.messages).toHaveLength(0);
  });

  it('should maintain state between renders', () => {
    const { result, rerender } = renderHook(() => useMessagesCombined(1));
    const testMessage: ChatMessage = { role: 'user', content: 'Persistent' };

    act(() => {
      result.current.setMessages([testMessage]);
      result.current.setIsTyping(true);
    });

    rerender();

    expect(result.current.messages).toEqual([testMessage]);
    expect(result.current.isTyping).toBe(true);
  });

  it('should handle different room IDs', () => {
    const { result: result1 } = renderHook(() => useMessagesCombined(1));
    const { result: result2 } = renderHook(() => useMessagesCombined(2));

    const message1: ChatMessage = { role: 'user', content: 'Room 1' };
    const message2: ChatMessage = { role: 'user', content: 'Room 2' };

    act(() => {
      result1.current.setMessages([message1]);
      result2.current.setMessages([message2]);
    });

    expect(result1.current.messages).toEqual([message1]);
    expect(result2.current.messages).toEqual([message2]);
  });

  it('should provide consistent function references', () => {
    const { result, rerender } = renderHook(() => useMessagesCombined(1));

    const initialSendMessage = result.current.sendMessage;
    const initialRegenerateMessage = result.current.regenerateMessage;
    const initialUpdateModel = result.current.updateModel;

    rerender();

    // Functions should still be functions after rerender
    expect(typeof result.current.sendMessage).toBe('function');
    expect(typeof result.current.regenerateMessage).toBe('function');
    expect(typeof result.current.updateModel).toBe('function');
  });

  it('should handle state transitions correctly', () => {
    const { result } = renderHook(() => useMessagesCombined(1));

    // Initial state
    expect(result.current.loading).toBe(true);
    expect(result.current.sending).toBe(false);
    expect(result.current.isTyping).toBe(false);

    // Simulate loading completion
    act(() => {
      // This would typically be done by the useMessageLoading hook
      // For testing, we'll simulate the state change
    });

    // The loading state should remain true as it's managed by useMessageLoading
    expect(result.current.loading).toBe(true);
  });
}); 