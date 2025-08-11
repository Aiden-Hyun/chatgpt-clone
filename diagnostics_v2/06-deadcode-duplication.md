# Dead Code & Duplication

## Unused/Legacy (safe candidates)
- `src/features/chat/components/ChatMessageBubble/*` — exported but not used by `UnifiedChat`/`MessageList`; verify references before removal.
- `src/features/chat/components/TypewriterText/test.tsx` — dev/test harness; exclude in prod bundle.
- Duplicate patterns: two `useMessageActions` (root and `hooks/messages` subpath); consider consolidating to one.

## Unreachable/Redundant
- Animation decision logs previously inside render; now removed.
- Inline style factories inside list components could be hoisted/memoized where possible.

## Duplicates (≥85% similar)
- `useMessageActions` variants share sending/regeneration semantics; keep a single orchestrator.

## Safe deletion list (after grep confirms no imports)
- `ChatMessageBubble` component (and styles)
- `TypewriterText/test.tsx`

> Run: `rg -n "ChatMessageBubble"` and `rg -n "TypewriterText/test"` to confirm zero runtime references.
