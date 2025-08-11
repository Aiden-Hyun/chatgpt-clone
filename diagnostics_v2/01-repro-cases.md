# Repro Cases

## 1) Message list re-renders every keystroke (esp. from 2nd message)
- Steps: open any chat → type in input → after sending first message, type second; observe per-keystroke list re-renders.
- Expected: Only input re-renders; list remains static while typing.
- Actual: List re-renders; console spam like `[ANIM] Animation decision` previously.
- Logs/Stack: see `MessageList` render path.
```1:339:src/features/chat/components/MessageList/index.tsx
318:    <FlatList
319:      data={messagesWithLoading}
320:      keyExtractor={(item: any, index: number) => {
321:        const key = item.id || `fallback_${index}`;
322:        return key;
323:      }}
324:      renderItem={renderMessage}
325:      contentContainerStyle={styles.container}
326:      ref={flatListRef}
327:      extraData={[messages, isNewMessageLoading, regeneratingIndices, recentlyRegenerated, animationTriggers]}
```
- Suspects: `extraData` includes Map/Set (`animationTriggers`, `recentlyRegenerated`), reference changes force re-render; animation decision computed in `renderMessage`.
- Root-cause hypothesis: Non-primitive deps in `extraData` and per-render state updates (Map tokens) → unstable referential equality.
- Confidence: High.
- Minimal fix: Replace Map with stable primitive version counters; restrict `extraData` to primitives/arrays of primitives; memoize `MessageList` subtree.

## 2) Animation decision logging spam
- Steps: As above; observe `[ANIM] ...` per keystroke.
- Expected: No animation logs during typing.
- Actual: Logs printed on each render.
- Suspect:
```280:295:src/features/chat/components/MessageList/index.tsx
281:     // Determine if this message should animate
287:     const shouldAnimate = (!isHydrationMessage && isNewAssistantAtEnd) || wasRecentlyRegenerated;
291:     // Animation decision logging removed to prevent console spam
```
- Root-cause: Logging inside `renderMessage`; gets called on every list render.
- Confidence: High.
- Fix: Keep logging out of render or guard with `__DEV__ && rareSampling`.

## 3) Missing cancellation of OpenAI request on navigate/regenerate
- Steps: Start a long request; navigate back or start a regeneration quickly.
- Expected: In-flight request is aborted; late responses ignored deterministically.
- Actual: No `AbortController` in fetch path; potential late writes.
```1:31:src/features/chat/services/implementations/OpenAIAPIService.ts
14:     const res = await fetch('https://.../openai-chat', {
```
- Suspect: No `signal` passed; no abort wiring in `MessageSenderService`.
- Root-cause: Lacking cancellation and ignore-late policy.
- Confidence: Medium-High.
- Fix: Thread `AbortController` from UI to service; store by requestId; abort on unmount/navigation/regeneration.

## 4) Potential duplicate DB writes on retry/new-room path
- Steps: Poor network → retries trigger; new room creation then message insert.
- Expected: Idempotent writes; no duplicates.
- Actual: No idempotency key; retries can create duplicates.
```168:206:src/features/chat/services/core/MessageSenderService.ts
172:               if (isNewRoom) {
176:                   () => this.chatRoomService.createRoom(...)
...  
188:               await this.retryService.retryOperation(
190:                 () => this.messageService.insertMessages({ ... })
```
- Root-cause: Absence of server-side unique constraints or client idempotency keys for (userId, requestId).
- Confidence: Medium.
- Fix: Add unique (user_id, request_id) and requestId threading; dedupe on server.
