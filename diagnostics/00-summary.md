### Top 10 issues (impact × likelihood)

- **Assistant spinner stuck on errors**: Assistant placeholder stays `processing` when AI call fails; failure event targets the user message instead.
- **Cancel doesn’t abort**: UI sets `cancelled` but network/stream continues; late events race UI.
- **Cancel/Retry commands unsupported**: Commands pass `{ type: 'cancel' | 'retry' }` to processor which rejects due to missing `content`.
- **Wrong SENT transition**: `MESSAGE_SENT` handler marks existing message as `processing`, affecting user messages.
- **List keys cause duplicates**: Chat `MessageList` uses index keys; concurrent updates shift keys and flicker.
- **First-turn persistence race**: `activeRoomIdRef` object is registered; processor uses it as a number.
- **Streaming not integrated**: Processor uses non-streaming `sendMessage`; no `STREAMING_*` events or chunk updates.
- **Retry duplicates without replacement**: Retry appends a new message with a new id; no correlation or replace semantics.
- **Event type drift**: Published event payloads omit fields required by `MessageEvents` interfaces.
- **Container coupling**: Processor pulls multiple services from container (model, session, persistence), hiding dependencies and complicating tests.

### Executive summary

- **Root problems**: missing aborts, misaligned event semantics, and dual state mutation paths (commands vs hook) drive flakiness.
- **Assistant lifecycle**: placeholder created before network; error path doesn’t transition it → stuck spinners.
- **Cancel/Retry**: UI-only; transport continues; commands unsupported in processor.
- **Streaming**: present in service, unused in processor → tests don’t reflect reality.
- **Rendering**: index keys drive out-of-order/flicker under concurrent updates.
- **Persistence**: new-room flow may save to wrong room id due to ref misuse.
- **Tests**: rely on mocks diverging from real paths → intermittent failures.
- **Path forward**: central controller, typed events, abort wiring, id-based keys.

### Quick wins (≤5)

- **Fail the assistant id on errors**; don’t leave `processing` dangling.
- **Wire AbortController** end-to-end; cancel must abort transport and suppress late events.
- **Use id-based keys** in Chat `MessageList`.
- **Fix SENT handler** to avoid setting user messages to `processing`.
- **Use `activeRoomIdRef.current`** when persisting the first turn.


