### Type safety gaps

- `IMessageProcessor.process(message: any)`: use a discriminated union for message vs control commands.
- `MessageEvents` interfaces vs publishers: required fields (e.g., content, model) are omitted; either relax types or publish full payloads.
- `ConcurrentAIService.setBaseUrl` mutates a readonly field via `any`; replace with configurable ctor or setter that stores in a non-readonly field.

### Jest/RTL setup pitfalls

- `jest-expo` + `jsdom` OK; TextEncoder/Decoder polyfilled in `ConcurrentAIService.test`.
- Streaming/cancel tests should mock `ReadableStream`, `AbortController`, and timers to verify abort behavior and chunk batching.
- Mock `fetch` per test to avoid cross-test leakage; restore in `afterEach`.

### Minimal test matrix

- **Streaming**
  - starts: emits ASSISTANT_STARTED with placeholder
  - chunks: emits STREAMING_CHUNK; UI updates batched
  - ends: emits ASSISTANT_COMPLETED; persistence called once
  - cancel mid-stream: abort called; emits ASSISTANT_CANCELLED; no late updates

- **Retry**
  - replaces by correlation id; previous assistant marked replaced; idempotent rendering (no duplicates)
  - retry limit/backoff honored

- **Adapters**
  - `toChatMessages` drops content only for `processing` assistant; preserves order and indexes

- **Persistence**
  - first turn: uses `activeRoomIdRef.current` when present; otherwise creates; idempotent inserts


