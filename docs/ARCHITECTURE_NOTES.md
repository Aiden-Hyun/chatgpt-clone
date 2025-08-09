### Concurrent Chat Architecture Notes (Phase 1 — Analyze)

This document summarizes the current issues and a minimal refactor plan for stabilizing concurrent chat under parallel sends/streaming/retries/cancels.

Root causes and references
- Multiple sources of truth for messages
  - `core/hooks/useConcurrentChat.ts` keeps a local `messages` array and mutates it from event handlers and actions.
  - `core/services/MessageService.ts` tracks `processingMessages` and command history separately and emits its own string events.
  - Components read these arrays directly. No central, authoritative store.

- Stringly-typed EventBus
  - `core/events/EventBus.ts` uses string topics and wildcard matching; compiler cannot enforce payload types.
  - `core/types/events/MessageEvents.ts` defines strong types but they are not enforced at the bus boundary.

- Missing cancellation plumbing
  - `ConcurrentAIService.sendMessageWithStreaming` has no AbortController; cannot cancel in-flight streams.
  - `useConcurrentChat.cancelMessage` only updates UI and publishes an event; network continues.
  - Commands (`CancelMessageCommand`) forward a cancel type but processor/AI service ignore it.

- No per-message state machine
  - `ConcurrentMessageProcessor` publishes SENT/COMPLETED/FAILED directly, without guarding against late chunks or terminal-state transitions.
  - Retries (`RetryMessageCommand`) do not ensure prior run is terminal; may race with in-flight operations.

- Non-idempotent and interleaving operations
  - `SendMessageCommand` and hook `sendMessage` can both invoke `process` directly; no queue/backpressure.
  - IDs use `Date.now()+Math.random()`; higher collision risk under concurrency; non-sortable.

- Persistence coupling and timing
  - `ConcurrentMessageProcessor` persists turns inline (first-turn and subsequent turns) via `PersistenceService`.
  - Writes are not batched and may happen even after a user cancels; no terminal-state-only policy.

Minimal refactor plan mapped to code
- MessageStore (single source of truth)
  - Add `core/store/MessageStore.ts` with Map by `messageId`, methods `getAll/get/upsert/remove`, and `observe` subscription.
  - `useConcurrentChat` subscribes to the store instead of mutating local arrays.

- MessageStateMachine (per-message FSM)
  - Add `core/fsm/MessageStateMachine.ts`: states `idle|sending|streaming|complete|failed|canceled`; events `SEND|CHUNK|RESOLVE|REJECT|CANCEL|RETRY`.
  - Guards ignore `CHUNK` after terminal states, and `RETRY` only from terminal states.
  - Side-effects write deltas into `MessageStore`.

- SendQueue with backpressure and cancellation
  - Add `core/queue/SendQueue.ts` to run N concurrent tasks and return cancellable handles.
  - Integrate with `AbortController` and ensure teardown on cancel/unmount.

- EventBus hardening
  - Replace free-form strings with discriminated unions from `types/events/MessageEvents.ts` at the API boundary.
  - Provide typed publish/subscribe wrappers to enforce payloads.

- Service ownership and routing
  - `ConcurrentAIService.stream({ payload, signal, onChunk })` for streaming with abort support; idempotent completion.
  - `ConcurrentMessageProcessor` manages FSM transitions and routes chunks to `MessageStore` via typed events.

- Persistence adjustments
  - `PersistenceService` writes only on terminal states (complete/failed) and supports batching/upserts.

Risk & blast radius
- Internal-only changes to services/hooks. Public component props (`ConcurrentChat`, `MessageList`, `MessageItem`, `MessageInput`) can remain stable.
- EventBus API will gain typed wrappers; existing constants continue to work via adapters.
- Processor and command internals will change; external usage via hooks/components should remain the same.

Test plan (to be added under tests/features/concurrent-chat)
- message.fsm.spec.ts: transition table, terminal-state guards, late chunk ignored.
- queue.cancellation.spec.ts: abort mid-stream cancels promptly, no further chunks delivered.
- send.retry.spec.ts: retry only from terminal state, new run id, deterministic final state.
- persistence.spec.ts: only terminal states write; batch payload shape verified.
- regression.spec.ts: ≥3 parallel sends do not interleave content; no duplicate completions.

Migration notes (if needed)
- Prefer ULID for `messageIdGenerator` for monotonic ordering. Keep function name while switching implementation later.
- Add typed wrappers for EventBus; existing code can migrate incrementally.


