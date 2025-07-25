# Chat Services - SOLID Architecture

This directory contains the refactored chat services following SOLID principles.

## Architecture Overview

### Core Services
- `RetryService` - Handles retry logic with exponential backoff
- `LoggingService` - Centralized logging functionality
- `AIResponseProcessor` - Processes and validates AI responses
- `ServiceRegistry` - Configurable service factory

### Interfaces
The interfaces have been segregated following the Interface Segregation Principle:

- `IMessageStateService` - Message state management
- `ITypingStateService` - Typing state management
- `IAnimationService` - Animation and typewriter effects
- `IDraftService` - Draft message management
- `IAIApiService` - AI API communication (simplified)

### Hooks
Extracted hooks for better separation of concerns:

- `useMessageStorage` - Handles local storage operations
- `useModelSelection` - Manages model selection and persistence

## Usage

### 1. Configure Services
```typescript
import { configureServices } from './config/ServiceConfiguration';

// Initialize services (call this in your app startup)
configureServices();
```

### 2. Use the Service Factory
```typescript
import { ServiceFactory } from './core';

const messageSender = ServiceFactory.createMessageSender(
  setMessages,
  setIsTyping,
  setDrafts
);
```

### 3. Use Extracted Hooks
```typescript
import { useMessageStorage, useModelSelection } from '../hooks';

const { storedMessages, storedModel } = useMessageStorage(roomId);
const { selectedModel, updateModel } = useModelSelection(roomId);
```

## Benefits

1. **Single Responsibility**: Each service has one clear purpose
2. **Open/Closed**: Easy to extend with new implementations
3. **Liskov Substitution**: Interfaces are provider-agnostic
4. **Interface Segregation**: Clients only depend on methods they use
5. **Dependency Inversion**: Depend on abstractions, not concretions

## Migration Guide

### From Legacy Code
1. Replace direct service instantiation with `ServiceFactory`
2. Use extracted hooks instead of mixed responsibilities
3. Update imports to use new segregated interfaces

### Testing
Each service can now be tested in isolation:
```typescript
// Test retry logic
const retryService = new RetryService({ maxRetries: 3, retryDelay: 1000 });

// Test logging
const loggingService = new LoggingService('TestService');

// Mock services for testing
const mockAIService = {
  sendMessage: jest.fn().mockResolvedValue(mockResponse)
};
``` 