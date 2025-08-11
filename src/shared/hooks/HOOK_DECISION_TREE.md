# Hook Decision Tree

Use this decision tree to quickly find the right hook for your use case.

## 🔄 Need Loading State?

```
├── Basic loading state management
│   └── → `useLoadingState()`
├── Loading with UI components
│   └── → `useLoadingScreen()`
└── Loading wrapper for components
    └── → `<LoadingWrapper loading={loading}>`
```

## 🚨 Need Error Handling?

```
├── Basic error state
│   └── → `useErrorState()` (deprecated)
├── Complete error handling with UI
│   └── → `useErrorStateCombined()`
├── Type-specific error creation
│   ├── Network errors → `setNetworkError()`
│   ├── Auth errors → `setAuthError()`
│   ├── API errors → `setApiError()`
│   └── Validation errors → `setValidationError()`
└── Custom error logging
    └── → `useErrorLogging()`
```

## 🧭 Need Navigation?

```
├── Complete navigation functionality
│   └── → `useNavigationCombined()`
├── Route-specific navigation
│   ├── Home → `navigateToHome()`
│   ├── Login → `navigateToLogin()`
│   ├── Chat → `navigateToChat()`
│   └── Explore → `navigateToExplore()`
├── Back button handling
│   └── → `useBackButtonHandler()`
└── Navigation state
    └── → `useNavigationState()`
```

## 👀 Need Focus Effects?

```
└── Refresh data when screen comes into focus
    └── → `useRefreshOnFocus(fetchFunction, [dependencies])`
```

## 💬 Need Chat Functionality?

```
├── Main chat functionality
│   └── → `useChat(roomId)`
├── Chat room management
│   └── → `useChatRooms()`
├── Message management  
│   └── → `useChat(roomId)` (includes state machine)
├── Message input handling
│   └── → `useMessageInput(roomId, isNewRoom)`
├── Model selection
│   └── → `useModelSelection(roomId)`
└── Chat context (React context)
    └── → `useChatContext()`
```

## 🎨 Need UI/Theme?

```
├── App theme access
│   └── → `useAppTheme()`
├── Color scheme detection
│   └── → `useColorScheme()`
├── Theme color utilities
│   └── → `useThemeColor()`
├── Input focus management
│   └── → `useInputFocus()`
└── Tab bar overflow (iOS/TabBar)
    └── → `useBottomTabOverflow()`
```

## 🔐 Need Authentication?

```
├── Logout functionality
│   └── → `useLogout()`
├── User information
│   └── → `useUserInfo()`
└── Auth context (React context)
    └── → `useAuth()`
```

## 🚀 Quick Reference

### **Most Common Patterns**

1. **Loading Screen**: `useLoadingScreen()` + `<LoadingWrapper>`
2. **Error Handling**: `useErrorStateCombined()` + `setNetworkError()`
3. **Navigation**: `useNavigationCombined()` + `navigateToHome()`
4. **Focus Refresh**: `useRefreshOnFocus(fetchData, [fetchData])`
5. **Back Button**: `useBackButtonHandler({ enabled: true })`
6. **Chat**: `useChat(roomId)` + `useChatRooms()`
7. **Theme**: `useAppTheme()` + `useThemeColor()` + `useBottomTabOverflow()`
8. **Context**: `useChatContext()` + `useAuth()`

### **Import Patterns**

```typescript
// Core hooks
import { useLoadingState, useErrorStateCombined, useNavigationCombined } from '@/shared/hooks';

// Feature hooks
import { useChat, useChatRooms } from '@/features/chat/hooks';

// UI components
import { LoadingWrapper } from '@/shared/components';

// Error hooks
import { useErrorStateCombined } from '@/shared/hooks/error';

// Navigation hooks
import { useNavigationCombined } from '@/shared/hooks/navigation';

// Context hooks
import { useChatContext } from '@/features/chat/context/ChatContext';
import { useAuth } from '@/features/auth/context/AuthContext';
```

## 🎯 Decision Flow

1. **What are you trying to do?**
   - Loading? → Check Loading section
   - Errors? → Check Error Handling section
   - Navigation? → Check Navigation section
   - Chat? → Check Chat Functionality section
   - UI/Theme? → Check UI/Theme section
   - Authentication? → Check Authentication section

2. **What's your specific use case?**
   - Follow the decision tree branches

3. **Need multiple hooks?**
   - Combine them following the patterns in the catalog

4. **Not sure?**
   - Check the Master Hooks Catalog for detailed examples 