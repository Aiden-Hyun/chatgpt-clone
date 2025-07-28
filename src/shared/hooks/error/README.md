# Error Hooks

This directory contains modularized error handling hooks that provide comprehensive error management functionality.

## Overview

The error hooks have been modularized into focused, single-responsibility hooks that can be used independently or combined for full functionality.

## Hooks

### `useErrorState` (Core)
**File**: `useErrorState.ts`
**Purpose**: Basic error state management and CRUD operations

```typescript
const { errors, currentError, setError, clearError, clearAllErrors } = useErrorState();
```

### `useErrorCreators`
**File**: `useErrorCreators.ts`
**Purpose**: Type-specific error creation utilities

```typescript
const { setNetworkError, setAuthError, setApiError, setValidationError, setErrorFromException } = useErrorCreators({ setError });
```

### `useErrorUI`
**File**: `useErrorUI.ts`
**Purpose**: Alert management and auto-clear timers

```typescript
const { showErrorAlert, showCustomAlert } = useErrorUI({
  autoClear: true,
  autoClearDelay: 5000,
  showAlerts: true,
  currentError,
  clearError
});
```

### `useErrorLogging`
**File**: `useErrorLogging.ts`
**Purpose**: Console logging and external logging integration

```typescript
const { logError, logErrorWithContext } = useErrorLogging({
  logToConsole: true,
  externalLogger: (error) => { /* custom logging */ }
});
```

### `useErrorStateCombined`
**File**: `useErrorStateCombined.ts`
**Purpose**: Backward compatibility hook that combines all functionality

```typescript
const errorState = useErrorStateCombined({
  autoClear: true,
  showAlerts: true,
  logToConsole: true
});
```

## Usage Examples

### Basic Usage (Backward Compatible)
```typescript
import { useErrorState } from '@/shared/hooks';

const MyComponent = () => {
  const { setError, clearError, hasErrors } = useErrorState();
  
  const handleError = () => {
    setError({ message: 'Something went wrong', type: 'general' });
  };
  
  return (
    <View>
      {hasErrors && <Text>Error occurred</Text>}
    </View>
  );
};
```

### Modular Usage
```typescript
import { useErrorStateCore, useErrorCreators, useErrorUI } from '@/shared/hooks/error';

const MyComponent = () => {
  const errorState = useErrorStateCore();
  const { setNetworkError } = useErrorCreators({ setError: errorState.setError });
  const { showErrorAlert } = useErrorUI({
    currentError: errorState.currentError,
    clearError: errorState.clearError
  });
  
  const handleNetworkError = () => {
    setNetworkError('Connection failed');
  };
  
  return <View />;
};
```

### Custom Error Logging
```typescript
import { useErrorStateCore, useErrorLogging } from '@/shared/hooks/error';

const MyComponent = () => {
  const errorState = useErrorStateCore();
  const { logErrorWithContext } = useErrorLogging({
    externalLogger: (error) => {
      // Send to external service
      analytics.track('error', error);
    }
  });
  
  const handleError = () => {
    const error = { message: 'API Error', type: 'api' as const };
    errorState.setError(error);
    logErrorWithContext(error, { component: 'MyComponent' });
  };
  
  return <View />;
};
```

## Migration Guide

### From Old `useErrorState`
The old `useErrorState` hook has been replaced with `useErrorStateCombined` which provides the same interface. Existing code should continue to work without changes.

### To Modular Hooks
For better performance and flexibility, consider migrating to the modular hooks:

1. **Replace**: `useErrorState()` 
2. **With**: `useErrorStateCore()` + `useErrorCreators()` + `useErrorUI()` + `useErrorLogging()`

## Benefits

- **Better Performance**: Only import what you need
- **Easier Testing**: Test individual hooks in isolation
- **More Flexible**: Mix and match functionality
- **Better Maintainability**: Single responsibility principle
- **Backward Compatible**: Existing code continues to work 