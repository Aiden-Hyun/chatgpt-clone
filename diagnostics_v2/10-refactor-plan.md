# Refactor Plan (Stabilize → Extract → Optimize)

## Phase 1 — Stabilize (shipping safety)
1. Remove hot-path logs and gate remaining logs with levels (files: `MessageList`, hooks, services). Done when CI grep count < 5 for `console.log` in src.
2. Replace `extraData` Map/Set with numeric `animationVersion` and boolean flags; ensure `MessageList` re-renders only when needed.
3. Ensure stable ids: assign `_loadingId` at enqueue time; ban index fallback in `keyExtractor`.
4. Centralize env: move edge URL to config; service reads from typed config.
5. Introduce `RequestContext` with `requestId` and `AbortController`; pass to `OpenAIAPIService.sendMessage` and cancel on unmount.

## Phase 2 — Extract (architecture clarity)
1. Create `MessageStore` (hook/context) exposing intentful commands; make `ReactUIStateService` a thin adaptor over the store.
2. Consolidate hooks: remove duplicate `useMessageActions`; keep only the orchestrator under `hooks/messages`.
3. Split navigation concerns from `MessageSenderService`: service emits events; UI subscribes to navigate.
4. Define `ChatMessageWithMeta` and migrate list/service code to typed model (no `any`).
5. Add idempotency: thread `requestId` to Supabase writes; add unique constraints.

## Phase 3 — Optimize (performance & DX)
1. Add streaming with batched updates (cadence control) behind a feature flag.
2. Add `getItemLayout`, `initialNumToRender`, and memoized `renderItem` via `useCallback` or `React.memo` for `MessageItem`.
3. Replace barrels with explicit re-exports for public API surface; add CI import rules.
4. Introduce dependency-cruiser to prevent cycles and UI→persistence imports.
5. Strengthen TS config (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`).

Each task target diff ≤200 LOC; include tests for send/cancel/regenerate flows.
