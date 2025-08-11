# Master Hooks Catalog

This document catalogs ALL custom hooks available in the app to prevent hardcoding and ensure consistent usage.

## 🎯 Core State Management Hooks

### **Loading & State Management**
- `useLoadingState` - Basic loading state management with utilities
- `useLoadingScreen` - Loading state with UI components and options
- `useRefreshOnFocus` - Refresh data when screen comes into focus

### **Error Handling**
- `useErrorState` - Basic error state management (deprecated, use useErrorStateCombined)
- `useErrorStateCombined` - Complete error handling with logging and UI
- `useErrorCreators` - Create typed errors (network, auth, validation, api)
- `useErrorUI` - Alert management and auto-clear timers
- `useErrorLogging` - Console logging and external logging integration

### **Navigation**
- `useNavigationCombined` - Complete navigation functionality
- `useNavigationActions` - Navigation actions (navigate, goBack, etc.)
- `useNavigationState` - Navigation state management
- `useRouteNavigation` - Route-specific navigation helpers
- `useBackButtonHandler` - Android back button management

### **UI & Interaction**
- `useInputFocus` - Input field focus management
- `useAppTheme` - App theme access
- `useColorScheme` - Color scheme detection
- `useThemeColor` - Theme color utilities
- `useBottomTabOverflow` - Tab bar overflow detection and handling (iOS/TabBar)

## 🚀 Feature-Specific Hooks

### **Chat Features**
- `useChat` - Main chat functionality coordinator with state machine (replaces useMessages)
- `useChatRooms` - Chat room management
- `useMessageInput` - Message input handling
- `useOptimisticMessages` - Optimistic loading for new chat rooms
- `useModelSelection` - AI model selection
- `useChatContext` - Provides chat context (React context hook)

### **Message Hooks (Modular)**
- `useMessageState` - Core message state management
- `useMessageLoading` - Message loading and fetching
- `useMessageActions` - Send message actions
- `useMessageRegeneration` - Message regeneration logic

### **Authentication**
- `useLogout` - Logout functionality
- `useUserInfo` - User information management
- `useAuth` - Provides authentication context (React context hook)

## 🧩 UI Components

### **Loading Components**
- `LoadingScreen` - Full-screen loading component
- `LoadingWrapper` - Wrapper that shows loading state

## 📋 Usage Patterns

### **Loading Pattern**
```tsx
// Instead of manual ActivityIndicator
<LoadingWrapper loading={loading}>
  <YourContent />
</LoadingWrapper>
```

### **Error Handling Pattern**
```tsx
// Instead of manual error handling
const { setNetworkError, setAuthError, clearError } = useErrorStateCombined({
  autoClear: true,
  showAlerts: true
});
```

### **Focus Effect Pattern**
```tsx
// Instead of manual useFocusEffect
useRefreshOnFocus(fetchData, [fetchData]);
```

### **Back Button Pattern**
```tsx
// Instead of manual back button handling
const { disableBackButton } = useBackButtonHandler({ enabled: true });
```

## 🚫 Anti-Patterns (Don't Do This)

### **Loading Anti-Patterns**
```tsx
// ❌ Don't do this
if (loading) {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" />
    </View>
  );
}

// ✅ Do this instead
<LoadingWrapper loading={loading}>
  <YourContent />
</LoadingWrapper>
```

### **Error Handling Anti-Patterns**
```tsx
// ❌ Don't do this
try {
  // some code
} catch (error) {
  console.error('Error:', error);
  setError('Something went wrong');
}

// ✅ Do this instead
try {
  // some code
} catch (error) {
  setNetworkError('Something went wrong', { 
    context: 'operation-name',
    originalError: error 
  });
}
```

### **Focus Effect Anti-Patterns**
```tsx
// ❌ Don't do this
useFocusEffect(
  useCallback(() => {
    refreshData();
  }, [refreshData])
);

// ✅ Do this instead
useRefreshOnFocus(refreshData, [refreshData]);
```

## 🔍 Hook Discovery

### **When to Use Which Hook**

| Use Case | Hook | Example |
|----------|------|---------|
| Loading state | `useLoadingState` | `const { loading, setLoading } = useLoadingState()` |
| Loading UI | `LoadingWrapper` | `<LoadingWrapper loading={loading}>` |
| Refresh on focus | `useRefreshOnFocus` | `useRefreshOnFocus(fetchData, [fetchData])` |
| Error handling | `useErrorStateCombined` | `const { setNetworkError } = useErrorStateCombined()` |
| Back button | `useBackButtonHandler` | `const { disableBackButton } = useBackButtonHandler()` |
| Input focus | `useInputFocus` | `const { inputRef, maintainFocus } = useInputFocus()` |
| Navigation | `useNavigationCombined` | `const { navigateToHome } = useNavigationCombined()` |
| Chat functionality | `useChat` | `const { messages, sendMessage } = useChat(roomId)` |
| Chat rooms | `useChatRooms` | `const { rooms, fetchRooms } = useChatRooms()` |
| Theme access | `useAppTheme` | `const theme = useAppTheme()` |
| Tab bar overflow | `useBottomTabOverflow` | `const { isOverflowing } = useBottomTabOverflow()` |
| Chat context | `useChatContext` | `const { state } = useChatContext()` |
| Auth context | `useAuth` | `const { user } = useAuth()` |

## 📝 Best Practices

1. **Always check this catalog** before implementing new functionality
2. **Use existing hooks** instead of creating new ones
3. **Follow the patterns** shown in the examples
4. **Avoid anti-patterns** listed above
5. **Update this catalog** when adding new hooks

## 🔄 Maintenance

- Update this catalog when adding new hooks
- Review this catalog during code reviews
- Use this catalog for onboarding new developers
- Reference this catalog when refactoring existing code 