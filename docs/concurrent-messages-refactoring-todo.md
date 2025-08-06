# Concurrent Messages Refactoring - To-Do List

## Overview

**Goal**: Enable users to send multiple messages while AI responses are being generated, allowing concurrent message processing.

**Current Problem**: Only one message can be "loading" at a time, new messages are ignored when AI is generating a response.

**Target Outcome**: Multiple messages can be sent concurrently, each with independent loading states and proper UI feedback.

---

## 📋 Phase 1: State Management Refactor (High Priority)

### 1.1 Update Loading States Interface
**File**: `src/features/chat/hooks/useChatState.ts`

**Tasks**:
- [ ] Replace single `newMessage` boolean with message-specific tracking
- [ ] Add `processingMessages: Set<string>` to track multiple concurrent messages
- [ ] Update `LoadingStates` interface
- [ ] Add message ID generation utility

**Code Changes**:
```typescript
interface LoadingStates {
  // ❌ Remove this
  // newMessage?: boolean;
  
  // ✅ Keep existing
  regenerating?: Set<number>;
  
  // ✅ Add this
  processingMessages: Set<string>;
}
```

### 1.2 Add Message Queue System
**File**: `src/features/chat/hooks/useChatState.ts`

**Tasks**:
- [ ] Add message queue interface
- [ ] Implement queue management functions
- [ ] Add message status tracking (pending, processing, completed, failed)
- [ ] Add queue cleanup utilities

**Code Changes**:
```typescript
interface MessageQueueItem {
  id: string;
  content: string;
  timestamp: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}
```

### 1.3 Update State Management Functions
**File**: `src/features/chat/hooks/useChatState.ts`

**Tasks**:
- [ ] Replace `startNewMessageLoading()` with `startMessageProcessing(messageId)`
- [ ] Replace `stopNewMessageLoading()` with `stopMessageProcessing(messageId)`
- [ ] Add `isMessageProcessing(messageId)` function
- [ ] Add `getProcessingMessageIds()` function
- [ ] Update state getters and setters

---

## 📋 Phase 2: Message Actions Refactor (High Priority)

### 2.1 Update Message Actions Hook
**File**: `src/features/chat/hooks/useMessageActions.ts`

**Tasks**:
- [ ] Add message ID generation to `sendMessage` function
- [ ] Replace global loading state with message-specific tracking
- [ ] Update `customSetMessages` to handle multiple messages
- [ ] Add error handling per message
- [ ] Add message cancellation support

**Code Changes**:
```typescript
const sendMessage = useCallback(async (userContent: string) => {
  const messageId = generateMessageId();
  startMessageProcessing(messageId);
  
  try {
    await sendMessageHandler({
      messageId, // ✅ Add message ID
      userContent: userContent.trim(),
      // ... other params
    });
  } catch (error) {
    stopMessageProcessing(messageId);
    throw error;
  }
}, []);
```

### 2.2 Update Message Handler
**File**: `src/features/chat/services/sendMessage/index.ts`

**Tasks**:
- [ ] Add `messageId` parameter to `SendMessageArgs`
- [ ] Update `sendMessageHandler` to accept message ID
- [ ] Pass message ID through to `MessageSenderService`

### 2.3 Update Message Sender Service
**File**: `src/features/chat/services/core/MessageSenderService.ts`

**Tasks**:
- [ ] Add message ID tracking in `SendMessageRequest`
- [ ] Update UI state service calls to include message ID
- [ ] Add message-specific error handling
- [ ] Update logging to include message ID

---

## 📋 Phase 3: UI Components Update (Medium Priority)

### 3.1 Update ChatInput Component
**File**: `src/features/chat/components/ChatInput/index.tsx`

**Tasks**:
- [ ] Remove global blocking logic (`sending` and `isTyping` checks)
- [ ] Only block on empty input validation
- [ ] Update disabled state logic
- [ ] Add visual feedback for concurrent processing

**Code Changes**:
```typescript
// ❌ Remove this
disabled={sending || isTyping || !input.trim()}

// ✅ Change to this
disabled={!input.trim()}
```

### 3.2 Update MessageList Component
**File**: `src/features/chat/components/MessageList/index.tsx`

**Tasks**:
- [ ] Update to handle multiple loading states
- [ ] Add support for message-specific loading indicators
- [ ] Update message rendering logic for concurrent messages
- [ ] Add message ID tracking in rendering

### 3.3 Update MessageItem Component
**File**: `src/features/chat/components/MessageItem/index.tsx`

**Tasks**:
- [ ] Update loading condition logic
- [ ] Add message ID-based loading state checks
- [ ] Support multiple concurrent loading messages
- [ ] Update LoadingMessage rendering logic

### 3.4 Update LoadingMessage Component
**File**: `src/features/chat/components/LoadingMessage/index.tsx`

**Tasks**:
- [ ] Add message ID prop for identification
- [ ] Update animation logic for concurrent messages
- [ ] Add message-specific loading text
- [ ] Ensure animations don't conflict

---

## 📋 Phase 4: Service Layer Updates (High Priority)

### 4.1 Update UI State Service
**File**: `src/features/chat/services/implementations/ReactUIStateService.ts`

**Tasks**:
- [ ] Add message-specific state management methods
- [ ] Update `updateMessageState` to handle message IDs
- [ ] Add concurrent message support
- [ ] Update typing state management

### 4.2 Update Animation Service
**File**: `src/features/chat/services/legacy/animateResponse.ts`

**Tasks**:
- [ ] Add message ID parameter
- [ ] Update animation logic for concurrent messages
- [ ] Ensure animations don't interfere with each other
- [ ] Add message-specific completion callbacks

### 4.3 Update Service Factory
**File**: `src/features/chat/services/core/ServiceFactory.ts`

**Tasks**:
- [ ] Update service creation to support message IDs
- [ ] Add message-specific service instances
- [ ] Update dependency injection for concurrent processing

---

## 📋 Phase 5: Database & API Updates (Medium Priority)

### 5.1 Update Message Service
**File**: `src/features/chat/services/core/MessageService.ts`

**Tasks**:
- [ ] Add message ID tracking in database operations
- [ ] Update message insertion logic for concurrent messages
- [ ] Add message status tracking in database
- [ ] Update error handling for concurrent operations

### 5.2 Update AI API Service
**File**: `src/features/chat/services/core/AIApiService.ts`

**Tasks**:
- [ ] Add request ID tracking
- [ ] Update API calls to include message IDs
- [ ] Add concurrent request support
- [ ] Update error handling for multiple requests

---

## 📋 Phase 6: Error Handling & Edge Cases (Medium Priority)

### 6.1 Add Error Handling Per Message
**Tasks**:
- [ ] Implement message-specific error states
- [ ] Add error recovery mechanisms
- [ ] Update UI to show per-message errors
- [ ] Add retry functionality per message

### 6.2 Handle Edge Cases
**Tasks**:
- [ ] Handle rapid message sending
- [ ] Add message cancellation support
- [ ] Handle network timeouts per message
- [ ] Add message priority queuing

### 6.3 Add Request Cancellation
**Tasks**:
- [ ] Implement request cancellation for individual messages
- [ ] Add cleanup logic for cancelled requests
- [ ] Update UI to show cancellation states
- [ ] Add user controls for message cancellation

---

## 📋 Phase 7: Testing & Validation (High Priority)

### 7.1 Unit Tests
**Tasks**:
- [ ] Add tests for concurrent message processing
- [ ] Test message queue functionality
- [ ] Test error handling per message
- [ ] Test UI state management

### 7.2 Integration Tests
**Tasks**:
- [ ] Test end-to-end concurrent message flow
- [ ] Test multiple AI responses simultaneously
- [ ] Test error scenarios with concurrent messages
- [ ] Test UI responsiveness with multiple loading states

### 7.3 Manual Testing
**Tasks**:
- [ ] Test sending multiple messages rapidly
- [ ] Test concurrent AI responses
- [ ] Test error handling scenarios
- [ ] Test UI performance with multiple loading states

---

## 📋 Phase 8: Performance & Optimization (Low Priority)

### 8.1 Performance Optimization
**Tasks**:
- [ ] Optimize state updates for multiple messages
- [ ] Add message batching if needed
- [ ] Optimize UI rendering for concurrent states
- [ ] Add performance monitoring

### 8.2 Memory Management
**Tasks**:
- [ ] Add cleanup for completed messages
- [ ] Implement message history limits
- [ ] Add memory usage monitoring
- [ ] Optimize message storage

---

## 🎯 Implementation Priority

### **Critical (Must Have)**
1. Phase 1: State Management Refactor
2. Phase 2: Message Actions Refactor
3. Phase 4: Service Layer Updates

### **Important (Should Have)**
4. Phase 3: UI Components Update
5. Phase 7: Testing & Validation

### **Nice to Have**
6. Phase 5: Database & API Updates
7. Phase 6: Error Handling & Edge Cases
8. Phase 8: Performance & Optimization

---

## 📊 Estimated Effort

- **Phase 1**: 2-3 days
- **Phase 2**: 2-3 days
- **Phase 3**: 1-2 days
- **Phase 4**: 2-3 days
- **Phase 5**: 1-2 days
- **Phase 6**: 2-3 days
- **Phase 7**: 2-3 days
- **Phase 8**: 1-2 days

**Total Estimated Time**: 13-21 days

---

## 🚨 Risk Assessment

### **High Risk**
- State management complexity
- Race conditions in concurrent operations
- UI performance with multiple loading states

### **Medium Risk**
- Database concurrency issues
- API rate limiting
- Error handling complexity

### **Low Risk**
- Performance optimization
- Memory management

---

## ✅ Success Criteria

- [ ] Users can send multiple messages while AI is responding
- [ ] Each message has independent loading state
- [ ] UI shows multiple loading indicators correctly
- [ ] No race conditions in state updates
- [ ] Error handling works per message
- [ ] Performance remains acceptable with concurrent messages
- [ ] All existing functionality continues to work

---

**Last Updated**: January 2025  
**Author**: AI Assistant  
**Status**: Planning Phase 