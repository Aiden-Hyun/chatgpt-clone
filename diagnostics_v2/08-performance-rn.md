# React Native Performance

## List virtualization & keys
- Keys: `keyExtractor` prefers `id`; fallback to index remains — ensure all messages get stable ids before render.
- Virtualization: Provide `getItemLayout` for predictable row heights (if applicable) and `initialNumToRender` tuned to device.
- Avoid Map/Set in `extraData`; use version counters or derived numeric flags.

## Render hotspots
- `MessageList.renderMessage` runs animation decision on every item render; ensure memoization of derived booleans and move logs out of render.
- Theme/style creation inside component; memoize or hoist where possible.

## Streaming cadence
- If streaming is added, batch token updates (e.g., every 30–60ms or by 3–5 chars) to reduce re-render pressure.

## Logging
- Remove/gate hot-path logs (`__DEV__`) and prefer structured logger with levels.

## Concrete expectations
- After extraData fix and memoized subtree, expect input typing to be 60–90% smoother; MessageList renders drop to O(new tokens) not O(keystrokes).
