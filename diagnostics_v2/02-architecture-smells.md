# Architecture Smells

## State ownership & data flow
- Observed dual mutation paths for messages:
  - Service layer `ReactUIStateService.updateMessageContent` mutates state directly.
  - Hooks path `useMessageActions` provides `customSetMessages` that also writes into the same state.
  - Why it breaks: two writers → ordering/race hazards (e.g., animation vs final content), harder to reason about invariants.
  - Minimal fix: funnel all message mutations through a single adaptor (MessageStore) with intentful commands.

## Layering violations
- `MessageSenderService` handles navigation decisions (`navigationService.handleNewRoomNavigation`) and DB writes; business logic + navigation coupling.
  - Why it breaks: tight coupling to routing in domain service; hard to test/headless run.
  - Fix: emit domain events; let UI/navigation layer subscribe and route.

## Event/contracts alignment
- GlobalEvents used in `useChatRooms` for room creation fallback; not typed, payload `any`.
  - Risk: payload drift; consumers and producers not aligned.
  - Fix: define typed event contracts and central event bus interface; add discriminated unions for events.

## Service container usage
- `ServiceFactory` wires implementations each call; `ServiceRegistry` acts as a DI container but lifetime rules are implicit.
  - Risk: hidden deps and accidental re-instantiation; inconsistent singletons.
  - Fix: explicit lifetime (singleton/transient) in registry; provide `configureServices()` once at app boot.

## Dual mutation paths
- As above (state ownership); also `MessageList` augments messages with `id/_loadingId` via `any`, separate from core state.
  - Risk: view-model drift vs domain model.
  - Fix: define `ChatMessageWithMeta` at the type level and produce it in selectors, not inside render.
