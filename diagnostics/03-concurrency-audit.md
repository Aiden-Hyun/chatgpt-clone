### Lifecycle (current)

1) Compose → `SendMessageCommand.execute`
2) Processor publishes `MESSAGE_SENT` for user as completed
3) Processor creates assistant placeholder (`processing`) → publishes `MESSAGE_SENT`
4) Calls `aiService.sendMessage` (non-streaming)
5) Publishes `MESSAGE_COMPLETED` for assistant; persists turn(s)
6) Cancel/Retry via hook only (UI-level), transport unaffected

### Race windows / gaps

- Cancel: no abort; completion can land after cancel.
- Error: assistant placeholder left `processing` if AI fails.
- Room id: pre-created room ref object used instead of value.
- Event ordering: SENT handler sets `processing` on existing ids (can hit user messages).

### Idempotency / atomicity

- No correlation id linking user and assistant turns.
- Persist first turn inserts two rows without idempotency safeguards.
- Retry appends a new message instead of replace.

### Single source of truth (proposal)

- ChatController
  - Owns transport with AbortController; emits typed domain events.
  - Manages assistant placeholder lifecycle and streaming chunk batching.
  - Commits persistence after successful completion (or idempotent first-turn).
  - UI subscribes to a reducer-backed store keyed by `messageId` and `correlationId`.

### Event/state (proposal)

- Events: `USER_COMPLETED`, `ASSISTANT_STARTED`, `STREAMING_CHUNK`, `ASSISTANT_COMPLETED`, `ASSISTANT_FAILED`, `ASSISTANT_CANCELLED`, `RETRY_STARTED`, `RETRY_REPLACED`.
- Cancel semantics: set cancelled, abort fetch, ignore late chunks/completion.
- Retry semantics: replace assistant by correlation id; keep a retry counter/backoff.


