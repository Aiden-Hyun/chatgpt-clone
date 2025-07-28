# Modularized Message Hooks

This directory contains the modularized version of the `useMessages` hook, broken down into focused, single-responsibility hooks.

## Structure

```
messages/
├── useMessageState.ts          # Core state management (messages, loading, sending, typing)
├── useMessageLoading.ts        # Message loading and fetching logic
├── useMessageActions.ts        # Send message actions
├── useMessageRegeneration.ts   # Message regeneration specific logic
├── useMessagesCombined.ts      # Backward compatibility wrapper
├── index.ts                    # Barrel exports
├── README.md                   # Documentation
├── BUG_FIX.md                  # Message sending bug fix documentation
└── __tests__/
    ├── useMessagesCombined.test.ts
    ├── messageSendingBug.test.ts
    └── stateSharing.test.ts
```

## Critical Bug Fix: State Sharing

### 🐛 **The Problem**
The original modularization had a critical flaw where each hook created its own instance of `useMessageState()`, causing:
- Messages to disappear from UI after sending (but appear after refresh)
- State inconsistencies between hooks
- Broken message sending flow

### ✅ **The Solution**
Fixed by implementing proper state sharing:
- Single `useMessageState()` instance created in `useMessagesCombined`
- All other hooks receive the shared state as a parameter
- Ensures all hooks operate on the same state

### 🔧 **Implementation**
```typescript
// Before (Broken)
export const useMessagesCombined = (numericRoomId: number | null) => {
  const { isTyping, setIsTyping } = useMessageState(); // ❌ Separate instance
  const { messages, setMessages, loading } = useMessageLoading(numericRoomId); // ❌ Separate instance
  const { sendMessage, sending } = useMessageActions(numericRoomId); // ❌ Separate instance
};

// After (Fixed)
export const useMessagesCombined = (numericRoomId: number | null) => {
  const messageState = useMessageState(); // ✅ Single shared instance
  const { loading } = useMessageLoading(numericRoomId, messageState); // ✅ Shared state
  const { sendMessage, sending } = useMessageActions(numericRoomId, messageState); // ✅ Shared state
};
```

## Hooks Overview

### `useMessageState`
**Purpose:** Single source of truth for all message-related state
**Responsibilities:**
- Manage messages array
- Manage loading state
- Manage sending state
- Manage typing state

**Usage:**
```typescript
const { messages, loading, sending, isTyping, setMessages, setLoading, setSending, setIsTyping } = useMessageState();
```

### `useMessageLoading`
**Purpose:** Handle message loading, authentication, and navigation
**Responsibilities:**
- Session authentication
- Message fetching from storage/database
- Navigation to login if no session
- Loading state management

**Usage:**
```typescript
const { loading } = useMessageLoading(numericRoomId, messageState);
```

### `useMessageActions`
**Purpose:** Handle message sending actions
**Responsibilities:**
- Message sending coordination
- Integration with `sendMessageHandler`
- Sending state management

**Usage:**
```typescript
const { sendMessage, sending } = useMessageActions(numericRoomId, messageState);
```

### `useMessageRegeneration`
**Purpose:** Handle message regeneration logic
**Responsibilities:**
- Message regeneration coordination
- Finding user messages before assistant messages
- Regeneration state management

**Usage:**
```typescript
const { regenerateMessage } = useMessageRegeneration(numericRoomId, messageState);
```

### `useMessagesCombined`
**Purpose:** Backward compatibility wrapper
**Responsibilities:**
- Orchestrate all modularized hooks
- Maintain existing API contract
- Provide unified interface
- **Ensure proper state sharing**

**Usage:**
```typescript
const {
  messages,
  loading,
  sending,
  isTyping,
  selectedModel,
  setMessages,
  setIsTyping,
  sendMessage,
  regenerateMessage,
  updateModel,
} = useMessagesCombined(numericRoomId);
```

## Migration

### From Old `useMessages`
The old `useMessages` hook has been replaced with `useMessagesCombined` which maintains the exact same API:

```typescript
// Old
import { useMessages } from './useMessages';
const result = useMessages(numericRoomId);

// New
import { useMessagesCombined } from './messages';
const result = useMessagesCombined(numericRoomId);
```

### Using Individual Hooks
For more granular control, you can use individual hooks:

```typescript
import { useMessageState, useMessageLoading, useMessageActions, useMessageRegeneration } from './messages';

const messageState = useMessageState();
const { loading } = useMessageLoading(numericRoomId, messageState);
const { sendMessage } = useMessageActions(numericRoomId, messageState);
const { regenerateMessage } = useMessageRegeneration(numericRoomId, messageState);
```

## Benefits

1. **Single Responsibility:** Each hook has one clear purpose
2. **Testability:** Each hook can be tested in isolation
3. **Reusability:** Hooks can be reused in different contexts
4. **Maintainability:** Changes to one concern don't affect others
5. **Readability:** Clear separation of concerns makes code easier to understand
6. **Backward Compatibility:** Existing code continues to work without changes
7. **State Consistency:** Proper state sharing prevents UI bugs

## Testing

Each hook has its own test file in the `tests/features/chat/hooks/messages/` directory. The modular structure makes it easy to test individual concerns in isolation.

### Comprehensive Test Suite

A complete test suite has been created under `tests/features/chat/hooks/messages/` with the following coverage:

- **`useMessageState.test.ts`** - Core state management tests
- **`useMessageActions.test.ts`** - Message sending action tests  
- **`useMessageRegeneration.test.ts`** - Message regeneration tests
- **`useMessagesCombined.test.ts`** - Integration wrapper tests
- **`integration.test.ts`** - End-to-end integration tests

### Running Tests

```bash
# Run all message hook tests
npm test -- tests/features/chat/hooks/messages/

# Run specific test files
npm test -- tests/features/chat/hooks/messages/useMessageState.test.ts
npm test -- tests/features/chat/hooks/messages/integration.test.ts
```

### Test Coverage

The test suite provides comprehensive coverage of:
- ✅ State management and sharing
- ✅ Message sending and regeneration
- ✅ Error handling and recovery
- ✅ Edge cases and boundary conditions
- ✅ Backward compatibility
- ✅ Integration between all hooks

See `tests/features/chat/hooks/messages/README.md` for detailed test documentation.

## Known Issues and Fixes

### ✅ Fixed: Message Disappearing After Send
**Problem:** Messages would disappear from UI after sending but appear after refresh
**Root Cause:** Multiple `useMessageState()` instances not sharing state
**Solution:** Implemented proper state sharing with single state instance

### ✅ Fixed: Input Clearing Before Send
**Problem:** Input would clear before message was sent, causing message loss on errors
**Root Cause:** `clearInput()` called before `sendMessageToBackend()`
**Solution:** Moved `clearInput()` to after successful send with proper error handling 