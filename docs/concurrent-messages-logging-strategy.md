# Concurrent Messages - Logging Strategy

## Overview

**Goal**: Implement comprehensive logging throughout the concurrent message processing system to enable quick debugging and monitoring.

**Strategy**: Use structured logging with message IDs, timestamps, and context to track the entire message lifecycle.

---

## 🎯 Logging Categories

### 1. **Message Lifecycle Logs**
Track each message from creation to completion.

### 2. **State Management Logs**
Monitor state changes and transitions.

### 3. **Concurrent Processing Logs**
Track multiple messages running simultaneously.

### 4. **Error & Exception Logs**
Capture and categorize errors with context.

### 5. **Performance Logs**
Monitor timing and performance metrics.

---

## 📋 Logging Implementation Plan

### **Phase 1: Core Logging Infrastructure**

#### 1.1 Create Logging Utility
**File**: `src/features/chat/utils/logger.ts`

```typescript
interface LogContext {
  messageId?: string;
  roomId?: number;
  operation?: string;
  timestamp?: number;
  duration?: number;
  error?: Error;
}

class ConcurrentMessageLogger {
  private static instance: ConcurrentMessageLogger;
  
  static getInstance(): ConcurrentMessageLogger {
    if (!ConcurrentMessageLogger.instance) {
      ConcurrentMessageLogger.instance = new ConcurrentMessageLogger();
    }
    return ConcurrentMessageLogger.instance;
  }

  info(message: string, context: LogContext = {}) {
    console.log(`[CONCURRENT-MSG] ${message}`, {
      ...context,
      timestamp: Date.now(),
      level: 'INFO'
    });
  }

  debug(message: string, context: LogContext = {}) {
    console.debug(`[CONCURRENT-MSG] ${message}`, {
      ...context,
      timestamp: Date.now(),
      level: 'DEBUG'
    });
  }

  warn(message: string, context: LogContext = {}) {
    console.warn(`[CONCURRENT-MSG] ${message}`, {
      ...context,
      timestamp: Date.now(),
      level: 'WARN'
    });
  }

  error(message: string, context: LogContext = {}) {
    console.error(`[CONCURRENT-MSG] ${message}`, {
      ...context,
      timestamp: Date.now(),
      level: 'ERROR',
      stack: context.error?.stack
    });
  }

  performance(operation: string, duration: number, context: LogContext = {}) {
    console.log(`[CONCURRENT-MSG-PERF] ${operation} took ${duration}ms`, {
      ...context,
      timestamp: Date.now(),
      duration,
      level: 'PERFORMANCE'
    });
  }
}

export const logger = ConcurrentMessageLogger.getInstance();
```

#### 1.2 Add Message ID Generator
**File**: `src/features/chat/utils/messageIdGenerator.ts`

```typescript
export const generateMessageId = (): string => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
```

---

## 📋 Phase 2: State Management Logging

### 2.1 Update useChatState Hook
**File**: `src/features/chat/hooks/useChatState.ts`

**Add Logging Points**:
```typescript
import { logger } from '../utils/logger';

// In startMessageProcessing
const startMessageProcessing = useCallback((messageId: string) => {
  logger.info('Starting message processing', { messageId });
  setLoadingStates(prev => {
    const newState = { 
      ...prev, 
      processingMessages: new Set([...(prev.processingMessages || []), messageId]) 
    };
    logger.debug('Updated loading states', { 
      messageId, 
      processingCount: newState.processingMessages.size 
    });
    return newState;
  });
}, [setLoadingStates]);

// In stopMessageProcessing
const stopMessageProcessing = useCallback((messageId: string) => {
  logger.info('Stopping message processing', { messageId });
  setLoadingStates(prev => {
    const newProcessing = new Set(prev.processingMessages || []);
    newProcessing.delete(messageId);
    const newState = { ...prev, processingMessages: newProcessing };
    logger.debug('Updated loading states', { 
      messageId, 
      processingCount: newState.processingMessages.size 
    });
    return newState;
  });
}, [setLoadingStates]);

// In isMessageProcessing
const isMessageProcessing = useCallback((messageId: string) => {
  const isProcessing = processingMessages.has(messageId);
  logger.debug('Checking message processing status', { messageId, isProcessing });
  return isProcessing;
}, [processingMessages]);
```

### 2.2 Update Message Queue Logging
**File**: `src/features/chat/hooks/useChatState.ts`

```typescript
// In addMessageToQueue
const addMessageToQueue = useCallback((messageId: string, content: string) => {
  logger.info('Adding message to queue', { messageId, contentLength: content.length });
  setMessageQueue(prev => {
    const newQueue = [...prev, { id: messageId, content, status: 'pending', timestamp: Date.now() }];
    logger.debug('Updated message queue', { 
      messageId, 
      queueSize: newQueue.length 
    });
    return newQueue;
  });
}, []);

// In updateMessageStatus
const updateMessageStatus = useCallback((messageId: string, status: MessageStatus) => {
  logger.info('Updating message status', { messageId, status });
  setMessageQueue(prev => {
    const newQueue = prev.map(msg => 
      msg.id === messageId ? { ...msg, status } : msg
    );
    logger.debug('Updated message queue status', { 
      messageId, 
      status, 
      queueSize: newQueue.length 
    });
    return newQueue;
  });
}, []);
```

---

## 📋 Phase 3: Message Actions Logging

### 3.1 Update useMessageActions Hook
**File**: `src/features/chat/hooks/useMessageActions.ts`

```typescript
import { logger } from '../utils/logger';
import { generateMessageId } from '../utils/messageIdGenerator';

const sendMessage = useCallback(async (userContent: string) => {
  const messageId = generateMessageId();
  const startTime = Date.now();
  
  logger.info('Starting message send process', { 
    messageId, 
    contentLength: userContent.length,
    roomId 
  });

  startMessageProcessing(messageId);

  try {
    logger.debug('Calling sendMessageHandler', { messageId });
    
    await sendMessageHandler({
      messageId,
      userContent: userContent.trim(),
      numericRoomId: roomId,
      messages,
      setMessages: customSetMessages,
      setIsTyping: (isTyping: boolean) => {
        logger.debug('Typing state changed', { messageId, isTyping });
      },
      setDrafts,
      model: selectedModel,
    });

    const duration = Date.now() - startTime;
    logger.info('Message sent successfully', { messageId, duration });
    logger.performance('Message send complete', duration, { messageId });

  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Message send failed', { 
      messageId, 
      error: error as Error,
      duration 
    });
    stopMessageProcessing(messageId);
    throw error;
  }
}, [roomId, messages, setMessages, startNewMessageLoading, stopNewMessageLoading, setDrafts, selectedModel]);
```

### 3.2 Update Custom SetMessages Function
```typescript
const customSetMessages = (newMessages: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => {
  const updatedMessages = typeof newMessages === 'function' ? newMessages(messages) : newMessages;
  
  // Check if the last message (assistant message) now has content
  const lastMessage = updatedMessages[updatedMessages.length - 1];
  if (lastMessage && lastMessage.role === 'assistant' && lastMessage.content.length > 0) {
    logger.info('Assistant message content detected', { 
      messageId,
      contentLength: lastMessage.content.length 
    });
    stopNewMessageLoading();
  }
  
  logger.debug('Updating messages array', { 
    messageId,
    messageCount: updatedMessages.length,
    lastMessageRole: lastMessage?.role 
  });
  
  setMessages(newMessages);
};
```

---

## 📋 Phase 4: Service Layer Logging

### 4.1 Update MessageSenderService
**File**: `src/features/chat/services/core/MessageSenderService.ts`

```typescript
import { logger } from '../../utils/logger';

async sendMessage(request: SendMessageRequest): Promise<SendMessageResult> {
  const startTime = Date.now();
  const { messageId, userContent, numericRoomId, messages, model } = request;
  
  logger.info('MessageSenderService: Starting message send', {
    messageId,
    roomId: numericRoomId,
    model,
    messageCount: messages.length,
    contentLength: userContent.length
  });

  try {
    // Step 1: Update UI state
    logger.debug('MessageSenderService: Updating UI state', { messageId });
    this.uiStateService.updateMessageState({ messageId, regenerateIndex, userMsg, assistantMsg });
    
    // Step 2: Prepare API request
    logger.debug('MessageSenderService: Preparing API request', { messageId });
    const apiRequest: AIApiRequest = { roomId, messages: currentMessages, model };
    
    // Step 3: Call AI API
    logger.info('MessageSenderService: Calling AI API', { messageId, model });
    const apiResponse = await this.retryService.retryOperation(
      () => this.aiApiService.sendMessage(apiRequest, session.access_token),
      'AI API call'
    );
    
    // Step 4: Process response
    logger.info('MessageSenderService: AI response received', { 
      messageId, 
      responseLength: apiResponse.content?.length || 0 
    });
    
    // Step 5: Animate response
    logger.debug('MessageSenderService: Starting response animation', { messageId });
    this.uiStateService.animateResponse({
      messageId,
      fullContent,
      regenerateIndex,
      onComplete: async () => {
        logger.info('MessageSenderService: Animation completed', { messageId });
        // ... database operations
      }
    });

    const duration = Date.now() - startTime;
    logger.info('MessageSenderService: Message send completed', { messageId, duration });
    logger.performance('MessageSenderService total time', duration, { messageId });

    return { success: true, roomId, duration };

  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('MessageSenderService: Message send failed', {
      messageId,
      error: error as Error,
      duration
    });
    return { success: false, error: (error as Error).message, duration };
  }
}
```

### 4.2 Update UI State Service
**File**: `src/features/chat/services/implementations/ReactUIStateService.ts`

```typescript
import { logger } from '../../utils/logger';

updateMessageState(args: {
  messageId: string;
  regenerateIndex?: number;
  userMsg: ChatMessage;
  assistantMsg: ChatMessage;
}): void {
  const { messageId, regenerateIndex } = args;
  
  logger.info('ReactUIStateService: Updating message state', { messageId, regenerateIndex });
  
  handleMessageState({
    messageId,
    regenerateIndex,
    setMessages: this.setMessages,
    userMsg: args.userMsg,
    assistantMsg: args.assistantMsg,
  });
  
  logger.debug('ReactUIStateService: Message state updated', { messageId });
}

setTyping(isTyping: boolean, messageId?: string): void {
  logger.debug('ReactUIStateService: Setting typing state', { messageId, isTyping });
  this.setIsTyping(isTyping);
}

animateResponse(args: {
  messageId: string;
  fullContent: string;
  regenerateIndex?: number;
  onComplete: () => void;
}): void {
  const { messageId, fullContent } = args;
  
  logger.info('ReactUIStateService: Starting response animation', { 
    messageId, 
    contentLength: fullContent.length 
  });
  
  animateResponse({
    messageId,
    fullContent,
    setMessages: this.setMessages,
    setIsTyping: this.setIsTyping,
    regenerateIndex: args.regenerateIndex,
    onComplete: () => {
      logger.info('ReactUIStateService: Animation completed', { messageId });
      args.onComplete();
    }
  });
}
```

---

## 📋 Phase 5: Animation Service Logging

### 5.1 Update animateResponse Function
**File**: `src/features/chat/services/legacy/animateResponse.ts`

```typescript
import { logger } from '../../utils/logger';

export const animateResponse = ({
  messageId,
  fullContent,
  setMessages,
  setIsTyping,
  regenerateIndex,
  onComplete,
}: AnimateResponseArgs): void => {
  const startTime = Date.now();
  
  logger.info('animateResponse: Starting typewriter animation', { 
    messageId, 
    contentLength: fullContent.length,
    regenerateIndex 
  });

  let tempContent = '';
  let charCount = 0;
  
  const typeInterval = setInterval(() => {
    if (tempContent.length < fullContent.length) {
      tempContent += fullContent.charAt(tempContent.length);
      charCount++;
      
      if (charCount % 50 === 0) { // Log every 50 characters
        logger.debug('animateResponse: Animation progress', { 
          messageId, 
          progress: `${tempContent.length}/${fullContent.length}`,
          percentage: Math.round((tempContent.length / fullContent.length) * 100)
        });
      }
      
      setMessages((prev) => {
        const updated = [...prev];
        const targetIndex = regenerateIndex !== undefined ? regenerateIndex : updated.length - 1;
        updated[targetIndex] = { role: 'assistant', content: tempContent };
        return updated;
      });
    } else {
      clearInterval(typeInterval);
      
      const duration = Date.now() - startTime;
      logger.info('animateResponse: Animation completed', { 
        messageId, 
        duration,
        totalCharacters: fullContent.length 
      });
      logger.performance('Typewriter animation', duration, { messageId });
      
      setIsTyping(false);
      onComplete();
    }
  }, 20);
};
```

---

## 📋 Phase 6: UI Component Logging

### 6.1 Update ChatInput Component
**File**: `src/features/chat/components/ChatInput/index.tsx`

```typescript
import { logger } from '../../utils/logger';

const ChatInput: React.FC<ChatInputProps> = ({
  input,
  onChangeText,
  onSend,
  sending,
  isTyping,
  inputRef,
}) => {
  const handleSend = () => {
    logger.info('ChatInput: Send button pressed', { 
      inputLength: input.length,
      sending,
      isTyping 
    });
    onSend();
  };

  const handleKeyPress = ({ nativeEvent }: any) => {
    if (nativeEvent.key === 'Enter' && !sending && input.trim()) {
      logger.info('ChatInput: Enter key pressed', { 
        inputLength: input.length 
      });
      onSend();
    }
  };

  // Log when input is blocked
  if (sending || isTyping) {
    logger.debug('ChatInput: Input is disabled', { sending, isTyping });
  }

  return (
    <View style={styles.inputRow}>
      <TextInput
        // ... existing props
        onKeyPress={handleKeyPress}
      />
      <TouchableOpacity
        onPress={handleSend}
        disabled={sending || isTyping || !input.trim()}
      >
        <Text>{sending ? t('chat.sending') : t('chat.send')}</Text>
      </TouchableOpacity>
    </View>
  );
};
```

### 6.2 Update MessageList Component
**File**: `src/features/chat/components/MessageList/index.tsx`

```typescript
import { logger } from '../../utils/logger';

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isNewMessageLoading,
  regeneratingIndices,
  onRegenerate,
  showWelcomeText,
}) => {
  useEffect(() => {
    logger.debug('MessageList: Messages updated', { 
      messageCount: messages.length,
      isNewMessageLoading,
      regeneratingCount: regeneratingIndices.size
    });
  }, [messages, isNewMessageLoading, regeneratingIndices]);

  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
    const isRegenerating = regeneratingIndices.has(index);
    
    logger.debug('MessageList: Rendering message', { 
      index,
      role: item.role,
      contentLength: item.content.length,
      isRegenerating
    });

    return (
      <MessageItem
        message={item}
        index={index}
        isNewMessageLoading={isNewMessageLoading && index === messages.length}
        isRegenerating={isRegenerating}
        onRegenerate={
          item.role === 'assistant' && !isRegenerating && !isNewMessageLoading
            ? () => {
                logger.info('MessageList: Regenerate requested', { index });
                onRegenerate(index);
              }
            : undefined
        }
        showAvatar={showAvatar}
        isLastInGroup={isLastInGroup}
      />
    );
  };

  return (
    <FlatList
      data={messagesWithLoading}
      renderItem={renderMessage}
      onContentSizeChange={() => {
        logger.debug('MessageList: Content size changed, scrolling to end');
        flatListRef.current?.scrollToEnd({ animated: true });
      }}
    />
  );
};
```

---

## 📋 Phase 7: Error Handling Logging

### 7.1 Add Error Boundary Logging
**File**: `src/features/chat/components/ErrorBoundary.tsx`

```typescript
import { logger } from '../utils/logger';

class ChatErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('ChatErrorBoundary: Error caught', {
      error: error,
      errorInfo: errorInfo,
      componentStack: errorInfo.componentStack
    });
  }

  render() {
    if (this.state.hasError) {
      logger.error('ChatErrorBoundary: Rendering error UI');
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

### 7.2 Add Network Error Logging
**File**: `src/features/chat/services/core/AIApiService.ts`

```typescript
async sendMessage(request: AIApiRequest, accessToken: string): Promise<AIResponse> {
  const startTime = Date.now();
  const requestId = generateRequestId();
  
  logger.info('AIApiService: Making API request', {
    requestId,
    model: request.model,
    messageCount: request.messages.length
  });

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('AIApiService: API request failed', {
        requestId,
        status: response.status,
        statusText: response.statusText,
        errorText
      });
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const duration = Date.now() - startTime;
    
    logger.info('AIApiService: API request successful', {
      requestId,
      duration,
      responseLength: data.content?.length || 0
    });
    logger.performance('AI API call', duration, { requestId });

    return data;

  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('AIApiService: API request error', {
      requestId,
      error: error as Error,
      duration
    });
    throw error;
  }
}
```

---

## 📋 Phase 8: Performance Monitoring

### 8.1 Add Performance Logging
**File**: `src/features/chat/utils/performanceMonitor.ts`

```typescript
import { logger } from './logger';

export class PerformanceMonitor {
  private static timers: Map<string, number> = new Map();

  static startTimer(operation: string, context: LogContext = {}) {
    const timerId = `${operation}_${Date.now()}`;
    this.timers.set(timerId, Date.now());
    logger.debug('PerformanceMonitor: Timer started', { operation, timerId, ...context });
    return timerId;
  }

  static endTimer(timerId: string, context: LogContext = {}) {
    const startTime = this.timers.get(timerId);
    if (startTime) {
      const duration = Date.now() - startTime;
      this.timers.delete(timerId);
      logger.performance('Operation completed', duration, { timerId, ...context });
      return duration;
    }
    return 0;
  }

  static logMemoryUsage(context: LogContext = {}) {
    if (typeof performance !== 'undefined' && performance.memory) {
      const memory = performance.memory;
      logger.debug('PerformanceMonitor: Memory usage', {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        ...context
      });
    }
  }
}
```

---

## 🎯 Logging Best Practices

### **1. Structured Logging**
- Always include messageId in context
- Use consistent log levels (INFO, DEBUG, WARN, ERROR)
- Include relevant metadata (timestamps, durations, counts)

### **2. Performance Logging**
- Log operation start and end times
- Track memory usage for concurrent operations
- Monitor UI rendering performance

### **3. Error Logging**
- Include full error objects with stack traces
- Log error context (messageId, roomId, operation)
- Categorize errors by type

### **4. Debug Logging**
- Log state transitions
- Track message queue changes
- Monitor concurrent operation counts

### **5. Production Considerations**
- Add log level filtering
- Implement log rotation
- Consider external logging services

---

## 🚀 Implementation Checklist

- [ ] Create logging utility (`logger.ts`)
- [ ] Add message ID generator
- [ ] Implement state management logging
- [ ] Add message actions logging
- [ ] Update service layer logging
- [ ] Add UI component logging
- [ ] Implement error handling logging
- [ ] Add performance monitoring
- [ ] Test logging in development
- [ ] Configure production logging levels

---

**Last Updated**: January 2025  
**Author**: AI Assistant  
**Status**: Ready for Implementation 