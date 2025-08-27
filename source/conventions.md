# 🏗️ ChatGPT Clone - Architecture Conventions

## 🚨 CRITICAL: Anti-Pattern Prevention

**This architecture was refactored to eliminate major design antipatterns. Follow these patterns strictly to prevent regression.**

### ❌ **FORBIDDEN ANTIPATTERNS**

1. **Service Locator Pattern** - Never use global service containers
2. **Mixed Dependency Injection** - Be consistent across all layers  
3. **Business Objects in React Hooks** - Use context-based injection
4. **Business Logic in UI** - Keep validation in business layer
5. **Direct Service Instantiation** - Always use interfaces and factories

### ✅ **REQUIRED PATTERNS**

1. **Constructor Dependency Injection** - All dependencies injected via constructor
2. **Interface Abstractions** - All cross-layer dependencies use interfaces
3. **Factory Pattern** - Use UseCaseFactory for business object creation
4. **React Context Injection** - Use BusinessContextProvider for UI dependencies
5. **Result Pattern** - Consistent error handling with Result<T> types

---

## 📋 Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Dependency Injection Patterns](#dependency-injection-patterns)
3. [Folder Structure](#folder-structure)
4. [Naming Conventions](#naming-conventions)
5. [Layer Responsibilities](#layer-responsibilities)
6. [Feature-Based Organization](#feature-based-organization)
7. [Import/Export Patterns](#importexport-patterns)
8. [Code Organization Rules](#code-organization-rules)
9. [Error Handling Patterns](#error-handling-patterns)
10. [Git Workflow](#git-workflow)
11. [TypeScript Conventions](#typescript-conventions)
12. [Testing Conventions](#testing-conventions)

---

## 🏛️ Architecture Overview

### **Layered Architecture Style**
We follow a **5-layer architecture** with clear separation of concerns:

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

### **Dependency Flow**
- **Presentation** → **Business** → **Service** → **Persistence** → **Database**
- Higher layers can depend on lower layers
- Lower layers **NEVER** depend on higher layers
- Cross-layer dependencies are forbidden

---

## 🔌 Dependency Injection Patterns

### **Overview**
We use **Constructor Dependency Injection** with **Factory Pattern** to eliminate service locator antipatterns and ensure testable, maintainable code.

### **Core Components**

#### **1. BusinessLayerProvider**
```typescript
// ✅ CORRECT - Single source of truth for business dependencies
export class BusinessLayerProvider {
  constructor() {
    this.initializeDependencies();
    this.useCaseFactory = new UseCaseFactory(/* injected deps */);
  }
}
```

#### **2. UseCaseFactory**
```typescript
// ✅ CORRECT - Factory creates use cases with injected dependencies
export class UseCaseFactory {
  constructor(
    private userRepository: IUserRepository,
    private messageValidator: IMessageValidator,
    // ... all dependencies injected
  ) {}

  createSignInUseCase(): SignInUseCase {
    return new SignInUseCase(this.userRepository, this.sessionRepository);
  }
}
```

#### **3. React Context Provider**
```typescript
// ✅ CORRECT - Context provides dependencies to React components
export function BusinessContextProvider({ children }: Props) {
  const businessProvider = useMemo(() => new BusinessLayerProvider(), []);
  
  return (
    <BusinessContext.Provider value={{ useCaseFactory: businessProvider.getUseCaseFactory() }}>
      {children}
    </BusinessContext.Provider>
  );
}
```

### **Layer-by-Layer DI Rules**

#### **Presentation Layer**
```typescript
// ✅ CORRECT - Use context to get factory, inject into view models
export function useSignInForm() {
  const useCaseFactory = useUseCaseFactory();
  const signInViewModel = useSignInViewModel(
    useCaseFactory.createSignInUseCase()
  );
  // ...
}

// ❌ WRONG - Never create use cases directly
export function useSignInForm() {
  const signInUseCase = new SignInUseCase(/* ... */); // ❌ Antipattern
}
```

#### **Business Layer**
```typescript
// ✅ CORRECT - View models receive use cases via dependency injection
export function useSignInViewModel(signInUseCase: SignInUseCase) {
  const signIn = useCallback(async (email, password) => {
    return await signInUseCase.execute({ email, password });
  }, [signInUseCase]); // ✅ Proper dependency in array
}

// ❌ WRONG - Never create dependencies inside view models
export function useSignInViewModel() {
  const container = DependencyContainer.getInstance(); // ❌ Service Locator
  const signInUseCase = new SignInUseCase(/* ... */); // ❌ Direct instantiation
}
```

#### **Use Cases**
```typescript
// ✅ CORRECT - All dependencies injected via constructor
export class SignInUseCase {
  constructor(
    private userRepository: IUserRepository,        // ✅ Interface
    private sessionRepository: ISessionRepository   // ✅ Interface
  ) {}
}

// ❌ WRONG - Never use service locator or direct instantiation
export class SignInUseCase {
  async execute() {
    const repo = ServiceLocator.get('UserRepository'); // ❌ Service Locator
    const session = new SessionRepository();           // ❌ Direct instantiation
  }
}
```

#### **Service Layer**
```typescript
// ✅ CORRECT - Service classes implement interfaces
export class Logger implements ILogger {
  info(message: string, context?: LogContext): void {
    // Implementation
  }
}

// ✅ CORRECT - Services are stateless utilities
export class MessageValidator implements IMessageValidator {
  validateContent(content: string): ValidationResult {
    // Pure validation logic
  }
}
```

#### **Persistence Layer**
```typescript
// ✅ CORRECT - Repositories implement business interfaces
export class UserRepository implements IUserRepository {
  constructor(
    private authAdapter: SupabaseAuthAdapter = new SupabaseAuthAdapter(),
    private userMapper: UserMapper = new UserMapper()
  ) {}
}

// ✅ CORRECT - Adapters handle external service integration
export class SupabaseAuthAdapter {
  async signIn(email: string, password: string): Promise<SupabaseAuthResult> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    // Handle response
  }
}
```

### **Interface Design Rules**

#### **Business Layer Interfaces** (Define contracts for business needs)
```typescript
// ✅ CORRECT - Business-focused interface
export interface IUserRepository {
  authenticate(email: string, password: string): Promise<AuthResult>;
  create(userData: CreateUserData): Promise<CreateUserResult>;
  findByEmail(email: string): Promise<User | null>;
}
```

#### **Service Layer Interfaces** (Define utility contracts)
```typescript
// ✅ CORRECT - Service utility interface
export interface ILogger {
  info(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
  child(prefix: string): ILogger;
}
```

### **Dependency Resolution Order**
1. **Service Layer** - Initialize first (no dependencies)
2. **Persistence Layer** - Depends on service layer
3. **Business Layer** - Depends on persistence + service layers  
4. **Presentation Layer** - Depends on business layer

### **Testing with DI**
```typescript
// ✅ CORRECT - Easy to mock with DI
const mockUserRepository = {
  authenticate: jest.fn().mockResolvedValue({ success: true, user: mockUser })
} as IUserRepository;

const signInUseCase = new SignInUseCase(mockUserRepository, mockSessionRepository);

// ❌ WRONG - Hard to test with service locator
// ServiceLocator.register('UserRepository', mockUserRepository); // Global state issues
```

### **Exposing Dependencies to the Presentation Layer**
While repositories and other dependencies are private within the `UseCaseFactory`, view models in the Presentation Layer sometimes need direct access (e.g., to load initial data).

```typescript
// ✅ CORRECT - Add public getter methods to the factory for required dependencies.
export class UseCaseFactory {
  // ... constructor ...

  // Getter methods for repositories (needed by view models)
  public getMessageRepository(): IMessageRepository {
    return this.messageRepository;
  }
}

// ✅ CORRECT - Use the getter in the Presentation Layer.
// ChatInterface.tsx
const { useCaseFactory } = useBusinessContext();
const { messages, loadMessages } = useChatViewModel(userId, {
  //... use cases ...
  messageRepository: useCaseFactory.getMessageRepository(), // Correctly injected
  //...
});

// ❌ WRONG - Attempting to access private members directly.
const repo = useCaseFactory['messageRepository']; // Fails, as it's private.
```

---

## 📁 Folder Structure

### **Root Structure**
```
source/
├── presentation/     # UI Layer
├── business/        # Business Logic Layer
├── service/         # Service Layer
├── persistence/     # Data Access Layer
└── index.ts         # Main exports
```

### **Feature-Based Organization**
Each layer is organized by **business features** rather than technical concerns:

```
source/
├── presentation/
│   ├── auth/           # Authentication UI
│   │   ├── components/
│   │   ├── hooks/
│   │   └── index.ts
│   ├── session/        # Session Management UI
│   │   ├── components/
│   │   ├── hooks/
│   │   └── index.ts
│   └── [feature]/      # Future features
├── business/
│   ├── auth/           # Authentication Business Logic
│   │   ├── entities/
│   │   ├── use-cases/
│   │   ├── view-models/
│   │   └── index.ts
│   ├── session/        # Session Business Logic
│   │   ├── entities/
│   │   ├── use-cases/
│   │   ├── view-models/
│   │   └── index.ts
│   └── [feature]/      # Future features
├── service/
│   ├── auth/           # Authentication Services
│   │   ├── validators/
│   │   ├── generators/
│   │   └── index.ts
│   ├── session/        # Session Services
│   │   ├── validators/
│   │   ├── utils/
│   │   └── index.ts
│   ├── shared/         # Cross-feature Services
│   │   ├── utils/
│   │   └── index.ts
│   └── [feature]/      # Future features
├── persistence/
│   ├── auth/           # Authentication Data Access
│   │   ├── repositories/
│   │   ├── adapters/
│   │   ├── mappers/
│   │   └── index.ts
│   ├── session/        # Session Data Access
│   │   ├── repositories/
│   │   ├── adapters/
│   │   ├── mappers/
│   │   └── index.ts
│   └── [feature]/      # Future features
└── index.ts
```

---

## 🏷️ Naming Conventions

### **Files & Folders**
- **PascalCase**: Components, Classes, Interfaces, Types
- **camelCase**: Functions, Variables, Hooks, Files
- **kebab-case**: Folders, URLs, CSS classes
- **UPPER_SNAKE_CASE**: Constants, Enums

### **Specific Naming Patterns**

#### **Components**
```typescript
// ✅ Correct
SignInForm.tsx
SessionStatus.tsx
UserProfile.tsx

// ❌ Incorrect
signin-form.tsx
session_status.tsx
userprofile.tsx
```

#### **Hooks**
```typescript
// ✅ Correct
useSignInForm.ts
useSessionStatus.ts
useChatViewModel.ts

// ❌ Incorrect
useSignInFormHook.ts
use_session_status.ts
useChat.ts
```

#### **Use Cases**
```typescript
// ✅ Correct
SignInUseCase.ts
RefreshSessionUseCase.ts
SendMessageUseCase.ts

// ❌ Incorrect
signInUseCase.ts
refresh_session_use_case.ts
SendMessage.ts
```

#### **View Models**
```typescript
// ✅ Correct
useSignInViewModel.ts
useSessionViewModel.ts
useChatViewModel.ts

// ❌ Incorrect
useSignInVM.ts
use_session_view_model.ts
SignInViewModel.ts
```

#### **Repositories**
```typescript
// ✅ Correct
UserRepository.ts
SessionRepository.ts
MessageRepository.ts

// ❌ Incorrect
userRepository.ts
session_repository.ts
UserRepo.ts
```

#### **Validators**
```typescript
// ✅ Correct
EmailValidator.ts
PasswordValidator.ts
SessionValidator.ts

// ❌ Incorrect
emailValidator.ts
password_validator.ts
EmailValidation.ts
```

#### **Adapters**
```typescript
// ✅ Correct
SupabaseAuthAdapter.ts
LocalStorageAdapter.ts
SecureStorageAdapter.ts

// ❌ Incorrect
supabaseAuthAdapter.ts
local_storage_adapter.ts
SupabaseAdapter.ts
```

#### **Mappers**
```typescript
// ✅ Correct
UserMapper.ts
SessionMapper.ts
MessageMapper.ts

// ❌ Incorrect
userMapper.ts
session_mapper.ts
UserMapping.ts
```

---

## 🎯 Layer Responsibilities

### **1. 📱 Presentation Layer**

**Purpose**: Handles UI and user interactions (React Native / Expo screens, forms, buttons)

**Typical contents**:
- React/React Native components: screens, forms, buttons
- UI state (form inputs, loading states, error messages)
- Hooks that manage local UI behavior (e.g., `useSignInForm`, `useChatScroll`)

**Can do**:
- Call business layer via view models or injected hooks
- Handle presentation-level validation (like "field is empty")

**Must NOT**:
- Contain business rules (e.g., rate limits, token caps)
- Make network/database/API calls (like `supabase.from()` or `fetch()`)

**What goes here**:
- `.tsx` files (React components)
- Custom hooks for UI logic
- Component-specific types
- UI utilities

**What doesn't belong**:
- Business logic
- Data access
- External API calls
- Complex calculations

### **2. 🧠 Business Layer**

**Purpose**: Implements application-specific logic and **use cases** (like Sign In, Send Message, Register)

**Typical contents**:
- `useSignInViewModel.ts`, `SendMessageUseCase.ts`
- Domain entities (`User`, `Message`, `Room`)
- Input validation schemas (Zod)
- Business rules (length limits, permissions, state transitions)
- View models (hooks that orchestrate use cases and manage data state)

**Can do**:
- Compose services and adapters via interfaces
- Emit domain events (`UserSignedInEvent`)
- Use pure services like `Tokenizer`, `Slugger`, `Clock`

**Must NOT**:
- Call Supabase, OpenAI, or other external SDKs directly
- Import infrastructure code (SDKs, DBs, env vars, etc.)

**What goes here**:
- Business entities (User, UserSession, etc.)
- Use cases (SignInUseCase, RefreshSessionUseCase, etc.)
- View models (useSignInViewModel, etc.)
- Business-specific types and interfaces

**What doesn't belong**:
- UI components
- Data access implementation
- External service calls
- Technical utilities

### **3. 🧰 Service Layer** (a.k.a. Open Layer or Shared Services)

**Purpose**: Provide **pure, reusable helpers** that have no side effects and no external dependencies

**Typical contents**:
- `Tokenizer.ts`, `TextSanitizer.ts`, `Logger.ts`
- `Clock.ts`, `IDGenerator.ts`
- Token counters, profanity filters, date formatters

**Can do**:
- Be imported by any other layer (including presentation)
- Be used inside business logic or view models

**Must NOT**:
- Use Supabase, fetch, localStorage, etc.
- Mutate global state or perform I/O

**What goes here**:
- Validators (EmailValidator, PasswordValidator, etc.)
- Generators (IdGenerator, TokenGenerator, etc.)
- Utilities (Logger, ExpiryCalculator, etc.)
- Shared services

**What doesn't belong**:
- Business logic
- UI components
- Data access
- Feature-specific logic

### **4. 🗃️ Persistence Layer**

**Purpose**: Implements **I/O operations** like storing, retrieving, and mutating data — also known as the "infrastructure adapter" layer.

**Typical contents**:
- Repositories: `SupabaseUserRepository.ts`, `MessageRepository.ts`
- External API adapters: `OpenAIProvider.ts`, `SignInAPI.ts`
- Mappers: `UserMapper.ts`, `MessageMapper.ts` (to/from DTO)

**Can do**:
- Make real SDK/API calls (`supabase.from().insert(...)`)
- Translate between domain entities and DB models
- Implement interfaces from the Business Layer

**Must NOT**:
- Contain domain/business logic (e.g., permission checks, validation)
- Be imported into Presentation or Business (without interface abstraction)

**What goes here**:
- Repositories (UserRepository, SessionRepository, etc.)
- Adapters (SupabaseAuthAdapter, LocalStorageAdapter, etc.)
- Mappers (UserMapper, SessionMapper, etc.)
- Data access interfaces

**What doesn't belong**:
- Business logic
- UI components
- Validation logic
- External service implementation details

### **5. 🧾 Database Layer**

**Purpose**: Passive definitions of the **data schema**. This layer defines what the data looks like, not how it's used.

**Typical contents**:
- SQL files: `messages.sql`, `users.sql`
- Supabase migrations (`supabase/migrations/**`)
- RLS (Row-Level Security) policies
- Indexes and constraints

**Can do**:
- Define relationships, constraints, and security rules
- Be executed or migrated as part of CI/CD or Supabase CLI

**Must NOT**:
- Contain application logic or app-specific rules
- Be directly imported into application code

---

## 🔁 Summary Table

| Layer            | Role                             | Can Import From                   | Can Be Used By              |
| ---------------- | -------------------------------- | --------------------------------- | --------------------------- |
| **Presentation** | UI, screens, form interaction    | `business/`, `services/`          | End-users                   |
| **Business**     | App logic, validation, use cases | `services/` (pure), `interfaces/` | `presentation/`             |
| **Services**     | Pure helpers (tokenizer, etc.)   | (none)                            | All layers                  |
| **Persistence**  | DB, API, I/O adapters            | `database/`                       | `business/` (via interface) |
| **Database**     | Migrations, tables, RLS          | (none)                            | `persistence/` (via SQL)    |

---

## 💡 Real-Life Example: `SignIn`

| Layer                                     | What it does                                        |
| ----------------------------------------- | --------------------------------------------------- |
| `presentation/components/SignInForm.tsx`  | Shows form, handles input                           |
| `presentation/hooks/useSignIn.ts`         | Calls `useSignInViewModel()` from business          |
| `business/hooks/useSignInViewModel.ts`    | Validates with Zod, calls use case                  |
| `business/usecases/SignInUseCase.ts`      | Validates logic, creates User, delegates to adapter |
| `business/interfaces/IAuthProvider.ts`    | Interface: `signIn(email, password)`                |
| `persistence/auth/SupabaseAuthAdapter.ts` | Calls `supabase.auth.signInWithPassword()`          |
| `database/schemas/users.sql`              | Defines `users` table + constraints                 |

---

## 🔄 Feature-Based Organization

### **Feature Structure**
Each feature follows the same internal structure:

```
feature/
├── components/     # UI components (presentation only)
├── hooks/         # React hooks (presentation only)
├── entities/      # Business entities (business only)
├── use-cases/     # Business logic (business only)
├── view-models/   # Presentation logic (business only)
├── validators/    # Input validation (service only)
├── generators/    # ID/Token generation (service only)
├── utils/         # Feature utilities (service only)
├── repositories/  # Data access (persistence only)
├── adapters/      # External integrations (persistence only)
├── mappers/       # Data transformation (persistence only)
└── index.ts       # Feature exports
```

### **Feature Naming**
- Use **singular, descriptive names**
- Examples: `auth`, `session`, `chat`, `user`, `theme`
- Avoid generic names like `common`, `shared`, `utils`

### **Cross-Feature Dependencies**
- Use `shared/` folder for cross-feature utilities
- Keep feature-specific code within the feature folder
- Minimize dependencies between features

---

## 📤 Import/Export Patterns

### **Index Files**
Every feature folder has an `index.ts` file that exports all public APIs:

```typescript
// source/presentation/auth/index.ts
export { SignInForm } from './components/SignInForm';
export { SignUpForm } from './components/SignUpForm';
export { SignOutButton } from './components/SignOutButton';

export { useSignInForm } from './hooks/useSignInForm';
export { useSignUpForm } from './hooks/useSignUpForm';
export { useSignOutButton } from './hooks/useSignOutButton';
```

### **Main Index File**
The root `source/index.ts` exports from feature folders:

```typescript
// source/index.ts
// Presentation Layer
export * from './presentation/auth';
export * from './presentation/session';

// Business Layer
export * from './business/auth';
export * from './business/session';

// Service Layer
export * from './service/auth';
export * from './service/session';
export * from './service/shared';

// Persistence Layer
export * from './persistence/auth';
export * from './persistence/session';
```

### **Import Paths**
Use relative paths within the same layer, absolute paths across layers:

```typescript
// ✅ Within same layer (relative)
import { SignInForm } from './components/SignInForm';
import { useSignInForm } from '../hooks/useSignInForm';

// ✅ Across layers (absolute from source)
import { User } from '../../../business/auth/entities/User';
import { Logger } from '../../../service/shared/utils/Logger';
```

---

## 📋 Code Organization Rules

### **Single Responsibility Principle**
- Each file has one clear purpose
- Each function/class has one responsibility
- Keep files focused and cohesive

### **Dependency Direction**
- Higher layers can import from lower layers
- Lower layers **NEVER** import from higher layers
- No circular dependencies allowed

### **File Size Guidelines**
- **Components**: 50-200 lines
- **Hooks**: 30-100 lines
- **Use Cases**: 50-150 lines
- **View Models**: 30-80 lines
- **Repositories**: 50-120 lines
- **Validators**: 20-60 lines

### **Function Guidelines**
- **Single purpose**: One clear responsibility
- **Small size**: 10-30 lines maximum
- **Descriptive names**: Clear intent
- **Pure functions**: When possible

---

## 🚨 Error Handling Patterns

### **Result Pattern Implementation**
We use a consistent **Result<T>** pattern instead of exceptions for predictable error handling.

#### **Standard Result Types**
```typescript
// ✅ CORRECT - Use Result pattern for predictable errors
export type Result<T> = Success<T> | Failure;

export interface Success<T> {
  success: true;
  data: T;
  error?: never;
}

export interface Failure {
  success: false;
  data?: never;
  error: string;
  isNetworkError?: boolean;
}
```

#### **Creating Results**
```typescript
// ✅ CORRECT - Use helper functions
import { createSuccess, createFailure } from '../shared/types/Result';

// Success case
return createSuccess(userData);

// Failure case
return createFailure('User not found');

// Network error case  
return createFailure('Connection failed', true);
```

#### **Consuming Results**
```typescript
// ✅ CORRECT - Use type guards for safety
const result = await userRepository.authenticate(email, password);

if (isSuccess(result)) {
  // TypeScript knows result.data exists
  console.log('User:', result.data);
} else {
  // TypeScript knows result.error exists
  console.error('Error:', result.error);
  if (result.isNetworkError) {
    // Handle network-specific errors
  }
}
```

#### **Converting Legacy Patterns**
```typescript
// ✅ CORRECT - Convert existing patterns to Result<T>
import { fromLegacyResult } from '../shared/types/Result';

const legacyResponse = { success: true, data: user, error: null };
const result = fromLegacyResult(legacyResponse);
```

### **Error Handling by Layer**

#### **Presentation Layer**
```typescript
// ✅ CORRECT - Handle UI-specific concerns only
export function useSignInForm() {
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async () => {
    // Only validate empty fields (UI concern)
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    
    // Pass to business layer for business validation
    try {
      await signInViewModel.signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    }
  };
}

// ❌ WRONG - Business validation in UI
if (password.length < 8) {
  setError('Password too short'); // Business rule in UI layer
}
```

#### **Business Layer**
```typescript
// ✅ CORRECT - Handle business rule validation
export class SignUpUseCase {
  async execute(request: SignUpRequest): Promise<Result<User>> {
    // Business validation
    if (request.password !== request.confirmPassword) {
      return createFailure('Passwords do not match');
    }
    
    const emailValidation = EmailValidator.validate(request.email);
    if (!emailValidation.isValid) {
      return createFailure(emailValidation.error);
    }
    
    // Delegate to persistence layer
    const result = await this.userRepository.create(request);
    return result;
  }
}
```

#### **Service Layer**
```typescript
// ✅ CORRECT - Return validation results, don't throw
export class MessageValidator implements IMessageValidator {
  validateContent(content: string): ValidationResult {
    if (content.length === 0) {
      return { isValid: false, error: 'Content cannot be empty' };
    }
    
    if (content.length > this.MAX_CONTENT_LENGTH) {
      return { isValid: false, error: 'Content too long' };
    }
    
    return { isValid: true };
  }
}
```

#### **Persistence Layer**
```typescript
// ✅ CORRECT - Handle external service errors
export class SupabaseAuthAdapter {
  async signIn(email: string, password: string): Promise<SupabaseAuthResult> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        // Convert Supabase error to our format
        const isNetworkError = this.isNetworkError(error);
        return { success: false, error: error.message, isNetworkError };
      }
      
      return { success: true, data, user: data.user, session: data.session };
    } catch (error) {
      // Handle unexpected errors
      const errorMessage = error instanceof Error ? error.message : 'Unexpected error';
      return { success: false, error: errorMessage, isNetworkError: true };
    }
  }
}
```

### **State Updates with Partial Success**
When a use case involves multiple steps (e.g., save a user message, then get an AI response), the state updates in the view model must account for partial success.

```typescript
// ✅ CORRECT - Handle cases where the user's action succeeded but a follow-up action failed.
const result = await sendMessageUseCase.execute(...);

if (result.success) {
  // Full success: update with both messages
  setState(prev => ({ ...prev, messages: [...prev.messages, result.userMessage, result.assistantMessage] }));
} else if (result.userMessage) {
  // Partial success: User message was saved, but AI failed.
  // Update the UI with the user's message and show an error.
  setState(prev => ({ ...prev, messages: [...prev.messages, result.userMessage], error: result.error }));
} else {
  // Total failure
  setState(prev => ({ ...prev, error: result.error }));
}

// ❌ WRONG - Treating partial success as total failure. This makes the user's message disappear.
if (result.success) {
  setState(prev => ({ ...prev, messages: [...prev.messages, result.userMessage, result.assistantMessage] }));
} else {
  // If the AI failed, result.success is false, and the user's own message is never shown.
  setState(prev => ({ ...prev, error: result.error }));
}
```

### **Logging Patterns**
```typescript
// ✅ CORRECT - Structured logging with context
this.logger.info('SignInUseCase: Starting authentication', { 
  email: request.email,
  timestamp: new Date().toISOString()
});

this.logger.error('SignInUseCase: Authentication failed', { 
  email: request.email,
  error: result.error,
  isNetworkError: result.isNetworkError
});

// ❌ WRONG - Unstructured logging
console.log('Login attempt'); // No context
throw new Error('Login failed'); // Throws instead of returning Result
```

### **Error Boundaries**
- **Never throw exceptions** across layer boundaries
- **Always return Result<T>** for operations that can fail
- **Log errors** at the layer where they occur
- **Transform errors** when crossing layer boundaries
- **Preserve error context** (network errors, validation errors, etc.)

---

## 🔄 Git Workflow

### **Branch Naming**
```
feature/auth-implementation
feature/session-management
bugfix/import-path-fix
refactor/feature-based-structure
```

### **Commit Messages**
Format: `type: Brief description of changes`

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `docs`: Documentation changes
- `test`: Test additions/changes
- `chore`: Maintenance tasks

**Examples**:
```
feat: Add user authentication system
fix: Resolve undefined component import error
refactor: Improve chat message rendering performance
docs: Update architecture documentation
```

### **Frequent Pushing**
- Push after completing a feature
- Push at least once per day
- Never let more than 3 commits accumulate
- Push immediately after fixing critical bugs

---

## 📝 TypeScript Conventions

### **Type Definitions**
```typescript
// ✅ Use interfaces for object shapes
interface User {
  id: string;
  email: string;
  displayName: string;
}

// ✅ Use types for unions and complex types
type AuthResult = {
  success: true;
  user: User;
} | {
  success: false;
  error: string;
};

// ✅ Use enums for constants
enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  PREMIUM = 'premium'
}
```

### **Function Signatures**
```typescript
// ✅ Use explicit return types for public APIs
export function useSignInViewModel(): SignInViewModel {
  // implementation
}

// ✅ Use interfaces for complex parameters
interface SignInParams {
  email: string;
  password: string;
}

export async function signIn(params: SignInParams): Promise<SignInResult> {
  // implementation
}
```

### **Error Handling**
```typescript
// ✅ Use Result pattern for operations that can fail
interface Result<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ✅ Throw errors for unexpected failures
if (!user) {
  throw new Error('User not found');
}
```

---

## 🧪 Testing Conventions

### **Test File Naming**
```
ComponentName.test.tsx
useCaseName.test.ts
repositoryName.test.ts
validatorName.test.ts
```

### **Test Organization**
```typescript
describe('SignInUseCase', () => {
  describe('execute', () => {
    it('should successfully sign in with valid credentials', () => {
      // test implementation
    });

    it('should fail with invalid credentials', () => {
      // test implementation
    });
  });
});
```

### **Stateful Test Harnesses**
When creating temporary components for testing features (`TestChatInterface.tsx`), ensure they correctly mimic real-world state persistence to avoid misleading bugs.

```typescript
// ✅ CORRECT - Use AsyncStorage or another mechanism to persist IDs across reloads.
const storageKey = `test_room_${userId}`;

useEffect(() => {
  const setupTestRoom = async () => {
    // 1. Try to get a saved room ID from storage.
    const savedRoomId = await AsyncStorage.getItem(storageKey);
    if (savedRoomId) {
      // 2. Verify the room still exists.
      const roomExists = await verifyRoomExists(savedRoomId);
      if (roomExists) {
        setRoomId(savedRoomId);
        return; // Reuse the existing room.
      }
    }
    // 3. If no valid room is found, create a new one and save its ID.
    const newRoom = await createNewRoom();
    await AsyncStorage.setItem(storageKey, newRoom.id);
    setRoomId(newRoom.id);
  };
  setupTestRoom();
}, []);


// ❌ WRONG - Creating a new resource on every component mount.
useEffect(() => {
  // This creates a new, empty room every time the component renders or the app refreshes.
  // It masks the fact that persistence is working, because you are always loading an empty room.
  const newRoom = await createNewRoom();
  setRoomId(newRoom.id);
}, []);
```

### **Test Structure**
- **Arrange**: Set up test data and mocks
- **Act**: Execute the function being tested
- **Assert**: Verify the expected outcome

---

## 🚀 Best Practices

### **Code Quality**
- Write self-documenting code
- Use meaningful variable and function names
- Keep functions small and focused
- Avoid deep nesting
- Use early returns to reduce complexity

### **State Updates with Partial Success**
When a use case involves multiple steps (e.g., save a user message, then get an AI response), the state updates in the view model must account for partial success.

```typescript
// ✅ CORRECT - Handle cases where the user's action succeeded but a follow-up action failed.
const result = await sendMessageUseCase.execute(...);

if (result.success) {
  // Full success: update with both messages
  setState(prev => ({ ...prev, messages: [...prev.messages, result.userMessage, result.assistantMessage] }));
} else if (result.userMessage) {
  // Partial success: User message was saved, but AI failed.
  // Update the UI with the user's message and show an error.
  setState(prev => ({ ...prev, messages: [...prev.messages, result.userMessage], error: result.error }));
} else {
  // Total failure
  setState(prev => ({ ...prev, error: result.error }));
}

// ❌ WRONG - Treating partial success as total failure. This makes the user's message disappear.
if (result.success) {
  setState(prev => ({ ...prev, messages: [...prev.messages, result.userMessage, result.assistantMessage] }));
} else {
  // If the AI failed, result.success is false, and the user's own message is never shown.
  setState(prev => ({ ...prev, error: result.error }));
}
```

### **Performance**
- Lazy load components when possible
- Memoize expensive calculations
- Use React.memo for expensive components
- Optimize re-renders with useCallback/useMemo

### **Security**
- Validate all inputs
- Sanitize user data
- Use secure storage for sensitive data
- Implement proper authentication flows

### **Maintainability**
- Write clear documentation
- Use consistent patterns
- Refactor regularly
- Keep dependencies up to date

---

## 🔍 Learning from Existing Codebase

### **How to Study `/src` for Implementation Patterns**

When implementing new features or understanding how to make API calls, **always study the existing `/src` directory first**:

#### **1. API Call Patterns**
```bash
# Study how API calls are made
grep -r "fetchJson" src/
grep -r "supabase.from" src/
grep -r "await fetch" src/
```

#### **2. Service Implementation Examples**
- **Chat API**: `src/features/chat/services/implementations/ChatAPIService.ts`
- **Supabase Services**: `src/features/chat/services/implementations/SupabaseMessageService.ts`
- **Fetch Utility**: `src/features/chat/lib/fetch.ts`

#### **3. Configuration Management**
- **App Config**: `src/shared/lib/config.ts`
- **Supabase Client**: `src/shared/lib/supabase/index.ts`
- **Constants**: `src/shared/lib/constants.ts`

#### **4. Authentication Patterns**
- **Session Management**: `src/features/auth/`
- **Token Handling**: Look for `accessToken` usage in services
- **Authorization Headers**: Study how `Authorization: Bearer` is used

#### **5. Error Handling Patterns**
```typescript
// Study existing error handling in /src
try {
  const response = await fetchJson(url, options);
  return response;
} catch (error) {
  console.error('[ServiceName] API call failed:', error);
  throw new Error('Failed to complete operation');
}
```

#### **6. Database Operations**
```typescript
// Study Supabase patterns in /src
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('column', value);

if (error) {
  console.error('Database error:', error);
  return { success: false, error: error.message };
}
```

### **🚨 CRITICAL RULE: NEVER MODIFY `/src`**

**Under NO circumstances should you modify, edit, delete, or change ANY files in the `/src` directory.**

#### **Why This Rule Exists**
- `/src` contains the **existing working codebase**
- It serves as a **reference implementation** for patterns
- Modifying it could **break the existing application**
- It's the **source of truth** for current architecture

#### **What You CAN Do**
- ✅ **Read and study** `/src` files
- ✅ **Copy patterns** from `/src` to your implementation
- ✅ **Reference** `/src` for API call examples
- ✅ **Learn** from existing service implementations
- ✅ **Use** the same configuration and utilities

#### **What You MUST NOT Do**
- ❌ **Edit** any files in `/src`
- ❌ **Delete** any files in `/src`
- ❌ **Move** files within `/src`
- ❌ **Rename** files in `/src`
- ❌ **Add** new files to `/src`
- ❌ **Modify** imports in `/src`

#### **Implementation Strategy**
1. **Study** `/src` for patterns and examples
2. **Implement** your feature in `source/` following those patterns
3. **Use** the same utilities and configurations from `/src`
4. **Test** your implementation against the existing patterns
5. **Keep** `/src` as your reference, never modify it

### **Example: Learning API Call Pattern**

```typescript
// 1. Study the pattern in /src
// src/features/chat/services/implementations/ChatAPIService.ts
const response = await fetchJson<any>(
  `${appConfig.edgeFunctionBaseUrl}/ai-chat`,
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  }
);

// 2. Implement the same pattern in source/
// source/persistence/chat/adapters/AIProvider.ts
const response = await fetchJson<any>(
  `${appConfig.edgeFunctionBaseUrl}/ai-chat`,
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${params.accessToken}`,
    },
    body: JSON.stringify(payload),
  }
);
```

---

## 🔗 Real Implementation Guidelines

### **🚨 CRITICAL: NO MOCK IMPLEMENTATIONS**

**All adapters in `/source` MUST use real external services. Mock implementations are STRICTLY FORBIDDEN.**

#### **Why No Mocks**
- Mock implementations hide integration issues
- Real implementations ensure compatibility with production
- Mock code becomes technical debt
- Real implementations provide immediate feedback

#### **Real Implementation Requirements**
- ✅ **Use actual Supabase database calls**
- ✅ **Use actual AI API endpoints** 
- ✅ **Use actual device APIs (clipboard, storage)**
- ✅ **Use actual authentication services**
- ❌ **Never use `console.log()` + `setTimeout()` as "implementation"**
- ❌ **Never return hardcoded mock data**
- ❌ **Never simulate async operations with delays**

---

## 📊 Supabase Implementation Rules

### **🔧 Database Operations**

#### **1. Required Imports**
```typescript
import { supabase } from '../../../../src/shared/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { Logger } from '../../../service/shared/utils/Logger';
```

#### **2. Session Management**
**ALWAYS pass `Session` objects to database operations:**

```typescript
// ✅ CORRECT - Pass session object
async save(messageData: MessageData, session: Session): Promise<void> {
  const { error } = await supabase
    .from('messages')
    .insert({
      user_id: session.user.id, // Use session.user.id
      content: messageData.content,
      // ... other fields
    });
}

// ❌ WRONG - Pass userId string directly
async save(messageData: MessageData, userId: string): Promise<void> {
  // This bypasses proper authentication
}
```

#### **3. Data Type Consistency**
**Match exactly with existing `/src` patterns:**

```typescript
// ✅ CORRECT - Follow /src patterns
const { data, error } = await supabase
  .from('chatrooms')
  .insert({
    room_id: parseInt(roomId), // Convert string to number if needed
    user_id: session.user.id,
    name: roomName
  })
  .select('id')
  .single();

// ❌ WRONG - Different data types than /src
const { data, error } = await supabase
  .from('chatrooms')
  .insert({
    room_id: roomId, // Wrong type
    userId: session.user.id // Wrong column name
  });
```

#### **4. Error Handling Pattern**
**Follow existing error handling from `/src`:**

```typescript
// ✅ CORRECT - Match /src error handling
try {
  const { data, error } = await supabase
    .from('table_name')
    .operation();
    
  if (error) {
    Logger.error('Operation failed', { error });
    throw error; // Let higher layers handle
  }
  
  return data;
} catch (error) {
  Logger.error('Unexpected error', { error });
  throw error;
}

// ❌ WRONG - Custom error handling that differs from /src
if (error) {
  return { success: false, error: error.message };
}
```

#### **5. Query Patterns**
**Use exact same query patterns as `/src`:**

```typescript
// ✅ CORRECT - Match existing select patterns
const { data, error } = await supabase
  .from('messages')
  .select('id, role, content, client_id') // Exact same fields
  .eq('room_id', roomId)
  .order('id', { ascending: true }); // Same ordering

// ❌ WRONG - Different query structure
const { data, error } = await supabase
  .from('messages')
  .select('*') // Different selection
  .where('room_id', roomId); // Different syntax
```

---

## 🤖 AI API Implementation Rules

### **🔧 API Call Requirements**

#### **1. Required Imports**
```typescript
import { fetchJson } from '../../../../src/features/chat/lib/fetch';
import { appConfig } from '../../../../src/shared/lib/config';
```

#### **2. Request Structure**
**Follow exact payload structure from `/src`:**

```typescript
// ✅ CORRECT - Match existing ChatAPIService payload
const payload = {
  roomId: params.roomId,
  messages: [
    {
      role: 'user',
      content: params.content
    }
  ],
  model: params.model || 'gpt-3.5-turbo',
  modelConfig: {
    tokenParameter: 'max_tokens',
    supportsCustomTemperature: true,
    defaultTemperature: 0.7
  },
  clientMessageId: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
  skipPersistence: false,
};

// ❌ WRONG - Different payload structure
const payload = {
  message: params.content, // Wrong structure
  ai_model: params.model   // Wrong field names
};
```

#### **3. Authentication Headers**
**ALWAYS include access token in Authorization header:**

```typescript
// ✅ CORRECT - Include Bearer token
const response = await fetchJson<any>(
  `${appConfig.edgeFunctionBaseUrl}/ai-chat`,
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${params.accessToken}`, // Required
    },
    body: JSON.stringify(payload),
  }
);

// ❌ WRONG - Missing authentication
const response = await fetchJson<any>(url, {
  method: 'POST',
  body: JSON.stringify(payload), // No auth header
});
```

#### **4. Response Processing**
**Handle responses exactly like `/src` implementations:**

```typescript
// ✅ CORRECT - Match existing response processing
return {
  success: true,
  content: response.content || response.choices?.[0]?.message?.content,
  tokens: response.usage?.total_tokens || Math.floor(Math.random() * 100) + 50,
  processingTime: Date.now() - startTime
};

// ❌ WRONG - Different response structure
return {
  data: response,
  ok: true
};
```

#### **5. Error Handling with Development Fallback**
**Include development fallback for reliability:**

```typescript
// ✅ CORRECT - Dev fallback for reliability
} catch (error) {
  console.error('[AIProvider] API call failed:', error);
  
  // Fallback to mock response for development
  if (__DEV__) {
    console.log('[AIProvider] Using mock response as fallback');
    const mockResponse = this.generateMockResponse(params.content);
    return {
      success: true,
      content: mockResponse,
      tokens: Math.floor(Math.random() * 100) + 50,
      processingTime: 1500
    };
  }
  
  return {
    success: false,
    error: error instanceof Error ? error.message : 'Failed to get AI response'
  };
}

// ❌ WRONG - No fallback or different error structure
} catch (error) {
  throw error;
}
```

---

## 📱 Device API Implementation Rules

### **🔧 Cross-Platform Storage**

#### **1. AsyncStorage Implementation**
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// ✅ CORRECT - Cross-platform storage
async setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
  } else {
    await AsyncStorage.setItem(key, value);
  }
}
```

#### **2. Secure Storage Implementation**
```typescript
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// ✅ CORRECT - Secure storage with web fallback
async setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value); // Less secure but functional
    await this.addKeyToRegistry(key);
  } else {
    await SecureStore.setItemAsync(key, value);
    await this.addKeyToRegistry(key);
  }
}
```

#### **3. Clipboard Implementation**
```typescript
// ✅ CORRECT - Real clipboard operations
if (Platform.OS === 'web') {
  // Use Navigator Clipboard API
  await (navigator as any).clipboard.writeText(text);
} else {
  // Use Expo Clipboard
  const Clipboard = await import('expo-clipboard');
  await (Clipboard as any).setStringAsync(text);
}

// ❌ WRONG - Mock implementation
console.log('Mock: Copying to clipboard:', text);
await new Promise(resolve => setTimeout(resolve, 100));
```

---

## 🔄 Integration Requirements

### **🔗 Authentication Integration**

#### **1. Use Existing Auth Context**
```typescript
// ✅ CORRECT - Use existing auth system
import { useAuth } from '../../../../src/features/auth/context/AuthContext';

export function useChatViewModel(userId: string) {
  const { session } = useAuth(); // Get real session
  
  const sendMessage = useCallback(async (content: string) => {
    if (!session) {
      // Handle no session case
      return;
    }
    
    const accessToken = await getAccessToken();
    // Use real session and token
  }, [session]);
}

// ❌ WRONG - Create separate auth system
const [isAuthenticated, setIsAuthenticated] = useState(false);
```

#### **2. Token Refresh Pattern**
```typescript
// ✅ CORRECT - Follow existing token refresh pattern
const getAccessToken = useCallback(async (): Promise<string | null> => {
  if (!session) return null;
  
  let accessToken = session.access_token;
  
  // Check if token is expired and refresh if needed
  if (session.expires_at && Math.floor(Date.now() / 1000) > session.expires_at) {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (!error && data.session) {
        accessToken = data.session.access_token;
      }
    } catch (refreshError) {
      console.error('Token refresh failed:', refreshError);
      return null;
    }
  }
  
  return accessToken;
}, [session]);
```

---

## ✅ Implementation Checklist

### **Before Implementing Any Feature**

- [ ] **Study existing `/src` implementation** for the same functionality
- [ ] **Identify required utilities** (`fetchJson`, `appConfig`, `supabase`)
- [ ] **Check data types and column names** in existing database calls
- [ ] **Verify authentication patterns** (Session objects, access tokens)
- [ ] **Follow existing error handling** patterns

### **After Implementation**

- [ ] **No mock implementations** remain
- [ ] **Real API calls** work with actual endpoints
- [ ] **Database operations** use real Supabase calls
- [ ] **Authentication flows** integrate with existing auth context
- [ ] **Error handling** matches existing patterns
- [ ] **Data types and structures** match `/src` implementations

### **Testing Integration**

- [ ] **API calls** return real data from endpoints
- [ ] **Database operations** actually persist/retrieve data
- [ ] **Authentication** works with real Supabase sessions
- [ ] **Cross-platform compatibility** (web, iOS, Android)
- [ ] **Error scenarios** handle network failures gracefully

---

## 🎯 Implementation Priority

1. **Study `/src` first** - Understand existing patterns
2. **Use real services** - Never implement mocks
3. **Follow exact patterns** - Data types, error handling, API structure
4. **Integrate with existing systems** - Auth, configuration, utilities
5. **Test with real data** - Ensure production compatibility

---

## 📚 References

- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [React Native Best Practices](https://reactnative.dev/docs/performance)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Git Commit Message Conventions](https://www.conventionalcommits.org/)

---

*This document should be updated as the project evolves and new conventions are established.*
