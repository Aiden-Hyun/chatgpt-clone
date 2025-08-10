### State ownership and data flow

- **Dual mutation paths**: Commands (`SendMessageCommand`) vs hook (`useConcurrentChat.sendMessage`). Prefer a single gateway.
- **Event + direct setState mixing**: Event handlers mutate messages while other flows call `updateMessage`, risking races.

### Concurrency model

- **No transport aborts**: cancel updates UI only; fetch/stream keeps running.
- **Assistant placeholder pre-flight**: created before network success; error path doesn’t reconcile it.

### Boundaries (UI ↔ domain ↔ infra)

- **Processor reaches infra**: persistence and session/model fetched from container inside processor.
- **Event contracts**: types and publishers diverge; consumers infer semantics.

### Dependency cycles / smells

- **Service container everywhere**: processor depends on a container instead of explicit deps, hiding requirements.
- **Two model selection services**: `core/services/ModelSelectionService` and a feature version exist; duplication risk.

### Side-effects

- **Processor handles network + persistence**: heavy side-effects in a single class; cancel/retry types unhandled.

### Anti-patterns

- **Index keys in lists**: unstable identity under concurrent updates.
- **Untracked async**: missing abort signals; late events mutate after cancel.
- **Broad `any`**: `IMessageProcessor.process` and event payloads loosen type safety.


