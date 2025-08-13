## Things to note (read before editing chat logic)

This project optimizes chat UX for smooth scrolling, stable rendering, and reliable persistence. The items below capture prior knowledge that prevents common regressions.

### FlashList rendering stability
- Use small, stable primitives for `extraData`.
  - Do NOT pass `messages`, `Set`, or large objects into `extraData`.
  - We pass only `isNewMessageLoading` and `regeneratingIndex`.
- Do NOT create a fresh `Set` every render.
  - Prefer a primitive like `regeneratingIndex: number | null`.
- Keep `renderItem` and handlers stable with `useCallback` when possible.
- Keys: every message must have a stable `id`; `keyExtractor` uses `id` only.

### Auto-scroll behavior (prevent snap-to-bottom loops)
- We gate scroll-to-end by a "near-bottom" check.
  - `onScroll` computes `distanceToBottom`; if within a small threshold (≈120 px), auto-scroll is enabled; otherwise disabled.
  - `onContentSizeChange` and `onLayout` only call `scrollToEnd` when the gate is enabled.
  - Initial layout scroll happens once; subsequent layout/size changes never force-scroll unconditionally.

### Typewriter animation orchestration (finishes off-screen)
- The typewriter effect runs centrally, not inside list rows.
  - Orchestrated in `ReactAnimationService` using a per-message job (ticks substring -> updates `message.content`).
  - State transitions are driven by `MessageStateManager` using message `state`: `loading` → `animating` → `completed`.
- UI rows just render `message.content` (and a simple cursor if `state === 'animating'`).
- Never reintroduce a local timer-based typewriter inside row components; off-screen virtualization may unmount rows and cause restarts.

### Persistence strategy (avoid lost messages on refresh)
- Client persists messages for both new and existing rooms via `IMessageService.insertMessages`.
  - The Edge Function is called with `skipPersistence: true` to avoid duplicate writes.
  - We include `clientMessageId` for idempotency across systems.
- Regeneration updates should use update paths (by `client_id` or DB `id`) and should not insert duplicates.
- New-room flow: after the first response, navigation lands on `/chat/:roomId`; refreshing before you see that route will show an empty list by design.

### Message state machine (quick reference)
- States: `loading` (streaming placeholder) → `animating` (typewriter) → `completed` (static), plus `hydrated` (loaded from DB) and `error`.
- `fullContent` holds the target text during `animating`; `content` is the current substring rendered by the UI.

### What not to change (unless you know the trade-offs)
- Do not pass large/mutable structures in `extraData`.
- Do not unconditional `scrollToEnd` in list callbacks.
- Do not run per-row animation timers.
- Do not rely on the Edge Function to persist new messages for existing rooms.

### Safe extensions
- If optimizing further, precompute a map of `id → originalIndex` to avoid `findIndex` inside `renderItem`.
- Memoize row components with a narrow equality that checks only fields that affect the row (`id`, `content/state`, grouping flags, `isRegenerating`).

### Config essentials
- `app.config.js` exposes: `supabaseUrl`, `supabaseAnonKey`, `edgeFunctionBaseUrl`.
- Supabase client uses `persistSession: true` (React Native-friendly).

### Quick checklist for PRs touching chat
- Kept `extraData` small and stable.
- Scroll guarded by near-bottom logic; no unconditional scroll calls.
- Typewriter stays centralized; rows are passive.
- New/existing room persistence verified; refresh shows latest messages.
- Keys remain stable and derived from `message.id`.

### Things to note (for contributors and AI coders)

- **Keep shared libs pure**
  - Do not trigger navigation or UI side-effects in shared helpers like `src/shared/lib/supabase/getSession.ts`. It must stay `Promise<Session | null>`.
  - Use `requireSession()` only in UI/route guards to enforce auth; elsewhere, call `getSession()` and add a runtime guard before using `Session`.

- **Always guard session at call sites**
  - Before constructing `SendMessageRequest`, ensure `session` is present. If unauthenticated, stop UI work and return early.

- **Use the state machine and single animation orchestrator**
  - State transitions live in `MessageStateManager` (loading → animating → completed). Do not set message states ad‑hoc.
  - Start/stop typewriter only via `ReactAnimationService`. For regeneration, call `setMessageFullContentAndAnimate({ messageId, fullContent })`.

- **Regeneration rules**
  - Regen needs the prior user message content; it does not require existing assistant content.
  - Build regen history from messages before the target assistant. If the user edited the prior message, override that last user content in the history.
  - Let the animation service handle the visual update; do not manually mutate `content`/`fullContent` in multiple places.

- **Persistence model**
  - New sends: insert user+assistant together; assistant row stores `client_id` (use the assistant message id).
  - Hydration maps DB `id` to client `id = "db:<id>"`. Use this to decide whether a message can be updated server‑side.
  - Regeneration: update assistant by `client_id` (preferred) or DB id fallback.
  - When editing the prior user message and regenerating, persist the edited user message by DB id (`updateUserMessageByDbId`) so refresh reflects the edit.

- **IDs and correlations**
  - For brand‑new messages, prefer client‑generated ids. Use the assistant id as `client_id` for both inserted rows to correlate.
  - Handle DB‑hydrated ids with the `db:` prefix; avoid mixing raw DB numbers/strings with client ids.

- **Service wiring**
  - Services are created via `ServiceRegistry`/`ServiceFactory`. If you add dependencies (e.g., animation into regeneration), wire them through registry, factory, and hooks.

- **Edge/API contracts**
  - If the server needs idempotency or regen hints, include `clientMessageId` and `skipPersistence` in the payload. Keep the client and edge function in sync.

- **Error and retry**
  - Use `RetryService` for transient errors; do not retry on Abort/Timeout. Consider classifying 401/403 as non‑retryable and surfacing a clear re‑login path.

- **Testing guidelines**
  - Cover unauth vs. auth flows; ensure unauth callers return early.
  - Test regeneration with and without existing assistant content, and with edited prior user content.
  - Verify persistence: after edit‑and‑regen, reload should show edited user text and updated assistant text.

- **Do / Don’t quick list**
  - Do: guard session at call sites; use state machine + animation service; persist edits when DB ids exist.
  - Don’t: navigate inside shared libs; duplicate animation logic; rely on assistant content to allow regen; mutate message state directly in components.


