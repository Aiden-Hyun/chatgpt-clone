# 🏗️ ChatGPT Clone - Architecture Conventions Summary

## 🚨 CRITICAL: Anti-Pattern Prevention

This architecture was refactored to eliminate major design antipatterns. Follow these patterns strictly to prevent regression.

### ❌ FORBIDDEN ANTIPATTERNS
1. **Service Locator Pattern** - Never use global service containers or singletons for dependency resolution
2. **Mixed Dependency Injection** - Be consistent across all layers; use constructor injection everywhere
3. **Business Objects in React Hooks** - Use context-based injection instead of creating use cases directly
4. **Business Logic in UI** - Keep validation, business rules, and workflows in business layer
5. **Direct Service Instantiation** - Always use interfaces and factories for cross-layer dependencies
6. **Console Logging in Non-UI Layers** - Use Logger interface for structured, contextual logging
7. **Cross-Layer Imports** - Never import directly from higher layers or skip layers

### ✅ REQUIRED PATTERNS
1. **Constructor Dependency Injection** - All dependencies injected via constructor parameters
2. **Interface Abstractions** - All cross-layer dependencies use interfaces, never concrete classes
3. **Factory Pattern** - Use UseCaseFactory for business object creation with proper dependency injection
4. **React Context Injection** - Use BusinessContextProvider for UI dependencies with session context
5. **Result Pattern** - Consistent error handling with Result<T> types instead of exceptions
6. **Interface Consistency** - Ensure interface signatures match implementations exactly
7. **Structured Logging** - Use Logger interface with contextual information for debugging

---

## 🏛️ Architecture Overview

### Layered Architecture Style
We follow a strict **5-layer architecture** with clear separation of concerns:

```
┌─────────────────────────────────────┐
│           PRESENTATION              │ ← UI Components & Hooks
├─────────────────────────────────────┤
│             BUSINESS                │ ← Business Logic & Use Cases
├─────────────────────────────────────┤
│              SERVICE                │ ← Utilities & Validators
├─────────────────────────────────────┤
│            PERSISTENCE              │ ← Data Access & Repositories
├─────────────────────────────────────┤
│             DATABASE                │ ← Schema & Migrations
└─────────────────────────────────────┘
```

### Dependency Flow Rules
- **Presentation** → **Business** → **Service** → **Persistence** → **Database**
- Higher layers can depend on lower layers through interfaces only
- Lower layers **NEVER** depend on higher layers (strict upward dependency flow)
- Cross-layer dependencies are forbidden (no skipping layers)
- All cross-layer communication must use interface abstractions

---

## 🔌 Dependency Injection Patterns

### Core Components
1. **BusinessLayerProvider** - Composition root that instantiates all concrete dependencies
2. **UseCaseFactory** - Factory creates use cases with properly injected dependencies
3. **BusinessContextProvider** - React Context provides factory to presentation components
4. **Interface Contracts** - Define clear boundaries between layers

### Layer-by-Layer DI Rules

#### Presentation Layer
- ✅ Use BusinessContextProvider to get UseCaseFactory, inject into view models
- ✅ View models receive dependencies via constructor parameters
- ✅ Pass session context from React hooks to business layer
- ❌ Never create use cases directly in hooks or components
- ❌ Never use service locator patterns or global containers

#### Business Layer
- ✅ View models receive use cases via dependency injection
- ✅ Include injected dependencies in useCallback dependency arrays
- ✅ Use cases receive repositories and services via constructor injection
- ❌ Never create dependencies inside view models or use cases
- ❌ Never import concrete implementations from persistence layer

#### Use Cases
- ✅ All dependencies injected via constructor using interface abstractions
- ✅ Accept session and context parameters for operations requiring authentication
- ❌ Never use service locator or direct instantiation patterns
- ❌ Never access global containers or singletons

#### Service Layer
- ✅ Service classes implement interfaces for cross-layer contracts
- ✅ Services are stateless utilities with pure functions
- ✅ Services return validation results using Result pattern
- ❌ Never throw exceptions; always return typed results

#### Persistence Layer
- ✅ Repositories and adapters implement business layer interfaces exactly
- ✅ Handle external service integration with proper error conversion
- ✅ Use Logger interface for structured, contextual logging
- ❌ Never log using console statements in production paths

### Interface Design Rules
- **Business Layer Interfaces** - Define contracts for business needs and repository abstractions
- **Service Layer Interfaces** - Define utility contracts for validation, logging, and ID generation
- **Interface Consistency** - Ensure method signatures match between interfaces and implementations exactly
- **Parameter Alignment** - All interface methods must have parameters that implementations actually use
- All cross-layer dependencies must use interfaces, never concrete classes

### Dependency Resolution Order
1. **Service Layer** - Initialize first (no external dependencies, pure utilities)
2. **Persistence Layer** - Initialize second (depends on service layer interfaces only)
3. **Business Layer** - Initialize third (depends on persistence + service layer interfaces)
4. **Presentation Layer** - Initialize last (depends on business layer via React Context)

---

## 📁 Folder Structure

### Root Structure
- `source/presentation/` - UI Layer
- `source/business/` - Business Logic Layer
- `source/service/` - Service/Utility Layer
- `source/persistence/` - Data Access Layer
- `source/database/` - Database Schema Layer

### Feature-Based Organization
Each layer organizes by feature:
- `business/auth/` - Authentication business logic
- `business/chat/` - Chat business logic
- `business/session/` - Session management
- `persistence/auth/` - Auth data access
- `persistence/chat/` - Chat data access

---

## 📝 Naming Conventions

### Files & Directories
- **PascalCase** - Components, Classes, Types
- **camelCase** - Functions, Variables, Files
- **kebab-case** - Directory names
- **SCREAMING_SNAKE_CASE** - Constants

### Prefixes & Suffixes
- **I** prefix for interfaces (`IUserRepository`)
- **UseCase** suffix for business operations
- **Repository** suffix for data access
- **Adapter** suffix for external integrations
- **Validator** suffix for validation services
- **Mapper** suffix for data transformation

### Component Naming
- **index.tsx** - Main component export
- **ComponentName.styles.ts** - Component styles
- **ComponentName.types.ts** - Component types
- **useComponentName.ts** - Component hooks

---

## 🏗️ Layer Responsibilities

### Presentation Layer
**Responsibilities:**
- React components and UI logic
- Form handling and user input
- Navigation and routing
- UI state management
- Empty field validation only

**Dependencies:** Business layer only

### Business Layer
**Responsibilities:**
- Business logic and rules
- Use cases and workflows
- Domain entities and value objects
- Business validation
- View models for React integration

**Dependencies:** Service and Persistence layers

### Service Layer
**Responsibilities:**
- Utility functions and helpers
- Validation services
- Logging and monitoring
- ID generation
- Pure, stateless operations

**Dependencies:** None (base layer)

### Persistence Layer
**Responsibilities:**
- Data access and storage
- External API integration
- Repository implementations
- Data mapping and transformation
- Adapter pattern for external services

**Dependencies:** Service layer only

### Database Layer
**Responsibilities:**
- Database schema definitions
- Migration scripts
- Database constraints and indexes
- Table relationships

**Dependencies:** None

---

## 🚨 Error Handling Patterns

### Result Pattern Implementation
Use consistent **Result<T>** pattern instead of exceptions for predictable error handling.

#### Standard Types
- `Result<T>` - Union of Success<T> | Failure
- `Success<T>` - Contains data property
- `Failure` - Contains error and optional isNetworkError
- `AsyncResult<T>` - Promise<Result<T>>

#### Helper Functions
- `createSuccess(data)` - Create success result
- `createFailure(error, isNetworkError?)` - Create failure result
- `isSuccess(result)` - Type guard for success
- `isFailure(result)` - Type guard for failure
- `fromLegacyResult(legacy)` - Convert existing patterns

### Error Handling by Layer

#### Presentation Layer
- Handle UI-specific concerns only (empty fields, form validation)
- Display error messages to users in appropriate UI components
- Never handle business validation (delegate to business layer)
- Use error boundaries for unhandled React errors

#### Business Layer
- Handle business rule validation (password matching, business constraints)
- Return Result<T> from all use cases that can fail
- Log business errors using Logger interface with contextual information
- Transform domain-specific errors for presentation layer consumption

#### Service Layer
- Return validation results using Result pattern, never throw
- Validate input formats and constraints (email format, length limits)
- Pure validation without side effects or external dependencies
- Use Logger interface for service-level debugging information

#### Persistence Layer
- Handle external service errors (API failures, database errors)
- Convert third-party errors to our unified Result format
- Detect and classify network errors vs application errors
- Log persistence errors using Logger interface with operation context
- Never leak external service error details to business layer

### Error Boundaries and Logging
- Never throw exceptions across layer boundaries
- Always return Result<T> for operations that can fail
- Log errors at the layer where they occur using Logger interface
- Transform errors when crossing layer boundaries to hide implementation details
- Preserve error context (network errors, validation errors, business rule violations)
- Use structured logging with contextual information for debugging
- Replace all console logging with Logger interface in non-UI layers

---

## 📦 Import/Export Patterns

### Import Rules
- Import from immediate child layers only
- Use barrel exports (`index.ts`) for clean imports
- Group imports by layer (external, business, service, etc.)
- Use relative imports within same feature
- Use absolute imports across features

### Export Rules
- Barrel exports in each directory
- Export interfaces from business layer
- Export implementations from persistence layer
- Re-export commonly used types

### **Stateful Test Harnesses**
- Test components or harnesses must maintain state to mimic real-world persistence.
- Use `AsyncStorage` or other mechanisms to store and reuse identifiers (like room IDs) across sessions.
- Avoid "reset-on-refresh" behavior in tests for persistent features, as it can mask underlying bugs.

---

## 🧪 Testing Conventions

### Unit Testing
- Test individual classes and functions
- Mock all external dependencies
- Use dependency injection for easy mocking
- Test business logic thoroughly
- Test error cases and edge cases

### Integration Testing
- Test layer interactions
- Test real database operations
- Test API integrations
- Use test databases
- Clean up after tests

### Testing with DI
- Easy to mock with dependency injection
- Inject mock dependencies via constructor
- Avoid global state in tests
- Use interface mocks

---

## 🔄 Git Workflow

### Branch Naming
- `feature/auth-implementation`
- `feature/session-management`
- `fix/dependency-injection`
- `refactor/layered-architecture`

### Commit Messages
- `feat: Add user authentication system`
- `fix: Resolve undefined component import error`
- `refactor: Improve chat message rendering performance`

### Workflow Rules
- Before starting: `git pull origin main`
- After completing: `git add . && git commit -m "message" && git push`
- Push frequently (at least daily)
- Never let more than 3 commits accumulate
- Push immediately after fixing critical bugs

---

## 🎯 TypeScript Conventions

### Type Definitions
- Define interfaces for all contracts
- Use type unions for state management
- Avoid `any` type
- Use generic types when appropriate
- Export types from dedicated files

### Strict Rules
- Enable strict mode in tsconfig
- No implicit any
- Strict null checks
- No unused locals or parameters

---

## 📊 Implementation Guidelines

### Real Implementation Rules
- **Never use mocks** in production code paths; only allow mock fallbacks in development mode within adapters
- **Study existing patterns** in `/src` for payload shapes, query structures, and error handling; mirror them exactly in `source/`
- **Use actual external services** end-to-end in adapters and repositories for all database and API operations
- **Implement proper logging** using Logger interface with structured context instead of console statements
- **Ensure interface consistency** between business layer contracts and persistence layer implementations
- **Use Result pattern** consistently across all layers for predictable error handling

### Supabase Implementation
- **Session Handling**: Pass Session objects to all database operations; use session.user.id for ownership filters
- **Data Type Consistency**: Match exact data types from existing patterns; validate against schema
- **Query Patterns**: Follow established select/order/filter patterns from existing services
- **Session Management**: Implement proper authentication flow with local and secure storage persistence
- **Error Handling**: Use Logger interface instead of console statements; convert Supabase errors to Result pattern
- **Security**: Enforce ownership with session-based filters; never trust client-provided identifiers
- **Performance**: Use appropriate limits and avoid N+1 queries; select minimal required fields

### AI API Implementation
- **Payload Structure**: Match existing ChatAPIService payload structure with proper typing
- **Authentication**: Include Bearer token authorization with fresh token management
- **Error Classification**: Use Logger interface; classify network vs API failures; return Result pattern
- **Development Mode**: Provide mock fallbacks only in development mode; never in production paths
- **Response Processing**: Extract content, usage tokens, and timing; return via Result pattern

### Device API Implementation  
- **Storage Strategy**: Use LocalStorageAdapter for general data; SecureStorageAdapter for sensitive values
- **Key Management**: Maintain key registries for cleanup operations; implement TTL checks
- **Cross-Platform**: Support web and React Native with appropriate fallbacks and feature detection
- **Clipboard Operations**: Implement ClipboardAdapter with web navigator.clipboard and native fallbacks
- **Platform Detection**: Use Platform.OS for branching; prefer feature detection over platform detection

---

## 🚀 Implementation Priority

### High Priority
1. Authentication features (Sign In/Up/Out)
2. Session management
3. Chat messaging functionality
4. Error handling implementation

### Medium Priority
1. Advanced chat features
2. User profile management
3. Settings and preferences
4. Performance optimizations

### Low Priority
1. Advanced UI features
2. Analytics and tracking
3. Advanced error reporting
4. Feature flags and A/B testing

---

## ✅ Implementation Checklist

### Before Implementing Any Feature
- [ ] Design interfaces for all layer interactions with exact method signatures
- [ ] Plan dependency injection structure using constructor injection
- [ ] Define error handling strategy using Result pattern consistently
- [ ] Create factory methods for object creation with proper dependency injection
- [ ] Implement structured logging using Logger interface (no console statements)
- [ ] Ensure interface consistency between contracts and implementations
- [ ] Follow naming conventions and architectural patterns
- [ ] Document business rules and constraints clearly
- [ ] Verify no antipatterns are introduced (especially Service Locator)
- [ ] Test with real external services (no mocks in production paths)

### Architecture Quality Gates
- [ ] No cross-layer imports except through interfaces
- [ ] No console logging in business, service, or persistence layers
- [ ] All use cases created via UseCaseFactory with dependency injection
- [ ] All repository interfaces match implementation signatures exactly
- [ ] Session context properly passed from presentation to business layer
- [ ] Result pattern used consistently for error handling
- [ ] Logger interface used for all non-UI logging needs
