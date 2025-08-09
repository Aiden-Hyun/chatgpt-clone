### Phase 2 — PLAN (propose changes as a diff; ask for confirmation in-code comment, then proceed)

Goal: Stabilize concurrent send/stream/abort/retry with a single source of truth, per-message FSM, typed events, backpressure/cancellation, and terminal-only persistence. Public component props remain stable.

Guiding principles
- Single source of truth: Only the new `MessageStore` mutates message state; UI subscribes once.
- Determinism: All message transitions flow through a tiny FSM.
- Cancel-safe: Network streaming stops immediately on `AbortController.abort()`.
- Types as guardrails: Strongly typed events/commands prevent stringly-typed drift.
- Minimal blast radius: Add new files; introduce typed wrappers first, then refactor call sites gradually.

---

#### A) Add core/store/MessageStore.ts

Proposed file: `src/features/concurrent-chat/core/store/MessageStore.ts`

```ts
// CONFIRM: Create MessageStore as canonical message state (Map by id) with observe().
import { ConcurrentMessage } from '../types/interfaces/IMessageProcessor';

type Subscriber = (messages: ConcurrentMessage[]) => void;

export class MessageStore {
  private idToMessage = new Map<string, ConcurrentMessage>();
  private subscribers = new Set<Subscriber>();

  constructor(initial: ConcurrentMessage[] = []) {
    for (const m of initial) this.idToMessage.set(m.id, m);
  }

  getAll(): ConcurrentMessage[] {
    return Array.from(this.idToMessage.values()).sort((a, b) => a.timestamp - b.timestamp);
  }
  get(id: string): ConcurrentMessage | undefined { return this.idToMessage.get(id); }
  upsert(delta: Partial<ConcurrentMessage> & { id: string }): void {
    const prev = this.idToMessage.get(delta.id);
    const next = { ...(prev as any), ...delta } as ConcurrentMessage;
    this.idToMessage.set(delta.id, next);
    this.emit();
  }
  remove(id: string): void { if (this.idToMessage.delete(id)) this.emit(); }
  observe(sub: Subscriber): () => void { this.subscribers.add(sub); try { sub(this.getAll()); } catch {} return () => this.subscribers.delete(sub); }
  private emit(): void { const snap = this.getAll(); for (const s of this.subscribers) { try { s(snap); } catch {} } }
}
```

Registration
- Register singleton in `ServiceContainer` during `ConcurrentChat` mount: `container.register('messageStore', new MessageStore());`

---

#### B) Add core/fsm/MessageStateMachine.ts

Proposed file: `src/features/concurrent-chat/core/fsm/MessageStateMachine.ts`

```ts
// CONFIRM: Add FSM with states: idle|sending|streaming|complete|failed|canceled; events: SEND|CHUNK|RESOLVE|REJECT|CANCEL|RETRY.
import { MessageStore } from '../store/MessageStore';
import { ConcurrentMessage } from '../types/interfaces/IMessageProcessor';

export type MessageState = 'idle' | 'sending' | 'streaming' | 'complete' | 'failed' | 'canceled';
export type MessageEventType = 'SEND' | 'CHUNK' | 'RESOLVE' | 'REJECT' | 'CANCEL' | 'RETRY';
export interface MessageEvent { type: MessageEventType; chunk?: string; error?: string }

export class MessageStateMachine {
  private state: MessageState;
  constructor(private readonly id: string, private readonly store: MessageStore, initial: MessageState = 'idle') { this.state = initial; }
  getState(): MessageState { return this.state; }
  dispatch(evt: MessageEvent): void {
    if (this.state === 'complete' || this.state === 'failed' || this.state === 'canceled') {
      if (evt.type === 'RETRY') { this.state = 'sending'; this.store.upsert({ id: this.id, status: 'processing' }); }
      return; // ignore late CHUNK/RESOLVE/REJECT/CANCEL
    }
    switch (evt.type) {
      case 'SEND': this.state = 'sending'; this.store.upsert({ id: this.id, status: 'processing' }); break;
      case 'CHUNK': {
        if (this.state === 'idle' || this.state === 'sending') this.state = 'streaming';
        if (evt.chunk) {
          const prev = this.store.get(this.id) as ConcurrentMessage | undefined;
          this.store.upsert({ id: this.id, status: 'processing', content: (prev?.content ?? '') + evt.chunk });
        }
        break;
      }
      case 'RESOLVE': this.state = 'complete'; this.store.upsert({ id: this.id, status: 'completed' }); break;
      case 'REJECT': this.state = 'failed'; this.store.upsert({ id: this.id, status: 'failed', error: evt.error ?? 'Unknown error' }); break;
      case 'CANCEL': this.state = 'canceled'; this.store.upsert({ id: this.id, status: 'cancelled' }); break;
    }
  }
}
```

---

#### C) Add core/queue/SendQueue.ts

Proposed file: `src/features/concurrent-chat/core/queue/SendQueue.ts`

```ts
// CONFIRM: Add concurrency-limited queue; returns cancellable handle; integrates AbortController.
export interface QueueHandle<T = unknown> { promise: Promise<T>; abort: () => void }
interface Task<T> { start: (signal: AbortSignal) => Promise<T>; controller: AbortController; resolve: (v: T|PromiseLike<T>) => void; reject: (r?: any) => void; started: boolean }

export class SendQueue {
  private active = 0; private readonly max: number; private tasks: Task<any>[] = [];
  constructor(concurrency = 3) { this.max = Math.max(1, concurrency); }
  enqueue<T>(runner: (signal: AbortSignal) => Promise<T>): QueueHandle<T> {
    const controller = new AbortController(); let resolve!: (v: T|PromiseLike<T>) => void; let reject!: (r?: any) => void;
    const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
    const task: Task<T> = { start: runner, controller, resolve, reject, started: false };
    this.tasks.push(task); this.pump();
    return { promise, abort: () => { try { controller.abort(); } catch {} } };
  }
  private pump(): void {
    while (this.active < this.max) {
      const next = this.tasks.find(t => !t.started); if (!next) break; next.started = true; this.active++;
      next.start(next.controller.signal).then(v => next.resolve(v)).catch(e => next.reject(e)).finally(() => { this.active--; this.tasks = this.tasks.filter(t => t !== next); this.pump(); });
    }
  }
}
```

Registration
- Register singleton: `container.register('sendQueue', new SendQueue(3));`

---

#### D) EventBus harden (typed wrappers first)

Edit: `src/features/concurrent-chat/core/events/EventBus.ts`

```ts
// CONFIRM: Add typed helpers while keeping existing string API for gradual migration.
publishTyped<T extends { type: string }>(event: T): Promise<void> { return this.publish<T>(event.type, event); }
subscribeTyped<T extends { type: string }>(type: T['type'], handler: (event: T) => void | Promise<void>, replay = false): string { return this.subscribe<T>(type as string, handler, replay); }
```

Policy
- Replace stringly `publish('message.sent', ...)` with `publishTyped({ type: MESSAGE_EVENT_TYPES.X, ... })` across the codebase incrementally.
- Forbid unknown event names in new code by centralizing types in `types/events/MessageEvents.ts`.

---

#### E) ConcurrentAIService + ConcurrentMessageProcessor

Edit: `src/features/concurrent-chat/core/services/ConcurrentAIService.ts`

```ts
// CONFIRM: Add stream() with AbortController; idempotent completion.
async stream(params: { request: any; session: any; signal: AbortSignal; onChunk: (chunk: string) => void }): Promise<{ content: string; model: string }> { /* impl reading response.body.getReader(), respect signal, accumulate full, call onChunk */ }
```

Edit: `src/features/concurrent-chat/core/services/ConcurrentMessageProcessor.ts`

```ts
// CONFIRM: Processor owns per-message FSM + queue handle; routes chunks → store; emits typed events.
// - Create FSM: new MessageStateMachine(messageId, messageStore)
// - Dispatch SEND, then enqueue ai.stream via sendQueue; keep AbortController per messageId in a Map
// - On each delta: dispatch CHUNK; on done: RESOLVE; on error: REJECT (respect abort -> CANCEL)
// - Publish typed STREAMING_STARTED/CHUNK/ENDED and MESSAGE_* terminal events via publishTyped
```

---

#### F) PersistenceService (terminal-only writes)

Changes: `src/features/concurrent-chat/core/services/PersistenceService.ts`

```ts
// CONFIRM: Add persistOnTerminalState() for batch/atomic writes; call only when FSM reaches complete/failed.
async persistOnTerminalState(params: { session: any; roomId?: number; userContent?: string; assistantContent?: string; model?: string; status: 'completed' | 'failed' }): Promise<void> { /* batch insert + chatrooms.updated_at update */ }
```

Processor usage
- First turn: after RESOLVE, call `persistFirstTurn` (existing) or new method if we unify; otherwise call `persistTurn` for existing rooms. No per-chunk writes.

---

#### G) Hooks & Components (subscribe to store; read-only UI)

Edit: `src/features/concurrent-chat/core/hooks/useConcurrentChat.ts`

```ts
// CONFIRM: Replace local messages useState with MessageStore.observe(); remove direct array mutations.
// - Get store from container: const store = serviceContainer.get<MessageStore>('messageStore')
// - useEffect(() => store.observe(setMessages), [])
// - sendMessage/retry/cancel/clear: dispatch typed commands that operate via processor + queue + FSM
// - Remove per-event setMessages mutations; rely on store updates triggered by FSM transitions
```

Components (no public prop changes)
- `ConcurrentChat.tsx`: Register `messageStore` and `sendQueue` into container; keep props stable.
- `MessageList.tsx`, `MessageItem.tsx`, `MessageInput.tsx`: remain read-only; no internal mutations.

---

Migration & Ordering
1) Add new files (Store, FSM, Queue). Register in `ConcurrentChat` container.
2) Add typed EventBus wrappers (non-breaking).
3) Add `ConcurrentAIService.stream()` without removing existing methods.
4) Refactor `ConcurrentMessageProcessor` to orchestrate FSM + Queue + Streaming.
5) Refactor `useConcurrentChat` to subscribe to `MessageStore.observe()` and remove direct array mutations.
6) Adjust commands to call processor/queue; wire `CancelMessageCommand` to abort via stored controller.
7) Switch persistence to terminal-only writes.

Risk & Rollback
- Changes are additive-first (wrappers/new files). If issues arise, revert to previous processor path by toggling the processor branch that uses streaming/FSM.

Tests to be added (Phase 3)
- message.fsm.spec.ts, queue.cancellation.spec.ts, send.retry.spec.ts, persistence.spec.ts, regression.spec.ts.

Approval
- Approve the CONFIRM comments above to proceed with implementation (Phase 3 — APPLY).


