# Types & Contracts

## Unsafe `any` usage (samples)
```226:233:src/features/chat/components/MessageList/index.tsx
const explicitId = (messages[i] as any).id ?? (messages[i] as any)._loadingId;
...
``` 
```250:255:src/features/chat/components/MessageList/index.tsx
return { ...(m as any), id: resolvedId } as any;
```
```29:32:src/features/chat/services/implementations/SupabaseChatRoomService.ts
const updateData: any = {};
```
- Why it breaks: masks schema drift and narrows compiler help; leads to runtime-only failures.
- Minimal fix: introduce `ChatMessageWithMeta` (id, loadingId?, processing flags) and `RoomUpdate` typed object.

## Missing discriminated unions
- Chat messages use `{ role: 'user'|'assistant', content: string }` but rendering needs meta. Define:
```ts
export type ChatMessageBase = { role: 'user'|'assistant'; content: string };
export type ChatMessageMeta = { id: string; loadingId?: string; processing?: boolean };
export type ChatMessageWithMeta = ChatMessageBase & Partial<ChatMessageMeta>;
```

## Event payload drift
- GlobalEvents payloads are `any`; define:
```ts
type RoomsCreated = { type: 'ROOMS_CREATED'; roomId: number };
```
and enforce in emitter/consumer.

## Public vs internal types
- Expose only the orchestrator hook return surface; make service-specific types internal; prefer explicit imports over barrels to reduce coupling.
