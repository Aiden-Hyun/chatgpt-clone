### RN performance callouts

- **Unstable keys**: Chat `MessageList` uses index keys; switch to id-based keys to reduce reorder and flicker.
- **Re-render hotspots**: Prop drilling of large Sets/Maps into list; memoize and use stable refs. Consider `React.memo` on items.
- **Virtualization**: Tune `initialNumToRender`, `windowSize`, `removeClippedSubviews`; consider FlashList for large histories.
- **Logging overhead**: Verbose console logs on hot paths (ANIM/HISTORY/MODEL); gate behind a debug flag in production.
- **Streaming batching**: When integrating streaming, batch token updates (e.g., 30–60hz) to avoid excessive state churn.

### Measurable suggestions

- Id-based keys for messages (and any placeholders) → eliminates index-shift flicker.
- Memoize `MessageItem` by `id`, `status`, `content.length` → fewer re-renders.
- Batch chunk updates via requestAnimationFrame or a 16–33ms throttle.


