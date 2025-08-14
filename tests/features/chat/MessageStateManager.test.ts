// tests/features/chat/MessageStateManager.test.ts
import { MessageStateManager } from '../../../src/features/chat/services/MessageStateManager';
import { ChatMessage } from '../../../src/features/chat/types';

describe('MessageStateManager', () => {
  let messages: ChatMessage[];
  let messageStateManager: MessageStateManager;

  const updater = (fn: (prev: ChatMessage[]) => ChatMessage[] | ChatMessage[]) => {
    if (typeof fn === 'function') {
      messages = fn(messages);
    }
  };

  beforeEach(() => {
    messages = [];
    const setMessages = (
      updaterFn:
        | ChatMessage[]
        | ((prevState: ChatMessage[]) => ChatMessage[])
    ) => {
      if (typeof updaterFn === 'function') {
        messages = updaterFn(messages);
      } else {
        messages = updaterFn;
      }
    };
    messageStateManager = new MessageStateManager(setMessages);
  });

  it('should create a user message', () => {
    messageStateManager.createUserMessage('user1', 'Hello');
    expect(messages).toEqual([
      { id: 'user1', role: 'user', content: 'Hello', state: 'completed' },
    ]);
  });

  it('should create a loading assistant message', () => {
    messageStateManager.createLoadingMessage('assistant1');
    expect(messages).toEqual([
      { id: 'assistant1', role: 'assistant', content: '', state: 'loading' },
    ]);
  });

  it('should create a user and assistant message pair', () => {
    messageStateManager.createMessagePair('user1', 'Hi', 'assistant1');
    expect(messages).toEqual([
      { id: 'user1', role: 'user', content: 'Hi', state: 'completed' },
      { id: 'assistant1', role: 'assistant', content: '', state: 'loading' },
    ]);
  });

  it('should transition a message to a new state', () => {
    messageStateManager.createLoadingMessage('assistant1');
    messageStateManager.transition('assistant1', 'completed');
    expect(messages[0].state).toBe('completed');
  });

  it('should update streaming content', () => {
    messageStateManager.createLoadingMessage('assistant1');
    messageStateManager.updateStreamingContent('assistant1', 'Hello');
    expect(messages[0].content).toBe('Hello');
    expect(messages[0].state).toBe('loading');
  });

  it('should finish streaming and set to animating', () => {
    messageStateManager.createLoadingMessage('assistant1');
    messageStateManager.updateStreamingContent('assistant1', 'Hello');
    messageStateManager.finishStreamingAndAnimate('assistant1', 'Hello World');
    expect(messages[0].content).toBe('');
    expect(messages[0].fullContent).toBe('Hello World');
    expect(messages[0].state).toBe('animating');
  });

  it('should mark a message as completed', () => {
    messageStateManager.createLoadingMessage('assistant1');
    messageStateManager.finishStreamingAndAnimate('assistant1', 'Hello');
    messageStateManager.markCompleted('assistant1');
    expect(messages[0].state).toBe('completed');
    expect(messages[0].fullContent).toBeUndefined();
  });

  it('should mark a message as error', () => {
    messageStateManager.createLoadingMessage('assistant1');
    messageStateManager.markError('assistant1', 'An error occurred');
    expect(messages[0].state).toBe('error');
    expect(messages[0].content).toBe('An error occurred');
  });
  
  it('should handle regeneration', () => {
    jest.useFakeTimers();
    messageStateManager.createMessagePair('u1', 'q1', 'a1');
    messageStateManager.markCompleted('a1');
    
    messageStateManager.handleRegeneration('a1', 'New answer');
    
    expect(messages[1].state).toBe('loading');
    expect(messages[1].content).toBe('');
    
    jest.runAllTimers();
    
    expect(messages[1].state).toBe('animating');
    expect(messages[1].fullContent).toBe('New answer');
    
    jest.useRealTimers();
  });

  it('should batch update messages', () => {
    messageStateManager.createMessagePair('u1', 'q1', 'a1');
    messageStateManager.createMessagePair('u2', 'q2', 'a2');
    
    messageStateManager.batchUpdate([
        { messageId: 'a1', changes: { content: 'Answer 1' } },
        { messageId: 'a2', changes: { state: 'completed' } },
    ]);

    expect(messages.find(m => m.id === 'a1')?.content).toBe('Answer 1');
    expect(messages.find(m => m.id === 'a2')?.state).toBe('completed');
    expect(messages.find(m => m.id === 'u1')?.content).toBe('q1');
  });
});
