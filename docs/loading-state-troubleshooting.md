# Loading State Troubleshooting Guide

## Quick Reference

### Common Loading State Issues

#### 1. Loading Text Not Showing
**Symptoms**: No loading animation appears when sending messages
**Check**: 
- `isNewMessageLoading` state in `useChatState`
- `MessageItem` component loading condition
- `LoadingMessage` component rendering

#### 2. Loading Text Disappears Too Early
**Symptoms**: Loading text appears briefly then disappears before response starts
**Check**:
- `setIsTyping` function in `useMessageActions`
- Timing of `stopNewMessageLoading()` calls
- State coordination between loading and typing states

#### 3. Loading Text Persists After Response Starts
**Symptoms**: Loading text continues showing even when response is typing
**Check**:
- `customSetMessages` function logic
- Content change detection in message updates
- `stopNewMessageLoading()` timing

### Key Files to Check

```
src/features/chat/hooks/useMessageActions.ts     # Main state coordination
src/features/chat/hooks/useChatState.ts          # Loading state management
src/features/chat/components/MessageList/index.tsx    # UI rendering
src/features/chat/components/MessageItem/index.tsx    # Message rendering
src/features/chat/components/LoadingMessage/index.tsx # Loading animation
```

### State Flow Checklist

- [ ] `startNewMessageLoading()` called when user sends message
- [ ] `LoadingMessage` component renders for empty assistant messages
- [ ] `setTyping(true)` doesn't immediately stop loading state
- [ ] `customSetMessages` detects first content character
- [ ] `stopNewMessageLoading()` called when content appears
- [ ] Smooth transition to typewriter animation

### Debug Commands

```typescript
// Add to useMessageActions for debugging
console.log('Loading state:', isNewMessageLoading);
console.log('Typing state:', isTyping);
console.log('Message content:', messages[messages.length - 1]?.content);
```

### Common Fixes

1. **Loading not showing**: Check `MessageItem` condition for `isNewMessageLoading`
2. **Loading disappears early**: Ensure `setIsTyping` doesn't call `stopNewMessageLoading` directly
3. **Loading persists**: Verify `customSetMessages` logic detects content changes
4. **Type errors**: Add `as const` to `role: 'assistant'` in message creation

### Testing Checklist

- [ ] New message loading animation
- [ ] Regenerating message loading animation  
- [ ] Error state handling
- [ ] Network timeout scenarios
- [ ] Rapid message sending
- [ ] Long response generation

---

**Last Updated**: January 2025
**Related**: [Loading Text Animation Bug Documentation](./loading-text-animation-bug.md) 