# Unified Error Handling System

This module provides a comprehensive error handling solution for the application, including standardized error types, centralized logging, and recovery strategies.

## Quick Start

```typescript
import { errorHandler } from '@/shared/services/error';

// Basic error handling
try {
  await someOperation();
} catch (error) {
  const processedError = await errorHandler.handle(error, {
    operation: 'someOperation',
    userId: 'user123'
  });
  
  // Show user-friendly message
  console.log(processedError.userMessage);
}
```

## Features

### 1. Standardized Error Types
- **Network Errors**: Timeout, connection, offline
- **Authentication Errors**: Invalid credentials, session expired, unauthorized
- **API Errors**: Rate limit, server error, validation, forbidden
- **Business Logic Errors**: Validation failed, operation not supported
- **Storage Errors**: Storage error, quota exceeded, permission denied
- **System Errors**: Unknown error, internal error, configuration error

### 2. Centralized Logging
- Automatic error logging with context
- Development vs production logging strategies
- Integration ready for external logging services (Sentry, LogRocket, etc.)

### 3. Recovery Strategies
- **Network Recovery**: Connectivity testing and retry logic
- **Auth Recovery**: Session refresh and re-authentication
- **Rate Limit Recovery**: Automatic backoff and retry
- **Storage Recovery**: Cache clearing and storage reinitialization

### 4. User-Friendly Messages
- Automatic conversion of technical errors to user-friendly messages
- Consistent error messaging across the application
- Localization-ready message system

## Usage Examples

### Basic Error Handling
```typescript
import { errorHandler } from '@/shared/services/error';

const result = await errorHandler.handleWithResult(error, {
  operation: 'userSignIn',
  userId: user.id
});

if (!result.success) {
  showErrorToast(result.error);
}
```

### With Recovery
```typescript
import { errorHandler, errorRecoveryManager } from '@/shared/services/error';

const processedError = await errorHandler.handle(error, {
  operation: 'sendMessage'
});

if (processedError.isRetryable) {
  const recovery = await errorRecoveryManager.attemptRecovery(processedError);
  if (recovery.success) {
    // Retry the operation
    await retryOperation();
  }
}
```

### Custom Error Classification
```typescript
import { ErrorCode, errorHandler } from '@/shared/services/error';

// The system automatically classifies errors, but you can also create specific errors
const customError = new Error('User not found');
const processedError = await errorHandler.handle(customError, {
  operation: 'findUser',
  metadata: { userId: '123' }
});

// Will be classified as AUTH_USER_NOT_FOUND
console.log(processedError.code); // ErrorCode.AUTH_USER_NOT_FOUND
```

## Configuration

```typescript
import { createErrorHandler } from '@/shared/services/error';

const customErrorHandler = createErrorHandler({
  enableRecovery: true,
  enableLogging: true,
  defaultContext: {
    service: 'myService',
    component: 'MyComponent'
  }
});
```

## Integration with Existing Code

### Before (scattered error handling)
```typescript
try {
  await supabase.auth.signInWithPassword({ email, password });
} catch (error) {
  console.error('Signin error:', error);
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  throw new Error(errorMessage);
}
```

### After (unified error handling)
```typescript
try {
  await supabase.auth.signInWithPassword({ email, password });
} catch (error) {
  const processedError = await errorHandler.handle(error, {
    operation: 'emailSignIn',
    userId: email
  });
  throw new Error(processedError.userMessage);
}
```

## Benefits

1. **Consistency**: All errors follow the same format and handling pattern
2. **User Experience**: Users see consistent, friendly error messages
3. **Debugging**: Centralized logging makes debugging easier
4. **Recovery**: Automatic recovery strategies reduce user friction
5. **Maintainability**: Single place to update error handling logic
6. **Analytics**: Error tracking and metrics for better insights

## File Structure

```
src/shared/services/error/
├── ErrorTypes.ts          # Error codes, types, and classifications
├── ErrorMessageMapper.ts  # User-friendly message mapping
├── ErrorLogger.ts         # Centralized logging service
├── ErrorHandler.ts        # Main error handling service
├── ErrorRecovery.ts       # Recovery strategies
├── index.ts              # Barrel exports
└── README.md             # This file
```
