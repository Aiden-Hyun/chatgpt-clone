# 🏗️ ChatGPT Clone - Architecture Conventions

## 📋 Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Folder Structure](#folder-structure)
3. [Naming Conventions](#naming-conventions)
4. [Layer Responsibilities](#layer-responsibilities)
5. [Feature-Based Organization](#feature-based-organization)
6. [Import/Export Patterns](#importexport-patterns)
7. [Code Organization Rules](#code-organization-rules)
8. [Git Workflow](#git-workflow)
9. [TypeScript Conventions](#typescript-conventions)
10. [Testing Conventions](#testing-conventions)

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

## 📚 References

- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [React Native Best Practices](https://reactnative.dev/docs/performance)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Git Commit Message Conventions](https://www.conventionalcommits.org/)

---

*This document should be updated as the project evolves and new conventions are established.*
