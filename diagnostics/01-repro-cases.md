### Assistant spinner stuck after network error

- **Steps**
  1. Mock `fetch` in `ConcurrentAIService` to reject or return `{ ok:false }`.
  2. Open `ConcurrentChat` and send a message.
- **Expected**: Assistant placeholder transitions to `failed` (or is removed) with a visible error.
- **Actual**: Assistant remains `processing`; spinner does not stop.
- **Logs**: `[AI] POST ...` followed by `MESSAGE_FAILED` for user id; no failure for assistant id.
- **Suspect**
  ```20:214:src/features/concurrent-chat/core/services/ConcurrentMessageProcessor.ts
  // assistant created and SENT, but on error we fail the user message
  const assistantMessage = { id: `assistant_...`, status: 'processing', ... }
  ...
  } catch (error) {
    const failedMessage = { ...message, status: 'failed' };
    this.eventBus.publish(MESSAGE_EVENT_TYPES.MESSAGE_FAILED, { message: failedMessage, ... });
  }
  ```
- **Root cause**: Error transitions the user message, not the assistant placeholder.
- **Confidence**: High.

### Cancel does not stop network/stream

- **Steps**
  1. Trigger a long response or mock streaming in `sendMessageWithStreaming`.
  2. Call `cancelMessage(id)` while streaming.
- **Expected**: Underlying fetch aborted, no more chunks, no completion.
- **Actual**: Fetch continues; later completion updates state after cancel.
- **Suspect**
  ```85:181:src/features/concurrent-chat/core/services/ConcurrentAIService.ts
  await fetch(url, { method: 'POST', headers, body }); // no AbortController signal
  const reader = response.body.getReader(); // no abort wiring
  ```
- **Root cause**: Missing AbortController path; cancel is cosmetic.
- **Confidence**: High.

### Cancel/Retry commands throw

- **Steps**
  1. Execute `new CancelMessageCommand(processor, id).execute()`.
  2. Observe processor behavior.
- **Expected**: Processor handles control command or routes to controller.
- **Actual**: Throws `Invalid message`.
- **Suspect**
  ```30:36:src/features/concurrent-chat/core/services/ConcurrentMessageProcessor.ts
  if (!message || !message.content) throw new Error('Invalid message');
  ```
- **Root cause**: `process` only supports user messages; `type:'cancel'|'retry'` not handled.
- **Confidence**: High.

### User message incorrectly marked as processing

- **Steps**
  1. Send a message; inspect state transitions.
- **Expected**: user -> completed; assistant -> processing -> completed.
- **Actual**: user may become `processing` via SENT handler.
- **Suspect**
  ```71:99:src/features/concurrent-chat/core/hooks/useConcurrentChat.ts
  if (existingIndex >= 0) updated[existingIndex] = { ...updated[existingIndex], status: 'processing' };
  ```
- **Root cause**: SENT handler applies `processing` blindly to existing id.
- **Confidence**: High.

### Out-of-order/duplicate message visuals

- **Steps**
  1. Send two messages quickly.
  2. Watch list while placeholders and completions append.
- **Expected**: stable visual order, no duplicates.
- **Actual**: flicker/duplicates.
- **Suspect**
  ```286:300:src/features/chat/components/MessageList/index.tsx
  keyExtractor={(_, index) => index.toString()} // unstable keys
  ```
- **Root cause**: Index-based keys + dynamic insertions shift identities.
- **Confidence**: High.

### First-turn persistence uses ref object

- **Steps**
  1. New chat, pre-create room in UI, then send.
- **Expected**: persist to numeric room id.
- **Actual**: passes ref object to persistence.
- **Suspect**
  ```119:142:src/features/concurrent-chat/components/ConcurrentChat.tsx
  serviceContainer.register('activeRoomId', activeRoomIdRef);
  ```
  ```162:175:src/features/concurrent-chat/core/services/ConcurrentMessageProcessor.ts
  const preId = (this.serviceContainer as any).get?.('activeRoomId');
  persistFirstTurn({ numericRoomId: preId ?? null, ... });
  ```
- **Root cause**: Should pass `activeRoomIdRef.current`.
- **Confidence**: Medium-High.

### Streaming path unused in processor

- **Steps**
  1. Inspect processor send call.
- **Expected**: `sendMessageWithStreaming` used with onChunk; STREAMING_* events emitted.
- **Actual**: `sendMessage` used; no streaming events.
- **Suspect**
  ```120:124:src/features/concurrent-chat/core/services/ConcurrentMessageProcessor.ts
  aiResponse = await aiService.sendMessage(request, session);
  ```
- **Root cause**: Streaming integrated only in service, not processor.
- **Confidence**: High.

### Retry duplicates without replacement

- **Steps**
  1. Call `retryMessage(messageId)` from hook.
- **Expected**: replace or correlate with previous assistant.
- **Actual**: append new message with new id; ordering breaks.
- **Suspect**
  ```233:259:src/features/concurrent-chat/core/hooks/useConcurrentChat.ts
  const newMessage = { ...message, id: newMessageId, status: 'pending' };
  setMessages(prev => [...prev, newMessage]);
  ```
- **Root cause**: No correlation id / replacement semantics.
- **Confidence**: Medium-High.

### Event payload type drift

- **Steps**
  1. Compare `MessageEvents` types vs emitted payloads.
- **Expected**: Sent event includes `content`, `model`.
- **Actual**: Publisher omits these.
- **Suspect**
  ```16:22:src/features/concurrent-chat/core/types/events/MessageEvents.ts // requires content/model
  38:46:src/features/concurrent-chat/core/services/ConcurrentMessageProcessor.ts // omits them
  ```
- **Root cause**: Mismatched contracts; types too strict or payloads incomplete.
- **Confidence**: Medium.


