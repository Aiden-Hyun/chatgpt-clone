# Delta Diagnostics - Detailed Findings

## 1. MessageList uses id-based keys ✅ PASS

**File**: `src/features/chat/components/MessageList/index.tsx`  
**Lines**: 320-323

```typescript
keyExtractor={(item: any, index: number) => {
  const key = item.id || `fallback_${index}`;
  return key;
}}
```

**Status**: ✅ **PASS** - MessageList correctly uses `item.id` for keyExtractor with fallback to index

---

## 2. SENT handler never marks user messages `processing` ✅ PASS

**File**: `src/features/concurrent-chat/core/hooks/useConcurrentChat.ts`  
**Lines**: 83-87

```typescript
const isAssistant = event.message.role === 'assistant';
// Only set processing for assistant placeholders; user messages should reflect completed status
updatedMessages[existingMessageIndex] = isAssistant
  ? { ...updatedMessages[existingMessageIndex], status: 'processing' }
  : { ...updatedMessages[existingMessageIndex], ...event.message };
```

**Status**: ✅ **PASS** - SENT handler correctly guards against marking user messages as `processing`

---

## 3. Assistant failure path: on AI error, assistant placeholder → `failed` (user stays non-failed) ❌ FAIL

**File**: `src/features/concurrent-chat/core/hooks/useConcurrentChat.ts`  
**Lines**: 128-140

```typescript
subscriptions.push(
  eventBus.subscribe(MESSAGE_EVENT_TYPES.MESSAGE_FAILED, (event: MessageEvent) => {
    if (event.type === MESSAGE_EVENT_TYPES.MESSAGE_FAILED) {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === event.message.id 
            ? { ...msg, status: 'failed', error: event.error }
            : msg
        )
      );
      setError(event.error);
    }
  })
);
```

**Status**: ❌ **FAIL** - Missing role-based guard to ensure only assistant messages are marked as `failed`

**Issue**: The MESSAGE_FAILED handler applies `failed` status to ANY message with matching ID, without checking if it's an assistant message. User messages could be incorrectly marked as failed.

**Expected**: Should include guard like `msg.role === 'assistant'` before applying failed status.

---

## 4. First-turn persistence uses `activeRoomIdRef.current` (value, not ref object) ❌ FAIL

**File**: `src/features/concurrent-chat/ui/ConcurrentChat.tsx`  
**Line**: 141

```typescript
serviceContainer.register('activeRoomId', activeRoomIdRef);
```

**File**: `src/features/concurrent-chat/services/ConcurrentMessageProcessor.ts`  
**Line**: 167

```typescript
const preId = (this.serviceContainer as any).get?.('activeRoomId');
```

**Status**: ❌ **FAIL** - Registering the ref object instead of its value

**Issue**: The entire `activeRoomIdRef` object is being registered, not its current value. The persistence service receives the ref object instead of the numeric room ID.

**Expected**: Should register `activeRoomIdRef.current` and extract the value properly in the processor.

---

## 5. AbortController wired end-to-end: send → stream → cancel, with ignore-late semantics ❌ FAIL

**Files searched**:
- `src/features/concurrent-chat/services/ConcurrentAIService.ts` (lines 85-182)
- `src/features/concurrent-chat/core/commands/index.ts` (lines 210-301)
- `src/features/concurrent-chat/core/hooks/useConcurrentChat.ts` (lines 210-231)

**Status**: ❌ **FAIL** - No AbortController implementation found

**Issues**:
1. **No AbortController in streaming**: `ConcurrentAIService.sendMessageWithStreaming()` uses basic fetch but doesn't pass AbortSignal
2. **No cancellation propagation**: `CancelMessageCommand` and `cancelMessage()` only update local state, don't abort ongoing requests
3. **No ignore-late semantics**: No mechanism to ignore responses that arrive after cancellation

**Missing implementation**:
- AbortController creation and signal passing to fetch requests
- Cancellation propagation from UI → commands → services → network
- Late response filtering to prevent cancelled messages from updating state

**Expected**: Complete cancellation flow with proper AbortController usage and ignore-late response handling.
