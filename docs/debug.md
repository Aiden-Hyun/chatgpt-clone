### Engineering note: chat regeneration bugs and architecture primer

- **Overview**: UI interacts with hooks → service layer (SOLID-style) → DB/API → centralized state transitions + animation. Keep navigation in UI/route guards, keep shared libs pure.

### Fixed bugs
- **Auth/session mismatch**: `getSession` used to redirect and return `Session | null`, causing type ambiguity. Now it’s pure (`Promise<Session | null>`). Use `requireSession()` only in UI guards; callers add a runtime guard before using the session.
- **Regeneration blocked by content guard**: Regen wrongly required the assistant’s existing content. Now it only requires prior user content.
- **Regeneration displayed nothing**: `AssistantMessage` showed only `message.content` while regen set `fullContent`. It now falls back to `fullContent`.
- **No typewriter on regeneration**: Regen path did not start the animation job. `ReactRegenerationService` now calls `animationService.setMessageFullContentAndAnimate({ messageId, fullContent })` and wiring was added in the registry/factory/hook.
- **Edited user message lost on refresh**: User edits were local-only. Added `updateUserMessageByDbId` and persist the edited user message during regen when the message has a `db:` id.

### Architecture essentials
- **Routing/auth**
  - `app/_layout.tsx` guards routes using `AuthProvider`. Do not navigate from `getSession`; keep it pure. Use `requireSession()` for guard-style UI code only.
- **Message orchestration (new sends)**
  - `MessageSenderService` updates UI via `ReactMessageStateService`, calls AI via `OpenAIAPIService`, animates via `ReactAnimationService`, persists via `Supabase*Service`, then navigates.
- **Regeneration flow**
  - `ReactRegenerationService` slices history up to the target assistant, optionally overrides the previous user message with edited text, calls AI, updates UI, animates, and persists assistant update (by client id or db id). Also persists the edited user message when applicable.
- **State machine & animation**
  - `MessageStateManager` centralizes transitions: loading → animating → completed, plus regeneration helpers. `ReactAnimationService` is the single place that starts/stops typewriter jobs.
- **Persistence model**
  - New sends insert user+assistant rows together; assistant uses `client_id` to correlate. Hydration maps DB ids to `id = "db:<id>"`. Regeneration updates assistant by `client_id` (preferred) or db id. User edits are persisted by db id only.
- **Error & retry**
  - `RetryService` skips Abort/Timeout. Consider classifying 401/403 as non‑retryable and surfacing a clear “sign in again” UX when tokens expire.

### Gotchas
- Keep navigation out of shared libs; put it in UI/route guards.
- Always guard session at call sites before building `SendMessageRequest`.
- Edited user text will persist only when the user message has a `db:` id (i.e., already saved in DB).

### Follow-ups
- Classify 401/403 as non‑retryable in `RetryService` and add a user-friendly expired‑session flow.
- Align edge payloads if needed (e.g., include `clientMessageId`, `skipPersistence`) to support idempotency on the server.


