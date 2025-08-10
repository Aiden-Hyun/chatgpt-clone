### Phase 1 — Stabilize (low risk, this week)

- **Goals**
  - Fail assistant id on errors; don’t leave `processing` dangling.
  - Fix SENT handler to avoid `processing` on user messages.
  - Add AbortController to service/processor; cancel aborts transport and suppresses late events.
  - Use id-based keys in Chat `MessageList`.
  - Use `activeRoomIdRef.current` for first-turn persistence.
- **Risks**: event contract tweaks; update tests accordingly.
- **Checklist**
  - Error path targets assistant id
  - Cancel → abort wired; ignore-late semantics
  - List keys switched to id
  - Room id ref corrected
- **Exit criteria**
  - No stuck spinners; cancel reliable; list stable under concurrency.

### Phase 2 — Extract (medium risk)

- **Goals**
  - Introduce `ChatController` as single gateway (send/stream/cancel/retry).
  - Processor depends on explicit deps (ai, persistence, selector); no container lookups.
  - Discriminated union for `process` inputs; align event payloads and types.
- **Risks**: integration impact on commands/hook; update tests and subscribers.
- **Checklist**
  - Controller owns AbortController lifecycle per message
  - STREAMING_* events emitted; UI consumes via reducer
  - Typed events published with required fields
- **Exit criteria**
  - Commands and hook route through controller; tests deterministic.

### Phase 3 — Optimize (optional)

- **Goals**
  - Batch streaming updates; memoize items; consider FlashList.
  - Persistence idempotency, correlation ids for replace semantics.
  - Gate logs behind debug flag.
- **Risks**: animation behavior changes.
- **Checklist**
  - Chunk throttle to ~30–60hz
  - Correlation ids + replace on retry
  - Reduced console overhead in prod
- **Exit criteria**
  - Smooth streaming; no jank; green e2e and unit tests.


