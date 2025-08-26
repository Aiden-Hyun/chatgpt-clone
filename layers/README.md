# Clean Architecture Implementation

This `/layers/` folder contains a clean architecture refactoring of the ChatGPT Clone application, organized into strict layers with well-defined dependencies and responsibilities.

## 📁 Layer Structure

```
/layers/
├── presentation/     # React Native UI, screens, components
├── business/         # Use cases, domain rules, entities  
├── services/         # Pure stateless helpers
├── persistence/      # Repository implementations, adapters
└── database/         # SQL migrations, schema
```

## 🔗 Dependency Rules

| Layer | Can Import | Cannot Import | Description |
|-------|-----------|---------------|-------------|
| `presentation/` | `business/`, `services/` | `persistence/`, `database/` | React Native UI components |
| `business/` | `services/`, `persistence/` (interfaces only) | `presentation/`, `database/` | Use cases, entities, business logic |
| `services/` | None | All other layers | Pure utilities, no side effects |
| `persistence/` | `database/` only | `presentation/`, `business/` | Repository implementations |
| `database/` | None | All other layers | SQL schema, migrations |

## 🏗️ Key Features

### ✅ Clean Separation
- **No direct Supabase/OpenAI imports** in presentation or business layers
- **Pure business logic** isolated from UI concerns
- **Testable components** with dependency injection via props

### ✅ Proper Abstractions
- **Interfaces (Ports)** define contracts between layers
- **DTOs** handle data transfer between layers
- **Entities** represent domain objects with business rules
- **Use Cases** encapsulate business operations

### ✅ Dependency Inversion
- Business layer defines interfaces
- Persistence layer implements interfaces
- Presentation layer depends on business abstractions

## 📋 Usage Example

### Clean Chat Screen Implementation

```tsx
// presentation/screens/ChatScreen.tsx - Pure UI
import { ChatScreen } from '/layers/presentation/screens';
import { useChatPresentation } from '/layers/presentation/hooks';

function ChatPage({ roomId }: { roomId: number }) {
  const chatState = useChatPresentation({
    roomId,
    userId: 'user-123',
    selectedModel: 'gpt-4'
  });

  return (
    <ChatScreen
      {...chatState}
      theme={theme}
      translations={translations}
    />
  );
}
```

### Business Logic Usage

```tsx
// business/usecases/SendMessageUseCase.ts - Pure business logic
const sendMessageUseCase = new SendMessageUseCase(
  messageRepository,  // Injected dependency
  aiProvider         // Injected dependency
);

const result = await sendMessageUseCase.execute({
  content: "Hello AI",
  roomId: 123,
  userId: "user-456",
  model: "gpt-4"
});
```

### Repository Implementation

```tsx
// persistence/repositories/SupabaseMessageRepository.ts
export class SupabaseMessageRepository implements IMessageRepository {
  async saveMessages(roomId, userMsg, assistantMsg, userId) {
    // Implementation using SupabaseAdapter
  }
}
```

## 🚀 Benefits

### For Development
- **Testability**: Each layer can be tested in isolation
- **Maintainability**: Clear separation of concerns
- **Flexibility**: Easy to swap implementations (e.g., replace Supabase with Firebase)
- **Scalability**: Add new features without breaking existing code

### For Architecture
- **No Vendor Lock-in**: Business logic independent of external services
- **Clear Boundaries**: Each layer has a single responsibility
- **Dependency Control**: No circular dependencies or unwanted coupling
- **Code Reuse**: Business logic can be shared across platforms

## 🔄 Migration Strategy

The original `/src/` and `/app/` code remains unchanged. This `/layers/` implementation:

1. **Copies** relevant code from original structure
2. **Refactors** to remove architectural violations
3. **Organizes** into clean architecture layers
4. **Provides** clean interfaces for future migration

### Key Refactoring Changes

- ❌ **Removed**: Direct Supabase imports from UI components
- ❌ **Removed**: Business logic mixed with presentation
- ✅ **Added**: Clear interfaces between layers
- ✅ **Added**: Dependency injection patterns
- ✅ **Added**: Pure business entities and use cases

## 📚 File Organization

### presentation/
- `components/` - Pure UI components (no business logic)
- `screens/` - Complete screen implementations
- `hooks/` - Presentation layer hooks that connect to business

### business/
- `entities/` - Domain objects with business rules
- `usecases/` - Business operations and orchestration
- `interfaces/` - Ports for external dependencies
- `dto/` - Data transfer objects

### services/
- `logger/` - Pure logging utilities
- `validation/` - Input validation helpers
- `utils/` - Text processing, ID generation
- `tokenizer/` - Token estimation utilities

### persistence/
- `repositories/` - Repository pattern implementations
- `adapters/` - External service adapters (Supabase, OpenAI)
- `mappers/` - Entity ↔ Database mapping

### database/
- `migrations/` - SQL schema migrations
- `schemas/` - Database schema definitions
- `types/` - Database row type definitions

## 🎯 Next Steps

1. **Testing**: Add comprehensive unit tests for each layer
2. **DI Container**: Implement dependency injection container
3. **Error Handling**: Add comprehensive error boundaries
4. **Caching**: Implement caching strategies in persistence layer
5. **Validation**: Add comprehensive input validation
6. **Migration**: Gradually migrate from `/src/` to `/layers/`

---

This clean architecture implementation provides a solid foundation for scaling and maintaining the ChatGPT Clone application while following industry best practices for layered architecture design.
