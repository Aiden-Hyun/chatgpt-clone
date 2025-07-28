# Master Hooks Catalog

This document catalogs ALL custom hooks available in the app to prevent hardcoding and ensure consistent usage.

## 📁 Import Structure

```typescript
// Core hooks
import { 
  useLoadingState, 
  useLoadingScreen, 
  useRefreshOnFocus,
  useBackButtonHandler,
  useInputFocus,
  useAppTheme,
  useColorScheme,
  useThemeColor
} from '@/shared/hooks';

// Error handling hooks
import { 
  useErrorStateCombined,
  useErrorCreators,
  useErrorUI,
  useErrorLogging
} from '@/shared/hooks';

// Navigation hooks
import { 
  useNavigationCombined,
  useNavigationActions,
  useNavigationState,
  useRouteNavigation
} from '@/shared/hooks';

// Chat hooks
import { 
  useChat,
  useChatRooms,
  useMessageInput,
  useMessageStorage,
  useModelSelection
} from '@/features/chat/hooks';

// Message hooks
import { 
  useMessagesCombined,
  useMessageState,
  useMessageLoading,
  useMessageActions,
  useMessageRegeneration
} from '@/features/chat/hooks/messages';

// Auth hooks
import { 
  useLogout,
  useUserInfo
} from '@/features/auth/hooks';

// Context hooks
import { useAuth } from '@/features/auth/context';
import { useChatContext } from '@/features/chat/context';

// UI components
import { useBottomTabOverflow } from '@/shared/components';
```

## 🎯 Core State Management Hooks

### **Loading & State Management**

#### `useLoadingState`
**File**: `src/shared/hooks/useLoadingState.ts`  
**Purpose**: Basic loading state management with utilities

```typescript
const { 
  loading, 
  setLoading, 
  startLoading, 
  stopLoading, 
  toggleLoading,
  getLoadingStyles 
} = useLoadingState({ initialLoading: false });

// Usage
const handleSubmit = async () => {
  startLoading();
  try {
    await submitData();
  } finally {
    stopLoading();
  }
};
```

#### `useLoadingScreen`
**File**: `src/shared/hooks/useLoadingScreen.ts`  
**Purpose**: Loading state with UI components and options

```typescript
const { 
  loading, 
  setLoading, 
  showLoadingScreen,
  hideLoadingScreen 
} = useLoadingScreen({ 
  message: 'Loading...',
  size: 'large',
  fullScreen: true 
});

// Usage
const handleAsyncOperation = async () => {
  showLoadingScreen('Processing...');
  try {
    await longRunningOperation();
  } finally {
    hideLoadingScreen();
  }
};
```

#### `useRefreshOnFocus`
**File**: `src/shared/hooks/useRefreshOnFocus.ts`  
**Purpose**: Refresh data when screen comes into focus

```typescript
useRefreshOnFocus(fetchData, [fetchData]);

// With custom dependencies
useRefreshOnFocus(() => {
  refetchMessages();
  updateUserStatus();
}, [refetchMessages, updateUserStatus]);
```

### **Error Handling**

#### `useErrorStateCombined`
**File**: `src/shared/hooks/error/useErrorStateCombined.ts`  
**Purpose**: Complete error handling with logging and UI

```typescript
const { 
  setNetworkError, 
  setAuthError, 
  setApiError, 
  setValidationError,
  clearError,
  currentError 
} = useErrorStateCombined({
  autoClear: true,
  autoClearDelay: 5000,
  showAlerts: true,
  logToConsole: true
});

// Usage
const handleApiCall = async () => {
  try {
    await apiCall();
  } catch (error) {
    setApiError({
      context: 'api-call',
      originalError: error,
      userMessage: 'Failed to fetch data'
    });
  }
};
```

#### `useErrorCreators`
**File**: `src/shared/hooks/error/useErrorCreators.ts`  
**Purpose**: Create typed errors (network, auth, validation, api)

```typescript
const { 
  setNetworkError, 
  setAuthError, 
  setApiError, 
  setValidationError 
} = useErrorCreators({ setError });

// Usage
setNetworkError('Connection failed', { 
  context: 'fetch-messages',
  originalError: networkError 
});
```

#### `useErrorUI`
**File**: `src/shared/hooks/error/useErrorUI.ts`  
**Purpose**: Alert management and auto-clear timers

```typescript
const { 
  showErrorAlert, 
  hideErrorAlert, 
  clearErrorTimer 
} = useErrorUI({
  autoClear: true,
  autoClearDelay: 5000,
  showAlerts: true,
  currentError,
  clearError
});
```

#### `useErrorLogging`
**File**: `src/shared/hooks/error/useErrorLogging.ts`  
**Purpose**: Console logging and external logging integration

```typescript
const { 
  logError, 
  logWarning, 
  logInfo 
} = useErrorLogging({
  logToConsole: true,
  externalLogger: (error) => {
    // Send to external service
    analytics.track('error', error);
  }
});
```

### **Navigation**

#### `useNavigationCombined`
**File**: `src/shared/hooks/navigation/useNavigationCombined.ts`  
**Purpose**: Complete navigation functionality

```typescript
const { 
  navigateToHome, 
  navigateToLogin, 
  navigateToChat, 
  navigateToExplore,
  goBack,
  canGoBack 
} = useNavigationCombined();

// Usage
const handleLogout = () => {
  signOut();
  navigateToLogin();
};
```

#### `useNavigationActions`
**File**: `src/shared/hooks/navigation/useNavigationActions.ts`  
**Purpose**: Navigation actions (navigate, goBack, etc.)

```typescript
const { 
  navigate, 
  goBack, 
  push, 
  pop, 
  reset 
} = useNavigationActions();

// Usage
const handleNavigate = () => {
  navigate('Chat', { roomId: 123, roomName: 'General' });
};
```

#### `useNavigationState`
**File**: `src/shared/hooks/navigation/useNavigationState.ts`  
**Purpose**: Navigation state management

```typescript
const { 
  currentRoute, 
  previousRoute, 
  isFocused,
  navigationState 
} = useNavigationState();

// Usage
useEffect(() => {
  if (isFocused) {
    refreshData();
  }
}, [isFocused]);
```

#### `useRouteNavigation`
**File**: `src/shared/hooks/navigation/useRouteNavigation.ts`  
**Purpose**: Route-specific navigation helpers

```typescript
const { 
  navigateToChatRoom, 
  navigateToSettings,
  navigateToProfile 
} = useRouteNavigation();

// Usage
const handleRoomSelect = (roomId: number) => {
  navigateToChatRoom(roomId);
};
```

#### `useBackButtonHandler`
**File**: `src/shared/hooks/useBackButtonHandler.ts`  
**Purpose**: Android back button management

```typescript
const { 
  disableBackButton, 
  enableBackButton,
  isBackButtonDisabled 
} = useBackButtonHandler({ 
  enabled: true,
  onBackPress: () => {
    // Custom back button logic
    if (hasUnsavedChanges) {
      showConfirmationDialog();
      return true; // Prevent default
    }
    return false; // Allow default
  }
});

// Usage
useEffect(() => {
  if (isEditing) {
    disableBackButton();
  } else {
    enableBackButton();
  }
}, [isEditing]);
```

### **UI & Interaction**

#### `useInputFocus`
**File**: `src/shared/hooks/useInputFocus.ts`  
**Purpose**: Input field focus management

```typescript
const { 
  inputRef, 
  maintainFocus, 
  focusInput, 
  blurInput,
  isFocused 
} = useInputFocus();

// Usage
const handleSubmit = () => {
  blurInput();
  submitForm();
};

// In component
<TextInput 
  ref={inputRef}
  onFocus={() => maintainFocus(true)}
  onBlur={() => maintainFocus(false)}
/>
```

#### `useAppTheme`
**File**: `src/shared/hooks/useAppTheme.ts`  
**Purpose**: App theme access

```typescript
const theme = useAppTheme();

// Usage
const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.primary,
    padding: theme.spacing.lg,
  },
  text: {
    color: theme.colors.text.primary,
    fontSize: theme.fontSizes.md,
  },
});
```

#### `useColorScheme`
**File**: `src/shared/hooks/useColorScheme.ts`  
**Purpose**: Color scheme detection

```typescript
const colorScheme = useColorScheme(); // 'light' | 'dark' | null

// Usage
useEffect(() => {
  if (colorScheme === 'dark') {
    // Apply dark mode specific logic
  }
}, [colorScheme]);
```

#### `useThemeColor`
**File**: `src/shared/hooks/useThemeColor.ts`  
**Purpose**: Theme color utilities

```typescript
const textColor = useThemeColor({ light: '#000000', dark: '#FFFFFF' }, 'text');

// Usage
const styles = StyleSheet.create({
  text: {
    color: textColor,
  },
});
```

#### `useBottomTabOverflow`
**File**: `src/shared/components/ui/TabBarBackground.tsx`  
**Purpose**: Tab bar overflow detection and handling (iOS/TabBar)

```typescript
const { isOverflowing } = useBottomTabOverflow();

// Usage
useEffect(() => {
  if (isOverflowing) {
    // Handle tab bar overflow
    adjustTabBarLayout();
  }
}, [isOverflowing]);
```

## 🚀 Feature-Specific Hooks

### **Chat Features**

#### `useChat`
**File**: `src/features/chat/hooks/useChat.ts`  
**Purpose**: Main chat functionality coordinator

```typescript
const { 
  messages, 
  loading, 
  sending, 
  isTyping,
  input,
  handleInputChange,
  sendMessage,
  regenerateMessage,
  selectedModel,
  updateModel
} = useChat(roomId);

// Usage
const handleSend = () => {
  sendMessage();
};

const handleRegenerate = (index: number) => {
  regenerateMessage(index);
};
```

#### `useChatRooms`
**File**: `src/features/chat/hooks/useChatRooms.ts`  
**Purpose**: Chat room management

```typescript
const { 
  rooms, 
  loading, 
  error,
  fetchRooms,
  createRoom,
  deleteRoom,
  updateRoom 
} = useChatRooms();

// Usage
const handleCreateRoom = async (name: string) => {
  const newRoom = await createRoom(name);
  navigateToChat(newRoom.id);
};
```

#### `useMessageInput`
**File**: `src/features/chat/hooks/useMessageInput.ts`  
**Purpose**: Message input handling

```typescript
const { 
  input, 
  drafts, 
  setDrafts,
  handleInputChange,
  clearInput,
  saveDraft,
  loadDraft 
} = useMessageInput(roomId, isNewRoom);

// Usage
const handleInputChange = (text: string) => {
  handleInputChange(text);
  saveDraft(text);
};
```

#### `useMessageStorage`
**File**: `src/features/chat/hooks/useMessageStorage.ts`  
**Purpose**: Local storage for messages

```typescript
const { 
  storedMessages, 
  storedModel,
  saveMessages,
  saveModel,
  clearStorage 
} = useMessageStorage(roomId);

// Usage
useEffect(() => {
  if (messages.length > 0) {
    saveMessages(messages);
  }
}, [messages]);
```

#### `useModelSelection`
**File**: `src/features/chat/hooks/useModelSelection.ts`  
**Purpose**: AI model selection

```typescript
const { 
  selectedModel, 
  updateModel,
  availableModels 
} = useModelSelection(roomId);

// Usage
const handleModelChange = (model: string) => {
  updateModel(model);
};
```

### **Message Hooks (Modular)**

#### `useMessagesCombined`
**File**: `src/features/chat/hooks/messages/useMessagesCombined.ts`  
**Purpose**: Message management (replaces useMessages)

```typescript
const { 
  messages, 
  loading, 
  sending, 
  isTyping,
  selectedModel,
  sendMessage,
  regenerateMessage,
  updateModel 
} = useMessagesCombined(roomId);

// Usage
const handleSend = async (content: string) => {
  await sendMessage(content);
};
```

#### `useMessageState`
**File**: `src/features/chat/hooks/messages/useMessageState.ts`  
**Purpose**: Core message state management

```typescript
const { 
  messages, 
  setMessages,
  addMessage,
  updateMessage,
  removeMessage 
} = useMessageState();

// Usage
const handleNewMessage = (message: ChatMessage) => {
  addMessage(message);
};
```

#### `useMessageLoading`
**File**: `src/features/chat/hooks/messages/useMessageLoading.ts`  
**Purpose**: Message loading and fetching

```typescript
const { 
  loading, 
  sending, 
  isTyping,
  setLoading,
  setSending,
  setIsTyping 
} = useMessageLoading();

// Usage
const handleSend = async () => {
  setSending(true);
  try {
    await sendMessage();
  } finally {
    setSending(false);
  }
};
```

#### `useMessageActions`
**File**: `src/features/chat/hooks/messages/useMessageActions.ts`  
**Purpose**: Send message actions

```typescript
const { 
  sendMessage,
  regenerateMessage,
  deleteMessage 
} = useMessageActions(roomId);

// Usage
const handleSend = async (content: string) => {
  await sendMessage(content);
};
```

#### `useMessageRegeneration`
**File**: `src/features/chat/hooks/messages/useMessageRegeneration.ts`  
**Purpose**: Message regeneration logic

```typescript
const { 
  regenerateMessage,
  isRegenerating,
  regenerationError 
} = useMessageRegeneration(roomId);

// Usage
const handleRegenerate = async (index: number) => {
  await regenerateMessage(index);
};
```

### **Authentication**

#### `useLogout`
**File**: `src/features/auth/hooks/useLogout.ts`  
**Purpose**: Logout functionality

```typescript
const { logout, isLoggingOut } = useLogout();

// Usage
const handleLogout = async () => {
  await logout();
  navigateToLogin();
};
```

#### `useUserInfo`
**File**: `src/features/auth/hooks/useUserInfo.ts`  
**Purpose**: User information management

```typescript
const { 
  userInfo, 
  updateUserInfo,
  refreshUserInfo 
} = useUserInfo();

// Usage
const handleUpdateProfile = async (updates: Partial<UserInfo>) => {
  await updateUserInfo(updates);
};
```

### **Context Hooks**

#### `useAuth`
**File**: `src/features/auth/context/AuthContext.tsx`  
**Purpose**: Provides authentication context

```typescript
const { 
  user, 
  session, 
  loading, 
  signIn, 
  signOut 
} = useAuth();

// Usage
const handleLogin = async () => {
  await signIn('google');
};

if (loading) return <LoadingScreen />;
if (!user) return <LoginScreen />;
```

#### `useChatContext`
**File**: `src/features/chat/context/ChatContext.tsx`  
**Purpose**: Provides chat context

```typescript
const { 
  currentRoom, 
  setCurrentRoom, 
  chatSettings, 
  updateChatSettings,
  isTyping,
  setIsTyping 
} = useChatContext();

// Usage
const handleRoomSelect = (room: ChatRoom) => {
  setCurrentRoom(room);
};
```

## 📋 Usage Patterns

### **Loading Pattern**
```tsx
// ✅ Good - Use LoadingWrapper for conditional loading
<LoadingWrapper loading={loading}>
  <YourContent />
</LoadingWrapper>

// ✅ Good - Use useLoadingState for manual control
const { loading, startLoading, stopLoading } = useLoadingState();
```

### **Error Handling Pattern**
```tsx
// ✅ Good - Use useErrorStateCombined for comprehensive error handling
const { setNetworkError, setAuthError, clearError } = useErrorStateCombined({
  autoClear: true,
  showAlerts: true
});

try {
  await apiCall();
} catch (error) {
  setNetworkError('Request failed', { 
    context: 'api-call',
    originalError: error 
  });
}
```

### **Focus Effect Pattern**
```tsx
// ✅ Good - Use useRefreshOnFocus for screen focus
useRefreshOnFocus(fetchData, [fetchData]);

// ✅ Good - Use useInputFocus for input management
const { inputRef, maintainFocus } = useInputFocus();
```

### **Back Button Pattern**
```tsx
// ✅ Good - Use useBackButtonHandler for Android back button
const { disableBackButton, enableBackButton } = useBackButtonHandler({ 
  enabled: true 
});

useEffect(() => {
  if (hasUnsavedChanges) {
    disableBackButton();
  } else {
    enableBackButton();
  }
}, [hasUnsavedChanges]);
```

## 🚫 Anti-Patterns (Don't Do This)

### **Loading Anti-Patterns**
```tsx
// ❌ Don't do this - Manual loading state
if (loading) {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" />
    </View>
  );
}

// ✅ Do this instead - Use LoadingWrapper
<LoadingWrapper loading={loading}>
  <YourContent />
</LoadingWrapper>
```

### **Error Handling Anti-Patterns**
```tsx
// ❌ Don't do this - Manual error handling
try {
  await apiCall();
} catch (error) {
  console.error('Error:', error);
  setError('Something went wrong');
}

// ✅ Do this instead - Use useErrorStateCombined
try {
  await apiCall();
} catch (error) {
  setNetworkError('Request failed', { 
    context: 'api-call',
    originalError: error 
  });
}
```

### **Focus Effect Anti-Patterns**
```tsx
// ❌ Don't do this - Manual useFocusEffect
useFocusEffect(
  useCallback(() => {
    refreshData();
  }, [refreshData])
);

// ✅ Do this instead - Use useRefreshOnFocus
useRefreshOnFocus(refreshData, [refreshData]);
```

## 🔍 Hook Discovery Table

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
| Chat context | `useChatContext` | `const { currentRoom } = useChatContext()` |
| Auth context | `useAuth` | `const { user } = useAuth()` |
| Message management | `useMessagesCombined` | `const { messages, sendMessage } = useMessagesCombined(roomId)` |
| Message input | `useMessageInput` | `const { input, handleInputChange } = useMessageInput(roomId, isNewRoom)` |
| Model selection | `useModelSelection` | `const { selectedModel, updateModel } = useModelSelection(roomId)` |
| User info | `useUserInfo` | `const { userInfo, updateUserInfo } = useUserInfo()` |
| Logout | `useLogout` | `const { logout } = useLogout()` |

## 📝 Best Practices

1. **Always check this catalog** before implementing new functionality
2. **Use existing hooks** instead of creating new ones
3. **Follow the patterns** shown in the examples
4. **Avoid anti-patterns** listed above
5. **Update this catalog** when adding new hooks
6. **Use proper import paths** as shown in the import structure
7. **Combine hooks** when needed for complex functionality

## 🔄 Maintenance

- Update this catalog when adding new hooks
- Review this catalog during code reviews
- Use this catalog for onboarding new developers
- Reference this catalog when refactoring existing code
- Verify import paths when updating this catalog 