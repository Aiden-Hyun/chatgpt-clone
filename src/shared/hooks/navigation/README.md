# Navigation Hooks

This directory contains modularized navigation hooks that provide comprehensive navigation functionality.

## Overview

The navigation hooks have been modularized into focused, single-responsibility hooks that can be used independently or combined for full functionality.

## Hooks

### `useNavigationState` (Core State)
**File**: `useNavigationState.ts`
**Purpose**: Route tracking and navigation state management

```typescript
const { currentRoute, canGoBack, isNavigating, navigationHistory, setIsNavigating } = useNavigationState();
```

### `useNavigationActions`
**File**: `useNavigationActions.ts`
**Purpose**: Generic navigation with guards and error handling

```typescript
const { navigateTo, goBack, canNavigate } = useNavigationActions({
  preventNavigationDuringLoading: true,
  isNavigating,
  canGoBack,
  setIsNavigating
});
```

### `useRouteNavigation`
**File**: `useRouteNavigation.ts`
**Purpose**: Specific route navigation methods

```typescript
const { navigateToHome, navigateToLogin, navigateToChat, navigateToExplore } = useRouteNavigation({
  navigateTo,
  isNavigating
});
```

### `useNavigationCombined`
**File**: `useNavigationCombined.ts`
**Purpose**: Backward compatibility hook that combines all functionality

```typescript
const navigation = useNavigationCombined({
  preventNavigationDuringLoading: true
});
```

## Usage Examples

### Basic Usage (Backward Compatible)
```typescript
import { useNavigation } from '@/shared/hooks';

const MyComponent = () => {
  const { navigateToHome, goBack, canGoBack } = useNavigation();
  
  return (
    <View>
      <Button onPress={navigateToHome}>Go Home</Button>
      {canGoBack && <Button onPress={goBack}>Go Back</Button>}
    </View>
  );
};
```

### Modular Usage
```typescript
import { useNavigationState, useNavigationActions, useRouteNavigation } from '@/shared/hooks/navigation';

const MyComponent = () => {
  const navigationState = useNavigationState();
  const navigationActions = useNavigationActions({
    preventNavigationDuringLoading: true,
    ...navigationState
  });
  const routeNavigation = useRouteNavigation({
    navigateTo: navigationActions.navigateTo,
    isNavigating: navigationState.isNavigating
  });
  
  return (
    <View>
      <Button onPress={routeNavigation.navigateToHome}>Go Home</Button>
      <Button onPress={navigationActions.goBack}>Go Back</Button>
    </View>
  );
};
```

### Custom Navigation
```typescript
import { useNavigationState, useNavigationActions } from '@/shared/hooks/navigation';

const MyComponent = () => {
  const { currentRoute, isNavigating, setIsNavigating } = useNavigationState();
  const { navigateTo } = useNavigationActions({
    isNavigating,
    canGoBack: true,
    setIsNavigating
  });
  
  const handleCustomNavigation = () => {
    navigateTo('/custom-route');
  };
  
  return <Button onPress={handleCustomNavigation}>Custom Route</Button>;
};
```

## Migration Guide

### From Old `useNavigation`
The old `useNavigation` hook has been replaced with `useNavigationCombined` which provides the same interface. Existing code should continue to work without changes.

### To Modular Hooks
For better performance and flexibility, consider migrating to the modular hooks:

1. **Replace**: `useNavigation()` 
2. **With**: `useNavigationState()` + `useNavigationActions()` + `useRouteNavigation()`

## Benefits

- **Better Performance**: Only import what you need
- **Easier Testing**: Test individual hooks in isolation
- **More Flexible**: Mix and match functionality
- **Better Maintainability**: Single responsibility principle
- **Backward Compatible**: Existing code continues to work 