// Presentation Layer
export { SignInForm } from './presentation/components/SignInForm';
export { SignOutButton } from './presentation/components/SignOutButton';
export { SignUpForm } from './presentation/components/SignUpForm';

export { useSignInForm } from './presentation/hooks/useSignInForm';
export { useSignOutButton } from './presentation/hooks/useSignOutButton';
export { useSignUpForm } from './presentation/hooks/useSignUpForm';

// Business Layer
export { User } from './business/entities/User';
export { UserSession } from './business/entities/UserSession';

export { SignInUseCase } from './business/use-cases/SignInUseCase';
export { SignOutUseCase } from './business/use-cases/SignOutUseCase';
export { SignUpUseCase } from './business/use-cases/SignUpUseCase';

export { useSignInViewModel } from './business/view-models/useSignInViewModel';
export { useSignOutViewModel } from './business/view-models/useSignOutViewModel';
export { useSignUpViewModel } from './business/view-models/useSignUpViewModel';

// Service Layer
export { IdGenerator } from './service/generators/IdGenerator';
export { Logger } from './service/utils/Logger';
export { EmailValidator } from './service/validators/EmailValidator';
export { PasswordValidator } from './service/validators/PasswordValidator';

// Persistence Layer
export { LocalStorageAdapter } from './persistence/adapters/LocalStorageAdapter';
export { SupabaseAuthAdapter } from './persistence/adapters/SupabaseAuthAdapter';
export { SessionMapper } from './persistence/mappers/SessionMapper';
export { UserMapper } from './persistence/mappers/UserMapper';
export { SessionRepository } from './persistence/repositories/SessionRepository';
export { UserRepository } from './persistence/repositories/UserRepository';

// Types
export type { SignInResult } from './business/use-cases/SignInUseCase';
export type { SignOutResult } from './business/use-cases/SignOutUseCase';
export type { SignUpResult } from './business/use-cases/SignUpUseCase';
export type { AuthResult, CreateUserResult } from './persistence/repositories/UserRepository';
export type { ValidationResult } from './service/validators/EmailValidator';
export type { PasswordStrength } from './service/validators/PasswordValidator';

