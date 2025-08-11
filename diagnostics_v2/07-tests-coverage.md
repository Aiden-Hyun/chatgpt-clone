# Tests & Coverage

## Config pitfalls
- Ensure `jest-expo` 53 preset is used; mock `react-native-reanimated` and timers.
- Provide polyfills/mocks for `ReadableStream`, `AbortController` if streaming/cancel is added.

## Missing mocks
- Supabase client; navigation (`expo-router`); `fetch` for OpenAI function.

## Minimal test matrix
- Sending: user→assistant flow success, failure, retry path.
- Cancellation: abort on navigate/unmount; ignore late result.
- Regeneration: replaces correct assistant index; preserves history.
- Persistence: idempotent write behavior; duplicate prevention.
- Rendering: FlatList keys stable; animation only for last assistant or regenerated.

## Flaky patterns & stabilization
- Avoid time-based assertions for typewriter; inject speed=1 and fake timers.
- Gate logs during tests to reduce noise; assert on state, not console.

## Example targets
- `useMessageActions` happy/error paths.
- `MessageList` animation trigger behavior (unit with controlled props).
